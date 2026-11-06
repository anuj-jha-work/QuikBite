package httpapi

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log/slog"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"quikbite/backend/internal/config"
	"quikbite/backend/internal/models"
	"quikbite/backend/internal/repository"

	"github.com/go-chi/chi/v5"
	"github.com/golang-jwt/jwt/v5"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"golang.org/x/crypto/bcrypt"
)

type Server struct {
	Repo   repository.Mongo
	Config config.Config
	Logger *slog.Logger
}

type contextKey string

const claimsKey contextKey = "claims"

func New(repo repository.Mongo, cfg config.Config, logger *slog.Logger) *Server {
	return &Server{Repo: repo, Config: cfg, Logger: logger}
}

func (s *Server) Routes() http.Handler {
	r := chi.NewRouter()
	r.Use(s.requestLogger, s.cors, s.bodyLimit)
	r.Get("/", func(w http.ResponseWriter, _ *http.Request) {
		writeJSON(w, http.StatusOK, map[string]string{"status": "ok", "service": "QuikBite API"})
	})
	r.Get("/healthz", func(w http.ResponseWriter, _ *http.Request) {
		writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
	})
	r.Handle("/images/*", http.StripPrefix("/images/", http.FileServer(http.Dir(s.Config.UploadDir))))

	r.Route("/api/user", func(r chi.Router) {
		r.Post("/register", s.register)
		r.Post("/login", s.login)
		r.With(s.auth).Get("/me", s.me)
	})
	r.Get("/api/food/list", s.listFoods)
	r.With(s.auth, s.admin).Post("/api/food/add", s.addFood)
	r.With(s.auth, s.admin).Put("/api/food/update/{id}", s.updateFood)
	r.With(s.auth, s.admin).Delete("/api/food/remove/{id}", s.removeFood)
	r.Route("/api/cart", func(r chi.Router) {
		r.Use(s.auth)
		r.Get("/get", s.getCart)
		r.Post("/add", s.addCart)
		r.Post("/remove", s.removeCart)
		r.Post("/update", s.updateCart)
	})
	r.Route("/api/order", func(r chi.Router) {
		r.Use(s.auth)
		r.Post("/place", s.placeOrder)
		r.Get("/userorders", s.userOrders)
		r.With(s.admin).Get("/list", s.listOrders)
		r.With(s.admin).Post("/status", s.updateStatus)
	})
	r.With(s.auth, s.admin).Get("/api/admin/dashboard", s.dashboard)
	r.With(s.auth, s.admin).Get("/api/admin/users", s.listUsers)
	r.NotFound(func(w http.ResponseWriter, req *http.Request) {
		errorJSON(w, http.StatusNotFound, "Not found - "+req.URL.Path)
	})
	return r
}

func (s *Server) requestLogger(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		s.Logger.Info("request", "method", r.Method, "path", r.URL.Path)
		next.ServeHTTP(w, r)
	})
}
func (s *Server) cors(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		origin := r.Header.Get("Origin")
		for _, allowed := range s.Config.AllowedOrigins {
			if origin == allowed {
				w.Header().Set("Access-Control-Allow-Origin", origin)
				w.Header().Set("Access-Control-Allow-Credentials", "true")
				w.Header().Add("Vary", "Origin")
				break
			}
		}
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}
func (s *Server) bodyLimit(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		r.Body = http.MaxBytesReader(w, r.Body, s.Config.MaxBodySize)
		next.ServeHTTP(w, r)
	})
}

func (s *Server) auth(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		header := r.Header.Get("Authorization")
		if !strings.HasPrefix(header, "Bearer ") {
			errorJSON(w, http.StatusUnauthorized, "Authorization token is required")
			return
		}
		token, err := jwt.Parse(strings.TrimPrefix(header, "Bearer "), func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, errors.New("unexpected signing method")
			}
			return []byte(s.Config.JWTSecret), nil
		})
		if err != nil || !token.Valid {
			errorJSON(w, http.StatusUnauthorized, "Invalid or expired token")
			return
		}
		mapClaims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			errorJSON(w, http.StatusUnauthorized, "Invalid or expired token")
			return
		}
		claims := models.Claims{ID: stringClaim(mapClaims["id"]), Name: stringClaim(mapClaims["name"]), Email: stringClaim(mapClaims["email"]), IsAdmin: boolClaim(mapClaims["isAdmin"])}
		next.ServeHTTP(w, r.WithContext(context.WithValue(r.Context(), claimsKey, claims)))
	})
}
func (s *Server) admin(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		claims, ok := r.Context().Value(claimsKey).(models.Claims)
		if !ok || !claims.IsAdmin {
			errorJSON(w, http.StatusForbidden, "Admin access required")
			return
		}
		next.ServeHTTP(w, r)
	})
}

func (s *Server) register(w http.ResponseWriter, r *http.Request) {
	var input struct {
		Name     string `json:"name"`
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	if !decodeJSON(w, r, &input) {
		return
	}
	input.Name = strings.TrimSpace(input.Name)
	input.Email = strings.ToLower(strings.TrimSpace(input.Email))
	if input.Name == "" || input.Email == "" || input.Password == "" {
		errorJSON(w, 400, "Name, email, and password are required")
		return
	}
	if len(input.Password) < 8 {
		errorJSON(w, 400, "Password must be at least 8 characters")
		return
	}
	if _, err := s.Repo.FindUser(r.Context(), bson.M{"email": input.Email}); err == nil {
		errorJSON(w, 409, "User already exists")
		return
	} else if !repository.IsNotFound(err) {
		errorJSON(w, 500, err.Error())
		return
	}
	hash, err := bcrypt.GenerateFromPassword([]byte(input.Password), 12)
	if err != nil {
		errorJSON(w, 500, "Unable to hash password")
		return
	}
	user := models.User{ID: primitive.NewObjectID(), Name: input.Name, Email: input.Email, Password: string(hash), CartData: map[string]float64{}, IsAdmin: false, CreatedAt: time.Now(), UpdatedAt: time.Now()}
	if _, err := s.Repo.Users().InsertOne(r.Context(), user); err != nil {
		errorJSON(w, 500, err.Error())
		return
	}
	writeJSON(w, 201, map[string]interface{}{"success": true, "message": "Registration successful", "token": s.token(user), "user": publicUser(user)})
}

func (s *Server) login(w http.ResponseWriter, r *http.Request) {
	var input struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	if !decodeJSON(w, r, &input) {
		return
	}
	input.Email = strings.ToLower(strings.TrimSpace(input.Email))
	if input.Email == "" || input.Password == "" {
		errorJSON(w, 400, "Email and password are required")
		return
	}
	user, err := s.Repo.FindUser(r.Context(), bson.M{"email": input.Email})
	if repository.IsNotFound(err) {
		errorJSON(w, 401, "Invalid credentials")
		return
	}
	if err != nil {
		errorJSON(w, 500, err.Error())
		return
	}
	if bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(input.Password)) != nil {
		errorJSON(w, 401, "Invalid credentials")
		return
	}
	writeJSON(w, 200, map[string]interface{}{"success": true, "message": "Login successful", "token": s.token(user), "user": publicUser(user)})
}

func (s *Server) me(w http.ResponseWriter, r *http.Request) {
	claims := r.Context().Value(claimsKey).(models.Claims)
	id, err := primitive.ObjectIDFromHex(claims.ID)
	if err != nil {
		errorJSON(w, 404, "User not found")
		return
	}
	user, err := s.Repo.FindUser(r.Context(), bson.M{"_id": id})
	if repository.IsNotFound(err) {
		errorJSON(w, 404, "User not found")
		return
	}
	if err != nil {
		errorJSON(w, 500, err.Error())
		return
	}
	writeJSON(w, 200, map[string]interface{}{"success": true, "user": publicUser(user)})
}

func (s *Server) listFoods(w http.ResponseWriter, r *http.Request) {
	foods, err := s.Repo.ListFoods(r.Context())
	if err != nil {
		errorJSON(w, 500, err.Error())
		return
	}
	if foods == nil {
		foods = []models.Food{}
	}
	writeJSON(w, 200, map[string]interface{}{"success": true, "foods": foods})
}

func (s *Server) addFood(w http.ResponseWriter, r *http.Request) {
	input, file, err := parseFoodForm(r, true)
	if err != nil {
		errorJSON(w, s.statusForInput(err), err.Error())
		return
	}
	image, err := s.saveImage(file)
	if err != nil {
		errorJSON(w, 400, err.Error())
		return
	}
	food := models.Food{ID: primitive.NewObjectID(), Name: input.name, Description: input.description, Category: input.category, Price: input.price, Image: image, CreatedAt: time.Now(), UpdatedAt: time.Now()}
	if err := s.Repo.CreateFood(r.Context(), food); err != nil {
		errorJSON(w, 500, err.Error())
		return
	}
	writeJSON(w, 201, map[string]interface{}{"success": true, "message": "Food created successfully", "food": food})
}

func (s *Server) updateFood(w http.ResponseWriter, r *http.Request) {
	id, err := primitive.ObjectIDFromHex(chi.URLParam(r, "id"))
	if err != nil {
		errorJSON(w, 404, "Food not found")
		return
	}
	food, err := s.Repo.FindFood(r.Context(), id)
	if repository.IsNotFound(err) {
		errorJSON(w, 404, "Food not found")
		return
	}
	if err != nil {
		errorJSON(w, 500, err.Error())
		return
	}
	input, file, err := parseFoodForm(r, false)
	if err != nil {
		errorJSON(w, s.statusForInput(err), err.Error())
		return
	}
	if input.name != "" {
		food.Name = input.name
	}
	if input.description != "" {
		food.Description = input.description
	}
	if input.category != "" {
		food.Category = input.category
	}
	if input.priceSet {
		food.Price = input.price
	}
	if file != nil {
		food.Image, err = s.saveImage(file)
		if err != nil {
			errorJSON(w, 400, err.Error())
			return
		}
	} else if input.image != "" {
		food.Image = input.image
	}
	food.UpdatedAt = time.Now()
	if err := s.Repo.UpdateFood(r.Context(), food); err != nil {
		errorJSON(w, 500, err.Error())
		return
	}
	writeJSON(w, 200, map[string]interface{}{"success": true, "message": "Food updated successfully", "food": food})
}

func (s *Server) removeFood(w http.ResponseWriter, r *http.Request) {
	id, err := primitive.ObjectIDFromHex(chi.URLParam(r, "id"))
	if err != nil {
		errorJSON(w, 404, "Food not found")
		return
	}
	if err := s.Repo.DeleteFood(r.Context(), id); repository.IsNotFound(err) {
		errorJSON(w, 404, "Food not found")
		return
	} else if err != nil {
		errorJSON(w, 500, err.Error())
		return
	}
	writeJSON(w, 200, map[string]interface{}{"success": true, "message": "Food removed successfully"})
}

func (s *Server) getCart(w http.ResponseWriter, r *http.Request) {
	user, err := s.currentUser(r)
	if err != nil {
		errorJSON(w, 500, err.Error())
		return
	}
	writeJSON(w, 200, map[string]interface{}{"success": true, "cartData": safeCart(user.CartData)})
}
func (s *Server) addCart(w http.ResponseWriter, r *http.Request)    { s.changeCart(w, r, "add") }
func (s *Server) removeCart(w http.ResponseWriter, r *http.Request) { s.changeCart(w, r, "remove") }
func (s *Server) updateCart(w http.ResponseWriter, r *http.Request) { s.changeCart(w, r, "update") }
func (s *Server) changeCart(w http.ResponseWriter, r *http.Request, action string) {
	var input struct {
		FoodID   string  `json:"foodId"`
		Quantity float64 `json:"quantity"`
	}
	if !decodeJSON(w, r, &input) {
		return
	}
	if input.FoodID == "" {
		if action == "update" {
			errorJSON(w, 400, "foodId and quantity are required")
		} else {
			errorJSON(w, 400, "foodId is required")
		}
		return
	}
	if action != "update" && input.Quantity <= 0 {
		input.Quantity = 1
	}
	if action == "update" && (input.Quantity < 0 || input.Quantity != input.Quantity) {
		errorJSON(w, 400, "Quantity must be a valid number")
		return
	}
	if action != "update" {
		if _, err := primitive.ObjectIDFromHex(input.FoodID); err != nil {
			errorJSON(w, 404, "Food not found")
			return
		}
		if _, err := s.Repo.FindFood(r.Context(), mustID(input.FoodID)); repository.IsNotFound(err) {
			errorJSON(w, 404, "Food not found")
			return
		} else if err != nil {
			errorJSON(w, 500, err.Error())
			return
		}
	}
	user, err := s.currentUser(r)
	if err != nil {
		errorJSON(w, 500, err.Error())
		return
	}
	if user.CartData == nil {
		user.CartData = map[string]float64{}
	}
	current := user.CartData[input.FoodID]
	next := input.Quantity
	if action == "add" {
		next = current + input.Quantity
	}
	if action == "remove" {
		next = current - input.Quantity
	}
	if next <= 0 {
		delete(user.CartData, input.FoodID)
	} else {
		user.CartData[input.FoodID] = next
	}
	user.UpdatedAt = time.Now()
	if err := s.Repo.SaveUser(r.Context(), user); err != nil {
		errorJSON(w, 500, err.Error())
		return
	}
	message := map[string]string{"add": "Item added to cart", "remove": "Item removed from cart", "update": "Cart updated"}[action]
	writeJSON(w, 200, map[string]interface{}{"success": true, "message": message, "cartData": safeCart(user.CartData)})
}

func (s *Server) placeOrder(w http.ResponseWriter, r *http.Request) {
	var input struct {
		Address models.Address `json:"address"`
		Payment models.Payment `json:"payment"`
		Items   []struct {
			FoodID   string  `json:"foodId"`
			ID       string  `json:"_id"`
			Quantity float64 `json:"quantity"`
		} `json:"items"`
	}
	if !decodeJSON(w, r, &input) {
		return
	}
	if missing := missingAddress(input.Address); len(missing) > 0 {
		errorJSON(w, 400, "Missing address fields: "+strings.Join(missing, ", "))
		return
	}
	user, err := s.currentUser(r)
	if err != nil {
		errorJSON(w, 404, "User not found")
		return
	}
	source := input.Items
	if len(source) == 0 {
		for id, quantity := range user.CartData {
			source = append(source, struct {
				FoodID   string  `json:"foodId"`
				ID       string  `json:"_id"`
				Quantity float64 `json:"quantity"`
			}{FoodID: id, Quantity: quantity})
		}
	}
	if len(source) == 0 {
		errorJSON(w, 400, "Order items are required")
		return
	}
	items := make([]models.OrderItem, 0, len(source))
	allVeg, anyVeg := true, false
	subtotal := 0.0
	for _, item := range source {
		id := item.FoodID
		if id == "" {
			id = item.ID
		}
		objectID, parseErr := primitive.ObjectIDFromHex(id)
		if parseErr != nil {
			errorJSON(w, 400, "Food not found for cart item "+id)
			return
		}
		food, findErr := s.Repo.FindFood(r.Context(), objectID)
		if repository.IsNotFound(findErr) {
			errorJSON(w, 400, "Food not found for cart item "+id)
			return
		}
		if findErr != nil {
			errorJSON(w, 500, findErr.Error())
			return
		}
		quantity := item.Quantity
		if quantity < 1 {
			quantity = 1
		}
		items = append(items, models.OrderItem{FoodID: food.ID, Name: food.Name, Quantity: quantity, Price: food.Price, Image: food.Image})
		subtotal += food.Price * quantity
		anyVeg = anyVeg || food.Vegetarian
		allVeg = allVeg && food.Vegetarian
	}
	tag := ""
	if allVeg {
		tag = "V"
	} else if !anyVeg {
		tag = "NV"
	}
	orderID, err := s.Repo.NextOrderID(r.Context())
	if err != nil {
		errorJSON(w, 500, err.Error())
		return
	}
	now := time.Now()
	order := models.Order{ID: primitive.NewObjectID(), OrderID: orderID, VegTag: tag, UserID: user.ID, Items: items, Amount: round2(subtotal + 2.99), Address: input.Address, Payment: input.Payment, Status: "Processing", CreatedAt: now, UpdatedAt: now}
	if order.Payment.Method == "" {
		order.Payment.Method = "Cash on Delivery"
	}
	if err := s.Repo.CreateOrder(r.Context(), order); err != nil {
		errorJSON(w, 500, err.Error())
		return
	}
	user.CartData = map[string]float64{}
	user.UpdatedAt = now
	if err := s.Repo.SaveUser(r.Context(), user); err != nil {
		errorJSON(w, 500, err.Error())
		return
	}
	writeJSON(w, 201, map[string]interface{}{"success": true, "message": "Order placed successfully", "order": order})
}

func (s *Server) userOrders(w http.ResponseWriter, r *http.Request) {
	user, err := s.currentUser(r)
	if err != nil {
		errorJSON(w, 404, "User not found")
		return
	}
	orders, err := s.Repo.ListOrders(r.Context(), &user.ID)
	if err != nil {
		errorJSON(w, 500, err.Error())
		return
	}
	if orders == nil {
		orders = []models.Order{}
	}
	writeJSON(w, 200, map[string]interface{}{"success": true, "orders": orders})
}
func (s *Server) listOrders(w http.ResponseWriter, r *http.Request) {
	orders, err := s.Repo.ListOrders(r.Context(), nil)
	if err != nil {
		errorJSON(w, 500, err.Error())
		return
	}
	output := make([]map[string]interface{}, 0, len(orders))
	for _, order := range orders {
		value := orderMap(order)
		if order.User != nil {
			value["userId"] = order.User
		}
		output = append(output, value)
	}
	writeJSON(w, 200, map[string]interface{}{"success": true, "orders": output})
}
func (s *Server) updateStatus(w http.ResponseWriter, r *http.Request) {
	var input struct {
		OrderID string `json:"orderId"`
		Status  string `json:"status"`
	}
	if !decodeJSON(w, r, &input) {
		return
	}
	allowed := map[string]bool{"Processing": true, "Preparing": true, "Out for Delivery": true, "Delivered": true, "Cancelled": true}
	if input.OrderID == "" || input.Status == "" {
		errorJSON(w, 400, "orderId and status are required")
		return
	}
	if !allowed[input.Status] {
		errorJSON(w, 400, "Invalid order status")
		return
	}
	id, err := primitive.ObjectIDFromHex(input.OrderID)
	if err != nil {
		errorJSON(w, 404, "Order not found")
		return
	}
	order, err := s.Repo.UpdateOrderStatus(r.Context(), id, input.Status)
	if repository.IsNotFound(err) {
		errorJSON(w, 404, "Order not found")
		return
	}
	if err != nil {
		errorJSON(w, 500, err.Error())
		return
	}
	writeJSON(w, 200, map[string]interface{}{"success": true, "message": "Order status updated", "order": order})
}
func (s *Server) dashboard(w http.ResponseWriter, r *http.Request) {
	stats, err := s.Repo.Stats(r.Context())
	if err != nil {
		errorJSON(w, 500, err.Error())
		return
	}
	writeJSON(w, 200, map[string]interface{}{"success": true, "stats": stats})
}
func (s *Server) listUsers(w http.ResponseWriter, r *http.Request) {
	users, err := s.Repo.ListUsers(r.Context())
	if err != nil {
		errorJSON(w, 500, err.Error())
		return
	}
	if users == nil {
		users = []models.PublicUser{}
	}
	writeJSON(w, 200, map[string]interface{}{"success": true, "users": users})
}

func (s *Server) currentUser(r *http.Request) (models.User, error) {
	claims := r.Context().Value(claimsKey).(models.Claims)
	id, err := primitive.ObjectIDFromHex(claims.ID)
	if err != nil {
		return models.User{}, err
	}
	return s.Repo.FindUser(r.Context(), bson.M{"_id": id})
}
func (s *Server) token(user models.User) string {
	claims := jwt.MapClaims{"id": user.ID.Hex(), "name": user.Name, "email": user.Email, "isAdmin": user.IsAdmin, "exp": time.Now().Add(7 * 24 * time.Hour).Unix()}
	token, _ := jwt.NewWithClaims(jwt.SigningMethodHS256, claims).SignedString([]byte(s.Config.JWTSecret))
	return token
}
func (s *Server) saveImage(file *multipart.FileHeader) (string, error) {
	if file == nil {
		return "", errors.New("All food fields and an image are required")
	}
	if file.Size > 5*1024*1024 {
		return "", errors.New("Image must be 5 MB or smaller")
	}
	ext := strings.ToLower(filepath.Ext(file.Filename))
	allowed := map[string]bool{".jpg": true, ".jpeg": true, ".png": true, ".webp": true}
	if !allowed[ext] {
		return "", errors.New("Only JPG, PNG, and WEBP image files are allowed")
	}
	if s.Config.ImageStorage == "cloudinary" {
		return s.uploadToCloudinary(file)
	}
	if err := os.MkdirAll(s.Config.UploadDir, 0755); err != nil {
		return "", err
	}
	name := fmt.Sprintf("%d-%s%s", time.Now().UnixNano(), primitive.NewObjectID().Hex(), ext)
	destination := filepath.Join(s.Config.UploadDir, name)
	source, err := file.Open()
	if err != nil {
		return "", err
	}
	defer source.Close()
	target, err := os.OpenFile(destination, os.O_WRONLY|os.O_CREATE|os.O_EXCL, 0644)
	if err != nil {
		return "", err
	}
	defer target.Close()
	if _, err := io.Copy(target, source); err != nil {
		return "", err
	}
	return "/images/" + name, nil
}

func (s *Server) uploadToCloudinary(file *multipart.FileHeader) (string, error) {
	source, err := file.Open()
	if err != nil {
		return "", err
	}
	defer source.Close()

	var body bytes.Buffer
	writer := multipart.NewWriter(&body)
	if err := writer.WriteField("upload_preset", s.Config.CloudinaryPreset); err != nil {
		return "", err
	}
	part, err := writer.CreateFormFile("file", filepath.Base(file.Filename))
	if err != nil {
		return "", err
	}
	if _, err := io.Copy(part, source); err != nil {
		return "", err
	}
	if err := writer.Close(); err != nil {
		return "", err
	}

	endpoint := "https://api.cloudinary.com/v1_1/" + s.Config.CloudinaryCloudName + "/image/upload"
	request, err := http.NewRequest(http.MethodPost, endpoint, &body)
	if err != nil {
		return "", err
	}
	request.Header.Set("Content-Type", writer.FormDataContentType())
	response, err := http.DefaultClient.Do(request)
	if err != nil {
		return "", err
	}
	defer response.Body.Close()
	if response.StatusCode < http.StatusOK || response.StatusCode >= http.StatusMultipleChoices {
		return "", fmt.Errorf("image storage returned status %s", response.Status)
	}
	var result struct {
		SecureURL string `json:"secure_url"`
	}
	if err := json.NewDecoder(response.Body).Decode(&result); err != nil {
		return "", err
	}
	if result.SecureURL == "" {
		return "", errors.New("image storage returned no secure URL")
	}
	return result.SecureURL, nil
}

type foodInput struct {
	name, description, category, image string
	price                              float64
	priceSet                           bool
}

func parseFoodForm(r *http.Request, required bool) (foodInput, *multipart.FileHeader, error) {
	if err := r.ParseMultipartForm(5*1024*1024 + 1024); err != nil {
		return foodInput{}, nil, errors.New("Invalid multipart form")
	}
	value := func(key string) string { return strings.TrimSpace(r.FormValue(key)) }
	priceText := value("price")
	price := 0.0
	if priceText != "" {
		var err error
		price, err = strconv.ParseFloat(priceText, 64)
		if err != nil || price < 0 {
			return foodInput{}, nil, errors.New("Price must be a valid non-negative number")
		}
	}
	if required && priceText == "" {
		return foodInput{}, nil, errors.New("Price must be a valid non-negative number")
	}
	source, header, err := r.FormFile("image")
	if err != nil {
		header = nil
	} else {
		source.Close()
	}
	if required && (value("name") == "" || value("description") == "" || value("category") == "" || priceText == "" || header == nil) {
		return foodInput{}, nil, errors.New("All food fields and an image are required")
	}
	return foodInput{name: value("name"), description: value("description"), category: value("category"), image: value("image"), price: price, priceSet: priceText != ""}, header, nil
}
func (s *Server) statusForInput(err error) int {
	if strings.Contains(err.Error(), "required") {
		return 400
	}
	return 400
}
func decodeJSON(w http.ResponseWriter, r *http.Request, target interface{}) bool {
	if err := json.NewDecoder(r.Body).Decode(target); err != nil {
		errorJSON(w, 400, "Invalid JSON request")
		return false
	}
	return true
}
func writeJSON(w http.ResponseWriter, status int, value interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(value)
}
func errorJSON(w http.ResponseWriter, status int, message string) {
	writeJSON(w, status, map[string]interface{}{"success": false, "message": message})
}
func publicUser(user models.User) map[string]interface{} {
	return map[string]interface{}{"id": user.ID, "name": user.Name, "email": user.Email, "cartData": safeCart(user.CartData), "isAdmin": user.IsAdmin}
}
func safeCart(cart map[string]float64) map[string]float64 {
	if cart == nil {
		return map[string]float64{}
	}
	return cart
}
func stringClaim(value interface{}) string {
	if text, ok := value.(string); ok {
		return text
	}
	return ""
}
func boolClaim(value interface{}) bool { flag, _ := value.(bool); return flag }
func missingAddress(address models.Address) []string {
	values := map[string]string{"name": address.Name, "phone": address.Phone, "email": address.Email, "address": address.Address, "city": address.City, "state": address.State, "pinCode": address.PinCode}
	missing := []string{}
	for key, value := range values {
		if strings.TrimSpace(value) == "" {
			missing = append(missing, key)
		}
	}
	order := []string{"name", "phone", "email", "address", "city", "state", "pinCode"}
	sortStrings(missing, order)
	return missing
}
func sortStrings(values, order []string) {
	for i := range values {
		for j := i + 1; j < len(values); j++ {
			if indexOf(values[i], order) > indexOf(values[j], order) {
				values[i], values[j] = values[j], values[i]
			}
		}
	}
}
func indexOf(value string, values []string) int {
	for i, item := range values {
		if item == value {
			return i
		}
	}
	return len(values)
}
func round2(value float64) float64           { return float64(int(value*100+0.5)) / 100 }
func mustID(value string) primitive.ObjectID { id, _ := primitive.ObjectIDFromHex(value); return id }
func orderMap(order models.Order) map[string]interface{} {
	return map[string]interface{}{"_id": order.ID, "orderId": order.OrderID, "vegTag": order.VegTag, "userId": order.UserID, "items": order.Items, "amount": order.Amount, "address": order.Address, "payment": order.Payment, "status": order.Status, "createdAt": order.CreatedAt, "updatedAt": order.UpdatedAt}
}

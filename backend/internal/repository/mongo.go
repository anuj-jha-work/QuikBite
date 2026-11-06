package repository

import (
	"context"
	"errors"
	"fmt"
	"sort"
	"time"

	"quikbite/backend/internal/models"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type Mongo struct {
	DB *mongo.Database
}

func (m Mongo) Users() *mongo.Collection  { return m.DB.Collection("users") }
func (m Mongo) Foods() *mongo.Collection  { return m.DB.Collection("foods") }
func (m Mongo) Orders() *mongo.Collection { return m.DB.Collection("orders") }

func (m Mongo) FindUser(ctx context.Context, filter interface{}) (models.User, error) {
	var user models.User
	err := m.Users().FindOne(ctx, filter).Decode(&user)
	return user, err
}

func (m Mongo) SaveUser(ctx context.Context, user models.User) error {
	_, err := m.Users().ReplaceOne(ctx, bson.M{"_id": user.ID}, user)
	return err
}

func (m Mongo) ListFoods(ctx context.Context) ([]models.Food, error) {
	cursor, err := m.Foods().Find(ctx, bson.M{}, options.Find().SetSort(bson.D{{Key: "createdAt", Value: -1}}))
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)
	var foods []models.Food
	return foods, cursor.All(ctx, &foods)
}

func (m Mongo) FindFood(ctx context.Context, id primitive.ObjectID) (models.Food, error) {
	var food models.Food
	err := m.Foods().FindOne(ctx, bson.M{"_id": id}).Decode(&food)
	return food, err
}

func (m Mongo) CreateFood(ctx context.Context, food models.Food) error {
	_, err := m.Foods().InsertOne(ctx, food)
	return err
}

func (m Mongo) UpdateFood(ctx context.Context, food models.Food) error {
	_, err := m.Foods().ReplaceOne(ctx, bson.M{"_id": food.ID}, food)
	return err
}

func (m Mongo) DeleteFood(ctx context.Context, id primitive.ObjectID) error {
	result, err := m.Foods().DeleteOne(ctx, bson.M{"_id": id})
	if err == nil && result.DeletedCount == 0 {
		return mongo.ErrNoDocuments
	}
	return err
}

func (m Mongo) NextOrderID(ctx context.Context) (string, error) {
	cursor, err := m.Orders().Find(ctx, bson.M{}, options.Find().SetProjection(bson.M{"orderId": 1}).SetSort(bson.D{{Key: "createdAt", Value: -1}}).SetLimit(1))
	if err != nil {
		return "", err
	}
	defer cursor.Close(ctx)
	var rows []struct {
		OrderID string `bson:"orderId"`
	}
	if err := cursor.All(ctx, &rows); err != nil {
		return "", err
	}
	next := 101
	if len(rows) > 0 {
		var number int
		if _, err := fmt.Sscanf(rows[0].OrderID, "%d", &number); err == nil && number >= next {
			next = number + 1
		}
	}
	return fmt.Sprintf("%d", next), nil
}

func (m Mongo) CreateOrder(ctx context.Context, order models.Order) error {
	_, err := m.Orders().InsertOne(ctx, order)
	return err
}

func (m Mongo) ListOrders(ctx context.Context, userID *primitive.ObjectID) ([]models.Order, error) {
	filter := bson.M{}
	if userID != nil {
		filter["userId"] = *userID
	}
	cursor, err := m.Orders().Find(ctx, filter, options.Find().SetSort(bson.D{{Key: "createdAt", Value: -1}}))
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)
	var orders []models.Order
	if err := cursor.All(ctx, &orders); err != nil {
		return nil, err
	}
	if userID == nil {
		for i := range orders {
			var user models.PublicUser
			if err := m.Users().FindOne(ctx, bson.M{"_id": orders[i].UserID}, options.FindOne().SetProjection(bson.M{"password": 0})).Decode(&user); err == nil {
				orders[i].User = &user
			}
		}
	}
	return orders, nil
}

func (m Mongo) UpdateOrderStatus(ctx context.Context, id primitive.ObjectID, status string) (models.Order, error) {
	now := time.Now()
	result, err := m.Orders().UpdateOne(ctx, bson.M{"_id": id}, bson.M{"$set": bson.M{"status": status, "updatedAt": now}})
	if err != nil {
		return models.Order{}, err
	}
	if result.MatchedCount == 0 {
		return models.Order{}, mongo.ErrNoDocuments
	}
	var order models.Order
	err = m.Orders().FindOne(ctx, bson.M{"_id": id}).Decode(&order)
	return order, err
}

func (m Mongo) Stats(ctx context.Context) (map[string]interface{}, error) {
	totalOrders, err := m.Orders().CountDocuments(ctx, bson.M{})
	if err != nil {
		return nil, err
	}
	totalUsers, err := m.Users().CountDocuments(ctx, bson.M{})
	if err != nil {
		return nil, err
	}
	totalFoods, err := m.Foods().CountDocuments(ctx, bson.M{})
	if err != nil {
		return nil, err
	}
	cursor, err := m.Orders().Aggregate(ctx, mongo.Pipeline{
		{{Key: "$match", Value: bson.M{"status": bson.M{"$ne": "Cancelled"}}}},
		{{Key: "$group", Value: bson.M{"_id": nil, "revenue": bson.M{"$sum": "$amount"}}}},
	})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)
	var revenue []struct {
		Revenue float64 `bson:"revenue"`
	}
	if err := cursor.All(ctx, &revenue); err != nil {
		return nil, err
	}
	totalRevenue := float64(0)
	if len(revenue) > 0 {
		totalRevenue = revenue[0].Revenue
	}
	return map[string]interface{}{"totalOrders": totalOrders, "totalUsers": totalUsers, "totalFoods": totalFoods, "totalRevenue": totalRevenue}, nil
}

func (m Mongo) ListUsers(ctx context.Context) ([]models.PublicUser, error) {
	cursor, err := m.Users().Find(ctx, bson.M{}, options.Find().SetProjection(bson.M{"password": 0}).SetSort(bson.D{{Key: "createdAt", Value: -1}}))
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)
	var users []models.PublicUser
	return users, cursor.All(ctx, &users)
}

func IsNotFound(err error) bool { return errors.Is(err, mongo.ErrNoDocuments) }

func SortFoods(foods []models.Food) {
	sort.SliceStable(foods, func(i, j int) bool { return foods[i].CreatedAt.After(foods[j].CreatedAt) })
}

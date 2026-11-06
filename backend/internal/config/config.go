package config

import (
	"errors"
	"os"
	"strconv"
	"strings"
)

type Config struct {
	Port                string
	MongoURL            string
	Database            string
	JWTSecret           string
	AdminEmail          string
	AdminPass           string
	UploadDir           string
	MaxBodySize         int64
	Environment         string
	AllowedOrigins      []string
	ImageStorage        string
	CloudinaryCloudName string
	CloudinaryPreset    string
}

func Load() (Config, error) {
	port := getenv("PORT", "5000")
	mongoURL := os.Getenv("MONGO_URL")
	if mongoURL == "" {
		return Config{}, errors.New("MONGO_URL is required")
	}
	maxBody := int64(10 * 1024 * 1024)
	if value := os.Getenv("MAX_BODY_SIZE"); value != "" {
		parsed, err := strconv.ParseInt(value, 10, 64)
		if err != nil || parsed < 1 {
			return Config{}, errors.New("MAX_BODY_SIZE must be a positive integer")
		}
		maxBody = parsed
	}
	origins := splitCSV(os.Getenv("CORS_ORIGINS"))
	if len(origins) == 0 {
		origins = []string{"http://localhost:5173", "http://localhost:5174"}
	}
	environment := getenv("ENVIRONMENT", "development")
	imageStorage := getenv("IMAGE_STORAGE", "local")
	jwtSecret := os.Getenv("JWT_SECRET")
	if environment == "production" && (len(jwtSecret) < 32 || jwtSecret == "quikbite-demo-secret" || jwtSecret == "replace_with_a_strong_secret") {
		return Config{}, errors.New("JWT_SECRET must be at least 32 characters and non-default in production")
	}
	if environment == "production" {
		if len(origins) < 2 {
			return Config{}, errors.New("CORS_ORIGINS must contain both production frontend URLs")
		}
		for _, origin := range origins {
			if !strings.HasPrefix(origin, "https://") {
				return Config{}, errors.New("production CORS origins must use HTTPS")
			}
		}
	}
	if environment == "production" && imageStorage != "cloudinary" {
		return Config{}, errors.New("IMAGE_STORAGE must be cloudinary in production")
	}
	if imageStorage == "cloudinary" && (os.Getenv("CLOUDINARY_CLOUD_NAME") == "" || os.Getenv("CLOUDINARY_UPLOAD_PRESET") == "") {
		return Config{}, errors.New("CLOUDINARY_CLOUD_NAME and CLOUDINARY_UPLOAD_PRESET are required for cloudinary storage")
	}
	return Config{
		Port: port, MongoURL: mongoURL, Database: getenv("MONGO_DATABASE", "quikbite"),
		JWTSecret:  getenv("JWT_SECRET", "quikbite-demo-secret"),
		AdminEmail: getenv("ADMIN_EMAIL", "admin@quikbite.com"),
		AdminPass:  getenv("ADMIN_PASSWORD", "Admin@12345"),
		UploadDir:  getenv("UPLOAD_DIR", "uploads"), MaxBodySize: maxBody,
		Environment: environment, AllowedOrigins: origins, ImageStorage: imageStorage,
		CloudinaryCloudName: os.Getenv("CLOUDINARY_CLOUD_NAME"),
		CloudinaryPreset:    os.Getenv("CLOUDINARY_UPLOAD_PRESET"),
	}, nil
}

func getenv(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}

func splitCSV(value string) []string {
	var values []string
	for _, item := range strings.Split(value, ",") {
		if trimmed := strings.TrimSpace(item); trimmed != "" {
			values = append(values, trimmed)
		}
	}
	return values
}

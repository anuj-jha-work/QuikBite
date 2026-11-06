package config

import "testing"

func setRequiredProductionEnv(t *testing.T) {
	t.Helper()
	t.Setenv("MONGO_URL", "mongodb://example")
	t.Setenv("ENVIRONMENT", "production")
	t.Setenv("JWT_SECRET", "a-production-secret-that-is-longer-than-32-characters")
	t.Setenv("CORS_ORIGINS", "https://customer.example,https://admin.example")
	t.Setenv("IMAGE_STORAGE", "cloudinary")
	t.Setenv("CLOUDINARY_CLOUD_NAME", "cloud")
	t.Setenv("CLOUDINARY_UPLOAD_PRESET", "preset")
}

func TestLoadRejectsWeakProductionJWTSecret(t *testing.T) {
	setRequiredProductionEnv(t)
	t.Setenv("JWT_SECRET", "short-secret")
	if _, err := Load(); err == nil {
		t.Fatal("expected weak production JWT secret to be rejected")
	}
}

func TestLoadRejectsIncompleteProductionCORS(t *testing.T) {
	setRequiredProductionEnv(t)
	t.Setenv("CORS_ORIGINS", "https://customer.example")
	if _, err := Load(); err == nil {
		t.Fatal("expected incomplete production CORS configuration to be rejected")
	}
}

func TestLoadAcceptsProductionConfiguration(t *testing.T) {
	setRequiredProductionEnv(t)
	if _, err := Load(); err != nil {
		t.Fatalf("expected valid production configuration, got %v", err)
	}
}

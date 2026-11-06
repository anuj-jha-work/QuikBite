package httpapi

import (
	"log/slog"
	"net/http"
	"net/http/httptest"
	"testing"

	"quikbite/backend/internal/config"
	"quikbite/backend/internal/models"
	"quikbite/backend/internal/repository"
)

func testServer() *Server {
	return New(repository.Mongo{}, config.Config{JWTSecret: "test-secret", MaxBodySize: 1024 * 1024}, slog.Default())
}

func TestHealthAndNotFoundResponses(t *testing.T) {
	server := testServer()
	health := httptest.NewRecorder()
	server.Routes().ServeHTTP(health, httptest.NewRequest(http.MethodGet, "/healthz", nil))
	if health.Code != http.StatusOK || health.Body.String() != "{\"status\":\"ok\"}\n" {
		t.Fatalf("unexpected health response: %d %s", health.Code, health.Body.String())
	}

	notFound := httptest.NewRecorder()
	server.Routes().ServeHTTP(notFound, httptest.NewRequest(http.MethodGet, "/missing", nil))
	if notFound.Code != http.StatusNotFound {
		t.Fatalf("expected 404, got %d", notFound.Code)
	}
}

func TestProtectedRouteRequiresBearerToken(t *testing.T) {
	recorder := httptest.NewRecorder()
	testServer().Routes().ServeHTTP(recorder, httptest.NewRequest(http.MethodGet, "/api/user/me", nil))
	if recorder.Code != http.StatusUnauthorized {
		t.Fatalf("expected 401, got %d", recorder.Code)
	}
}

func TestAddressValidationOrderIsStable(t *testing.T) {
	missing := missingAddress(models.Address{})
	if len(missing) != 7 || missing[0] != "name" || missing[6] != "pinCode" {
		t.Fatalf("unexpected missing address fields: %#v", missing)
	}
	if got := round2(12.995); got != 13 {
		t.Fatalf("expected currency rounding, got %v", got)
	}
}

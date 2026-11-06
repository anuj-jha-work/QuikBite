# Go Learning and Interview Guide

This guide explains the Go code in QuikBite in simple, interview-ready terms.

## Project map

| Path | Role |
| --- | --- |
| `backend/cmd/api/main.go` | Composition root: wire dependencies and start the server |
| `backend/internal/config` | Load and validate environment variables |
| `backend/internal/models` | Define data structures and BSON/JSON tags |
| `backend/internal/repository` | Keep MongoDB queries out of HTTP handlers |
| `backend/internal/httpapi` | Routes, middleware, validation, and handlers |

## 1. Structs and tags

**Definition:** A struct groups related fields into one typed value.

**Keywords:** fields, type safety, struct tags, JSON, BSON

QuikBite uses model structs for users, foods, and orders. Tags such as
`bson:"food_id"` tell MongoDB which field name to use, while `json:"token"`
controls the API response shape.

**Interview answer:** “I use structs to model domain data and tags to keep the
Go field names compatible with MongoDB and the frontend JSON contract.”

## 2. Pointers

**Definition:** A pointer stores the address of a value and can also be `nil`.

**Keywords:** optional value, `nil`, address, mutation

An optional order filter can use a pointer. `nil` means “no filter”; a value
means “filter by this user.”

**Interview answer:** “I use pointers when nil has meaning, such as an optional
filter or an optional configuration value.”

## 3. Interfaces

**Definition:** An interface describes behavior instead of a concrete type.

**Keywords:** behavior, abstraction, substitution, testing

The repository interface describes operations such as listing foods. The HTTP
server can use a real MongoDB repository in production or a fake repository in
tests.

**Interview answer:** “Interfaces reduce coupling. The handler depends on the
operations it needs, not on MongoDB implementation details.”

## 4. Explicit error handling

**Definition:** Go returns errors as values, so the caller decides what to do.

**Keywords:** `error`, early return, wrapping, status code

The API checks errors immediately. Validation errors become client errors,
authentication errors become `401` or `403`, and database failures become
server errors. The API does not silently return success after a failure.

**Interview answer:** “Go makes failure handling explicit. I check errors near
the operation that produced them and map them to a clear HTTP response.”

## 5. Context

**Definition:** Context carries cancellation, deadlines, and request-scoped
values.

**Keywords:** cancellation, deadline, request scope, cleanup

MongoDB calls receive `r.Context()`. If a browser disconnects or the server is
shutting down, the database operation can stop instead of running forever.

**Interview answer:** “Request context connects the lifetime of database work to
the HTTP request and supports cancellation and deadlines.”

## 6. HTTP handlers

**Definition:** A handler receives an HTTP request and produces an HTTP
response.

**Keywords:** method, path, status, headers, JSON

A QuikBite handler decodes input, validates it, calls a repository method, and
encodes a JSON response. Keeping those steps visible makes the API behavior
easy to trace.

## 7. Middleware

**Definition:** Middleware wraps a handler to run shared logic before or after
the handler.

**Keywords:** chain, cross-cutting concern, authentication, authorization

QuikBite uses middleware for CORS, JWT authentication, and admin checks.
Authentication identifies the user; authorization decides whether that user
may perform an admin action.

**Interview answer:** “Middleware prevents duplicated security logic and makes
protected routes consistent.”

## 8. Dependency injection

**Definition:** Dependency injection passes dependencies into a component
instead of creating them inside it.

**Keywords:** constructor, loose coupling, testability, composition root

`httpapi.New` receives the repository, configuration, and logger. The entry
point creates the real dependencies, while tests can provide controlled ones.

**Interview answer:** “Dependency injection makes dependencies explicit and
allows tests to replace external services.”

## 9. Repository pattern

**Definition:** A repository hides persistence operations behind an
application-focused interface.

**Keywords:** data access, abstraction, separation, mocking

Handlers ask the repository to list foods or create an order. They do not know
which MongoDB filter or collection is used.

**Interview answer:** “The repository pattern separates business/API logic from
database queries and improves maintainability.”

## 10. JWT and bcrypt

**JWT definition:** A signed token carrying claims about the authenticated user.

**Bcrypt definition:** A deliberately slow one-way password hashing algorithm.

**Keywords:** claims, signature, expiry, salt, one-way hash

Passwords are never stored as plain text. Login compares the submitted password
with the bcrypt hash. A successful login receives a seven-day JWT containing
identity and role claims.

**Interview answer:** “Bcrypt protects stored passwords, while JWT carries
short-lived signed identity claims between the frontend and API.”

## 11. Concurrency

**Definition:** A Go HTTP server handles multiple requests concurrently.

**Keywords:** goroutine, shared state, race, atomicity

Handlers avoid shared mutable state and store application data in MongoDB. The
current order-number logic preserves the old behavior, but a high-volume
system should use an atomic counter or transaction to avoid duplicate numbers.

## 12. Graceful shutdown

**Definition:** Stop accepting new work, finish active work, then release
resources.

**Keywords:** signal, timeout, cleanup, `Shutdown`

The entry point listens for termination signals, shuts down the HTTP server with
a timeout, and disconnects from MongoDB.

## 13. Useful commands

```powershell
cd backend
gofmt -w .
go test ./...
go vet ./...
go build ./cmd/api
go run ./cmd/api
```

## Short project explanation for interviews

> “QuikBite is a React and Go food-delivery application. The Go API uses Chi
> routing, JWT middleware, bcrypt, and a repository layer around MongoDB Atlas.
> Customers and admins are separate React applications. Admin routes require a
> valid JWT with an admin claim. Cloudinary stores production images because
> Render's local filesystem is not persistent. I kept the layers separate so
> the handlers are testable and the MongoDB implementation can change without
> rewriting the API.”

# Go Learning Guide for QuikBite

This guide explains the implementation in `backend/` using the actual QuikBite
code.

## Project map

- `cmd/api/main.go` is the composition root: it loads configuration, opens
  MongoDB, creates the repository and HTTP server, and performs graceful shutdown.
- `internal/config` contains environment configuration and validation.
- `internal/models` contains BSON/JSON structs. Struct tags preserve the
  existing MongoDB names and frontend JSON shape.
- `internal/repository` contains MongoDB operations. Keeping database calls here
  prevents HTTP handlers from knowing MongoDB query details.
- `internal/httpapi` contains routing, middleware, validation, handlers, and
  response shaping.

## Interview concepts in this code

### Structs, pointers, and interfaces

A struct groups data, such as `models.Order`. A pointer (`*primitive.ObjectID`)
in `ListOrders` represents an optional filter: nil means all orders, while a
pointer means one user's orders. `http.Handler` is an interface; chi and the
standard library can compose middleware because they implement it.

**Keywords:** fields, tags, methods, pointers, interfaces.

### Explicit error handling

Go returns errors as values. Database calls are checked immediately and mapped
to a deliberate HTTP response. This avoids silently returning a successful
response when MongoDB or validation failed.

**Keywords:** `error`, early return, wrapping, status mapping.

### Context

Every MongoDB call receives `r.Context()`. Request cancellation and server
shutdown can therefore stop work that no longer has a client waiting.

**Keywords:** cancellation, deadlines, request scope, cleanup.

### HTTP handlers and middleware

Handlers implement the API contract. `auth` validates the Bearer JWT and stores
claims in the request context; `admin` checks the role before mutation routes.
This keeps authorization consistent across foods, orders, and admin endpoints.

**Keywords:** `http.Handler`, middleware chain, context, authorization.

### Dependency injection

`httpapi.New` receives a repository, configuration, and logger instead of
creating global connections. Tests can therefore construct the server with a
controlled configuration and exercise routing without a live MongoDB instance.

**Keywords:** constructor, explicit dependencies, testability, composition root.

### MongoDB operations

The official driver uses BSON filters such as `bson.M{"_id": id}` and typed
decoding into model structs. Existing ObjectIDs and collection names are
preserved, so the Go service reads and writes QuikBite Atlas data directly.

### JWT and bcrypt

Passwords are checked with bcrypt cost 12. JWT claims retain `id`, `name`,
`email`, and `isAdmin`, with a seven-day expiry. Password hashes are excluded
from JSON using `json:"-"` and admin list projections.

### Concurrency and race-condition prevention

The HTTP server handles requests concurrently by default. Handlers avoid shared
mutable state; cart and order state lives in MongoDB. The current numeric
order-number rule is retained for application consistency, but high-volume production
deployments should replace it with an atomic counter or transaction.

## Useful commands

```powershell
cd backend
go test ./...
go run ./cmd/api
go build ./cmd/api
```

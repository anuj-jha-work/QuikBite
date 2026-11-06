# QuikBite Architecture and API Reference

## 1. Request flow

```text
Browser
  │
  │  HTTP request
  │  Authorization: Bearer <JWT>
  ▼
Chi router
  │
  ├── CORS middleware
  ├── authentication middleware
  ├── admin middleware
  └── handler
          │
          ├── repository
          │       └── MongoDB Atlas
          └── Cloudinary upload
```

The frontend never connects directly to MongoDB. It calls the Go API. The API
is responsible for validation, authentication, authorization, database access,
and response formatting.

## 2. Backend layers

| Layer | Location | Responsibility |
| --- | --- | --- |
| Entry point | `backend/cmd/api/main.go` | Load config, connect MongoDB, start and stop the server |
| Configuration | `backend/internal/config` | Read environment variables and reject unsafe production values |
| Models | `backend/internal/models` | Define Go structs and preserve BSON/JSON field names |
| Repository | `backend/internal/repository` | Execute MongoDB queries |
| HTTP API | `backend/internal/httpapi` | Routes, middleware, validation, handlers, and responses |

This separation follows a simple rule: handlers understand HTTP, repositories
understand MongoDB, and models describe data.

## 3. API endpoints

### Public endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/` | API status |
| GET | `/healthz` | Render health check |
| GET | `/api/food/list` | List all foods |
| POST | `/api/user/register` | Register a customer and return a JWT |
| POST | `/api/user/login` | Login and return a JWT |

### Authenticated customer endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/user/me` | Read the current user |
| GET | `/api/cart/get` | Read the user's cart |
| POST | `/api/cart/add` | Add food to the cart |
| POST | `/api/cart/remove` | Remove food from the cart |
| POST | `/api/cart/update` | Set a cart quantity |
| POST | `/api/order/place` | Place an order |
| GET | `/api/order/userorders` | Read the user's order history |

### Admin endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| POST | `/api/food/add` | Create food, optionally with an `image` file |
| PUT | `/api/food/update/:id` | Update food |
| DELETE | `/api/food/remove/:id` | Delete food |
| GET | `/api/order/list` | List all orders |
| POST | `/api/order/status` | Update order status |
| GET | `/api/admin/dashboard` | Read dashboard statistics |
| GET | `/api/admin/users` | Read a sanitized user list |

### Static image endpoint

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/images/*` | Serve local development images |

Unknown routes return a JSON error with `success: false`.

## 4. Authentication and authorization

1. A user registers or logs in.
2. The API verifies the password with bcrypt.
3. The API signs a JWT containing `id`, `name`, `email`, and `isAdmin`.
4. The frontend stores the token and sends it as:

   ```text
   Authorization: Bearer <token>
   ```

5. Authentication middleware validates the token and puts the claims in the
   request context.
6. Admin middleware checks the `isAdmin` claim before admin handlers run.

Tokens expire after seven days. Public registration always creates a normal
customer; it does not grant admin access.

## 5. MongoDB data compatibility

The service uses the existing `quikbite` database and these collections:

- `users`
- `foods`
- `orders`

The Go models preserve existing BSON names, ObjectIDs, timestamps, cart maps,
embedded addresses, payment data, and bcrypt hashes. The application does not
drop or recreate collections, so it can use the existing Atlas data.

## 6. Upload behavior

- Accepted field: `image`
- Accepted types: JPEG, JPG, PNG, and WEBP
- Maximum size: 5 MiB
- Development: stores files under `backend/uploads`
- Production: uploads to Cloudinary and stores the HTTPS URL in MongoDB

Cloudinary is required in production because Render's local filesystem is
ephemeral.

## 7. Configuration

The backend reads configuration from environment variables. Important values:

| Variable | Meaning |
| --- | --- |
| `PORT` | HTTP port supplied by Render or set locally |
| `MONGO_URL` | MongoDB Atlas connection string |
| `MONGO_DATABASE` | Database name |
| `JWT_SECRET` | Secret used to sign tokens |
| `CORS_ORIGINS` | Comma-separated frontend origins |
| `IMAGE_STORAGE` | `local` for development or `cloudinary` in production |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_UPLOAD_PRESET` | Unsigned Cloudinary preset |
| `MAX_BODY_SIZE` | Maximum request body size |

Production validation rejects weak JWT secrets, insecure CORS origins, and
local image storage.

## 8. Important design trade-off

Order numbers currently follow the existing compatibility behavior based on the
previous number. This preserves current application behavior, but a high-volume
system should use an atomic counter or database transaction to prevent two
concurrent requests from receiving the same number.

## Interview summary

> QuikBite uses a layered Go REST API. Chi routes requests through CORS and JWT
> middleware, handlers validate input and call a MongoDB repository, and the
> frontend receives JSON responses. MongoDB stores application data, while
> Cloudinary stores production images because Render's filesystem is
> ephemeral.

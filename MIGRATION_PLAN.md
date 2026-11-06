# QuikBite Go Backend Architecture

## Architecture

The only backend runtime is the Go service started by
`backend/cmd/api/main.go`. It uses Chi, the official MongoDB Go driver, JWT,
bcrypt, standard-library multipart uploads, structured logging, and graceful
shutdown. The React customer and admin applications continue using the same
HTTP API.

## Complete API inventory

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| GET | `/` | Public | API status |
| GET | `/healthz` | Public | Health check |
| GET | `/api/food/list` | Public | List foods |
| POST | `/api/food/add` | Admin | Create food with `image` upload |
| PUT | `/api/food/update/:id` | Admin | Update food |
| DELETE | `/api/food/remove/:id` | Admin | Delete food |
| POST | `/api/user/register` | Public | Register and return JWT |
| POST | `/api/user/login` | Public | Login and return JWT |
| GET | `/api/user/me` | User | Current user |
| GET | `/api/cart/get` | User | Read cart |
| POST | `/api/cart/add` | User | Add cart quantity |
| POST | `/api/cart/remove` | User | Remove cart quantity |
| POST | `/api/cart/update` | User | Set cart quantity |
| POST | `/api/order/place` | User | Place order |
| GET | `/api/order/userorders` | User | User order history |
| GET | `/api/order/list` | Admin | All orders |
| POST | `/api/order/status` | Admin | Update order status |
| GET | `/api/admin/dashboard` | Admin | Dashboard statistics |
| GET | `/api/admin/users` | Admin | Sanitized user list |
| GET | `/images/*` | Public | Serve uploaded images |

Unknown routes return the legacy `{ "success": false, "message": "..." }`
error shape.

## MongoDB compatibility

The service uses the existing `quikbite` database and `users`, `foods`, and
`orders` collections. Existing BSON names, ObjectIDs, timestamps, cart maps,
embedded order addresses/payments, and bcrypt password hashes are preserved.
No collections are dropped or recreated.

## Authentication and uploads

JWTs retain `id`, `name`, `email`, and `isAdmin` claims with seven-day expiry.
Passwords use bcrypt cost 12. Admin routes require both a valid Bearer token and
the admin claim. Password hashes and secrets are never returned or logged.

Uploads accept one `image` multipart field, JPEG/JPG/PNG/WEBP content, and files
up to 5 MiB. Files are stored in `backend/uploads` with generated safe names and
returned as `/images/<filename>`, preserving frontend behavior.

## Configuration

Copy `backend/.env.example` to `backend/.env` and provide `MONGO_URL`,
`JWT_SECRET`, admin settings, and optional upload/body-size settings. The Go
service requires an explicit MongoDB URL and never silently creates a database.

## Implementation checklist

- [x] Go module and environment configuration.
- [x] MongoDB repositories using existing collections and BSON names.
- [x] JWT, bcrypt, authentication, and admin middleware.
- [x] All existing route handlers and response contracts.
- [x] Safe uploads, health check, CORS, limits, logging, and shutdown.
- [x] Unit/handler tests, README, learning guide, and test report.
- [ ] Live Atlas and browser verification with supplied runtime credentials.

## Known operational considerations

1. Local uploads require a persistent volume in container deployments.
2. Order numbers retain the existing numeric compatibility behavior; high-volume
   deployments should replace “last order plus one” with an atomic counter.
3. Live MongoDB, customer UI, and admin UI verification requires configured
   credentials and running frontend processes.

No Node.js backend files, Node backend manifests, Express routes, Mongoose
models, or JavaScript backend runtime are required.

# QuikBite Architecture and API Reference

## Architecture

The backend is the Go service started by
`backend/cmd/api/main.go`. It uses Chi, the official MongoDB Go driver, JWT,
bcrypt, standard-library multipart uploads, structured logging, and graceful
shutdown. The React customer and admin applications consume this HTTP API.

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

Unknown routes return `{ "success": false, "message": "..." }`.

## MongoDB compatibility

The service uses the `quikbite` database and `users`, `foods`, and
`orders` collections. Existing BSON names, ObjectIDs, timestamps, cart maps,
embedded order addresses/payments, and bcrypt password hashes are preserved.
The application never drops or recreates collections.

## Authentication and uploads

JWTs contain `id`, `name`, `email`, and `isAdmin` claims with seven-day expiry.
Passwords use bcrypt cost 12. Admin routes require both a valid Bearer token and
the admin claim. Password hashes and secrets are never returned or logged.

Uploads accept one `image` multipart field, JPEG/JPG/PNG/WEBP content, and files
up to 5 MiB. Local development stores files in `backend/uploads`; production
uses Cloudinary and stores the returned HTTPS URL in MongoDB.

## Configuration

Copy `backend/.env.example` to `backend/.env` and provide `MONGO_URL`,
`JWT_SECRET`, admin settings, CORS origins, and image storage settings. The
service requires an explicit MongoDB URL.

## Operational notes

1. Local uploads are for development only; production uses Cloudinary.
2. Order numbers use the current numeric compatibility behavior; high-volume
   deployments should replace “last order plus one” with an atomic counter.

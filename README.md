# QuikBite

QuikBite is a full-stack food-delivery application. Customers browse food,
manage a cart, and place orders. Admins manage food, users, and order status.

## What this project demonstrates

- React and Vite for two separate frontends
- Go REST API for backend services
- MongoDB Atlas for persistent data
- JWT authentication and bcrypt password hashing
- Role-based access control for admin routes
- Cloudinary for production image uploads
- Render and Vercel deployment without Docker

## Project structure

```text
QuikBite/
├── frontend/   # Customer React application
├── admin/      # Admin React application
└── backend/    # Go API
    ├── cmd/api/              # Application entry point
    └── internal/
        ├── config/           # Environment loading and validation
        ├── httpapi/          # Routes, middleware, and handlers
        ├── models/           # MongoDB and JSON data structures
        └── repository/       # MongoDB queries
```

## How the application works

```text
Customer/Admin browser
        │  HTTP + JSON/JWT
        ▼
      Go API
        │
        ├── MongoDB Atlas: users, foods, orders
        └── Cloudinary: production images
```

The frontends call the Go API using `VITE_API_URL`. The API validates the JWT,
checks permissions, performs the database operation, and returns JSON.

## Run locally

### 1. Configure the backend

Copy `backend/.env.example` to `backend/.env` and add a real MongoDB URL and
local admin credentials. Never commit `.env`.

For local development, the important values are:

```env
PORT=5000
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/quikbite
MONGO_DATABASE=quikbite
JWT_SECRET=use_a_long_random_secret
ADMIN_EMAIL=admin@quikbite.com
ADMIN_PASSWORD=use_a_strong_password
ENVIRONMENT=development
CORS_ORIGINS=http://localhost:5173,http://localhost:5174
IMAGE_STORAGE=local
UPLOAD_DIR=uploads
MAX_BODY_SIZE=10485760
```

### 2. Start the Go API

```powershell
cd backend
go mod download
go test ./...
go run ./cmd/api
```

The API runs on `http://localhost:5000`. Check it at
`http://localhost:5000/healthz`.

### 3. Start the customer frontend

```powershell
cd frontend
npm ci
npm run dev
```

### 4. Start the admin frontend

```powershell
cd admin
npm ci
npm run dev
```

Each frontend needs a `.env` file containing:

```env
VITE_API_URL=http://localhost:5000
```

## Main API features

- Public food listing
- User registration and login
- Current-user profile
- Cart add, remove, and update
- Checkout and order history
- Admin food CRUD
- Admin dashboard statistics
- Admin user and order management
- Image upload

See [ARCHITECTURE.md](./ARCHITECTURE.md) for the complete endpoint table and
data-flow explanation.

## Production deployment

- Customer frontend: Vercel, root directory `frontend`
- Admin frontend: Vercel, root directory `admin`
- Go API: Render native Go service, root directory `backend`
- Database: MongoDB Atlas
- Images: Cloudinary

See [DEPLOYMENT.md](./DEPLOYMENT.md) for the step-by-step deployment guide.

## Interview revision

### Why use a repository layer?

Handlers should deal with HTTP requests and responses, not MongoDB query
details. The repository layer keeps database code separate and makes handlers
easier to test.

### Why use middleware?

Authentication and admin authorization are repeated rules. Middleware applies
them consistently before a protected handler runs.

### Why use context?

`r.Context()` carries request cancellation and deadlines into MongoDB calls.
If the client disconnects, unnecessary database work can stop.

### Why use JWT and bcrypt?

JWT proves which user is making a request. Bcrypt stores passwords as slow,
one-way hashes instead of plain text. The API still checks authorization before
allowing admin operations.

### Why Cloudinary in production?

Render's local filesystem is not guaranteed to persist after a restart or
redeploy. Cloudinary stores images externally and the API saves the resulting
HTTPS URL in MongoDB.

See [GO_LEARNING_GUIDE.md](./GO_LEARNING_GUIDE.md) for definitions, keywords,
and interview answers for the Go concepts used here.

## Verification commands

```powershell
cd backend
gofmt -w .
go test ./...
go vet ./...
go build ./cmd/api

cd ..\frontend
npm run build

cd ..\admin
npm run build
```

## Security rules

Do not commit MongoDB passwords, JWT secrets, admin passwords, Cloudinary
secrets, or `.env` files. Production requires HTTPS CORS origins, a strong JWT
secret, and Cloudinary storage.

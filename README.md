# QuikBite

Full-stack food delivery platform with React customer and admin applications,
a Go backend, MongoDB Atlas, and Cloudinary image storage.

## Architecture

```text
QuikBite/
├── frontend/   # Customer React/Vite application
├── admin/      # Admin React/Vite application
└── backend/    # Go REST API and MongoDB integration
```

The backend is built with Go and provides the `/api/...` REST API, Bearer JWT
authentication, MongoDB persistence, and Cloudinary image uploads.

## Configuration

Copy [`backend/.env.example`](./backend/.env.example) to `backend/.env`.
For local development, use:

```env
PORT=5000
MONGO_URL=your_mongodb_atlas_connection_string
MONGO_DATABASE=quikbite
JWT_SECRET=your_long_random_secret
ADMIN_EMAIL=admin@quikbite.com
ADMIN_PASSWORD=your_admin_password
ENVIRONMENT=development
CORS_ORIGINS=http://localhost:5173,http://localhost:5174
IMAGE_STORAGE=local
UPLOAD_DIR=uploads
MAX_BODY_SIZE=10485760
```

For production, use `ENVIRONMENT=production`, Cloudinary storage, two HTTPS
frontend origins in `CORS_ORIGINS`, and a JWT secret with at least 32
characters. Public registration never creates admin users.

## Local development

Start the Go API:

```bash
cd backend
go mod download
go test ./...
go run ./cmd/api
```

Start the React applications in separate terminals:

```bash
cd frontend
npm ci
npm run dev
```

```bash
cd admin
npm ci
npm run dev
```

## API

The API supports registration/login/profile, food CRUD, carts, checkout,
orders, admin dashboard statistics, users, and image uploads. See
[`ARCHITECTURE.md`](./ARCHITECTURE.md) for the endpoint inventory.

## Documentation

- [`ARCHITECTURE.md`](./ARCHITECTURE.md) — architecture and API contract
- [`TEST_REPORT.md`](./TEST_REPORT.md) — executed checks
- [`GO_LEARNING_GUIDE.md`](./GO_LEARNING_GUIDE.md) — explanation of the Go code
- [`DEPLOYMENT.md`](./DEPLOYMENT.md) — Render and Vercel deployment steps

## Security

Do not commit `.env` files, MongoDB credentials, JWT secrets, Cloudinary
credentials, or production admin passwords. Use Cloudinary in production
because Render's local filesystem is ephemeral.

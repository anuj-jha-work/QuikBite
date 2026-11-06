# QuikBite Deployment: Render + Vercel + MongoDB Atlas

This deployment uses no Docker:

- Go API: Render native Go Web Service
- Customer React/Vite app: Vercel
- Admin React/Vite app: Vercel
- Database: existing MongoDB Atlas
- Images: Cloudinary

## 1. Prepare MongoDB Atlas

1. Keep the existing `quikbite` database and collections.
2. Create or confirm a database user with access to that database.
3. Configure Atlas Network Access so Render can connect.
4. Copy the MongoDB connection string. Never commit it.
5. Confirm an existing user has `isAdmin: true`. Public registration never
   creates admin users.

## 2. Prepare Cloudinary

1. Create a Cloudinary account.
2. Create an unsigned upload preset restricted to image uploads.
3. Set its upload limit to 5 MB or less.
4. Record the Cloudinary cloud name and preset name.

Render's local filesystem is ephemeral, so production must use Cloudinary.

## 3. Deploy the Go backend to Render

Create a **Web Service** connected to this repository:

| Render setting | Value |
| --- | --- |
| Root Directory | `backend` |
| Runtime | `Go` |
| Build Command | `go build -o quikbite-api ./cmd/api` |
| Start Command | `./quikbite-api` |
| Health Check Path | `/healthz` |

Render supplies `PORT`. The Go server binds to `0.0.0.0:$PORT`.

Enter these environment variables in Render:

```text
MONGO_URL=<existing MongoDB Atlas connection string>
MONGO_DATABASE=quikbite
JWT_SECRET=<random secret with at least 32 characters>
ADMIN_EMAIL=<existing admin email>
ADMIN_PASSWORD=<existing admin password>
ENVIRONMENT=production
IMAGE_STORAGE=cloudinary
CLOUDINARY_CLOUD_NAME=<Cloudinary cloud name>
CLOUDINARY_UPLOAD_PRESET=<Cloudinary unsigned preset>
CORS_ORIGINS=https://<customer-vercel-domain>,https://<admin-vercel-domain>
MAX_BODY_SIZE=10485760
```

`CORS_ORIGINS` must contain exactly both HTTPS frontend origins, separated by a
comma with no trailing slash. Production startup rejects missing or insecure
CORS configuration, weak/default JWT secrets, and non-Cloudinary storage.

After deployment, open:

```text
https://<render-service>.onrender.com/healthz
```

Expected response:

```json
{"status":"ok"}
```

## 4. Deploy the customer app to Vercel

1. Create a Vercel project from this repository.
2. Set **Root Directory** to `frontend`.
3. Use the `npm run build` build command.
4. Add this environment variable for Production, Preview, and Development:

```text
VITE_API_URL=https://<render-service>.onrender.com
```

5. Deploy and copy the resulting Vercel domain.

`frontend/vercel.json` handles React Router refreshes and deep links.

## 5. Deploy the admin app to Vercel

1. Create a second Vercel project from this repository.
2. Set **Root Directory** to `admin`.
3. Use the `npm run build` build command.
4. Add:

```text
VITE_API_URL=https://<render-service>.onrender.com
```

5. Deploy and copy the resulting Vercel domain.

`admin/vercel.json` handles React Router refreshes and deep links.

## 6. Update CORS and redeploy Render

After both Vercel deployments, replace the placeholder CORS value in Render:

```text
CORS_ORIGINS=https://customer.example.vercel.app,https://admin.example.vercel.app
```

Save the variables and redeploy the Render service.

## 7. Smoke test the live system

1. Open Render `/healthz`.
2. Open the customer Vercel URL and confirm foods load.
3. Register a customer account and log in.
4. Verify `/api/user/me`, cart operations, checkout, and order history.
5. Open the admin Vercel URL.
6. Log in using the existing MongoDB admin account.
7. Create a food item with an image.
8. Confirm the saved image URL is a Cloudinary HTTPS URL.
9. Update an order status and confirm the customer view changes.

Authentication uses Bearer JWTs stored by the frontends. `withCredentials` is
preserved, but no cross-domain cookie is required by the current auth design.

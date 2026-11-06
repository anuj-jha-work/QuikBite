# QuikBite Deployment Guide

This project uses native deployments. No Dockerfile or Docker Compose file is
required.

## Deployment architecture

| Part | Platform | Directory |
| --- | --- | --- |
| Customer app | Vercel | `frontend` |
| Admin app | Vercel | `admin` |
| Go API | Render Web Service | `backend` |
| Database | MongoDB Atlas | Existing `quikbite` database |
| Images | Cloudinary | External image storage |

## 1. Deploy the Go API to Render

Create a new Render **Web Service** from the GitHub repository:

```text
Root Directory: backend
Build Command: go build -o quikbite-api ./cmd/api
Start Command: ./quikbite-api
Health Check Path: /healthz
```

Add these environment variables in Render:

```text
MONGO_URL=<complete MongoDB Atlas connection string>
MONGO_DATABASE=quikbite
JWT_SECRET=<at least 32 random characters>
ADMIN_EMAIL=<admin login email>
ADMIN_PASSWORD=<strong admin password>
ENVIRONMENT=production
IMAGE_STORAGE=cloudinary
CLOUDINARY_CLOUD_NAME=<Cloudinary cloud name>
CLOUDINARY_UPLOAD_PRESET=<unsigned preset name>
MAX_BODY_SIZE=10485760
```

Do not manually add `PORT`; Render supplies it. Do not paste `MONGO_URL=`,
quotes, or backticks into the value field. Use only the connection-string URL.

## 2. Create the Cloudinary upload preset

1. Open Cloudinary Console.
2. Copy the **Cloud name** from the dashboard.
3. Open **Settings → Upload → Upload presets**.
4. Create a preset and choose **Unsigned** signing mode.
5. Copy the preset name into `CLOUDINARY_UPLOAD_PRESET`.

Never put the Cloudinary API secret in the frontend or commit it to Git.

## 3. Deploy the customer frontend

Create a Vercel project from the same repository:

```text
Root Directory: frontend
Framework: Vite
Build Command: npm run build
Environment variable:
VITE_API_URL=https://<your-render-service>.onrender.com
```

Deploy and copy the generated customer URL.

## 4. Deploy the admin frontend

Create a second Vercel project:

```text
Root Directory: admin
Framework: Vite
Build Command: npm run build
Environment variable:
VITE_API_URL=https://<your-render-service>.onrender.com
```

Deploy and copy the generated admin URL.

## 5. Finish CORS configuration

Return to Render and add:

```text
CORS_ORIGINS=https://customer-url.vercel.app,https://admin-url.vercel.app
```

Use exact HTTPS origins with no trailing slash. Save the change and redeploy
the Render service.

## 6. Production smoke test

Test in this order:

1. `https://<render-service>.onrender.com/healthz`
2. Customer food list
3. Customer registration and login
4. Cart and checkout
5. Customer order history
6. Admin login
7. Admin food creation with image
8. Admin order-status update

If image upload returns `401 Unauthorized`, verify the Cloudinary cloud name,
the preset name, and that the preset is **Unsigned**. If the browser reports a
CORS error, verify the two exact Vercel URLs in `CORS_ORIGINS`.

## Security checklist

- Do not commit `.env` files.
- Do not share MongoDB passwords, JWT secrets, admin passwords, or Cloudinary
  secrets.
- Use a different strong secret for each production environment.
- Keep the old service until the new API and both frontends pass the smoke test.

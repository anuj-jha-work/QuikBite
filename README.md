# QuikBite

QuikBite is a full-stack MERN food delivery application with a customer storefront, a separate admin panel, JWT authentication, MongoDB Atlas persistence, and Multer-based food image uploads.

## Project Structure

```text
QuikBite/
├── frontend/
├── admin/
├── backend/
└── README.md
```

## Tech Stack

- Frontend: React 18, Vite, React Router DOM, Axios, Context API, plain CSS
- Admin: React 18, Vite, React Router DOM, Axios, Context API, plain CSS
- Backend: Node.js, Express.js, MongoDB Atlas, Mongoose, JWT, bcrypt, Multer, dotenv, CORS

## Features

- Customer landing page with hero, categories, popular dishes, menu, about section, and footer
- Search, category filtering, and price sorting
- Cart with quantity controls, subtotal, delivery fee, and grand total
- Checkout flow with delivery details and order success screen
- User authentication with register, login, logout, and JWT-based session loading
- User dashboard with current and previous orders
- Admin dashboard with totals for orders, users, revenue, and foods
- Admin food CRUD with image upload support
- Admin order status management and user listing

## Environment Variables

### Backend

Create a `.env` file inside `backend/`:

```env
PORT=5000
MONGO_URL=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret
ADMIN_EMAIL=admin@quikbite.com
ADMIN_PASSWORD=Admin@12345
```

`ADMIN_EMAIL` and `ADMIN_PASSWORD` are optional, but the seeded demo admin uses those defaults if you keep them as shown.

### Frontend

Create a `.env` file inside `frontend/`:

```env
VITE_API_URL=http://localhost:5000
```

### Admin

Create a `.env` file inside `admin/`:

```env
VITE_API_URL=http://localhost:5000
```

## Installation

Install dependencies separately in each app folder.

### Backend

```bash
cd backend
npm install
npm run server
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Admin

```bash
cd admin
npm install
npm run dev
```

## Database Setup

1. Create a MongoDB Atlas cluster.
2. Add your connection string to `backend/.env` as `MONGO_URL`.
3. Start the backend once to seed demo foods and the default admin user.

## Demo Admin Login

If you keep the default seed credentials, the admin panel login is:

- Email: `admin@quikbite.com`
- Password: `Admin@12345`

## API Endpoints

### Food

- `GET /api/food/list`
- `POST /api/food/add`
- `DELETE /api/food/remove/:id`
- `PUT /api/food/update/:id`

### Authentication

- `POST /api/user/register`
- `POST /api/user/login`
- `GET /api/user/me`

### Cart

- `POST /api/cart/add`
- `POST /api/cart/remove`
- `POST /api/cart/update`
- `GET /api/cart/get`

### Orders

- `POST /api/order/place`
- `GET /api/order/userorders`
- `GET /api/order/list`
- `POST /api/order/status`

### Admin

- `GET /api/admin/dashboard`
- `GET /api/admin/users`

## Image Uploads

Uploaded food images are stored in `backend/uploads` and served through the `/images` static path.

## Notes

- Cart and order routes are protected by JWT.
- Admin routes are protected by JWT plus an admin role check.
- The frontend and admin apps are separate Vite projects and should be run independently.

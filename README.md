# 🛒 QuikBite

A high-performance full-stack MERN food delivery platform featuring a customer-facing storefront, a separate admin controller panel, secure JWT session management, and persistent cloud storage.

## 🚀 Live Links
* **🛒 Customer Storefront:** [Launch Application](https://quikbite-frontend.onrender.com)
* **⚙️ Admin Dashboard:** [Open Controller Panel](https://quikbite-admin.onrender.com)
* **🖥️ Production API:** [View Server Status](https://quikbite-ughj.onrender.com)

---

### 🔑 Quick Demo Access
Explore the administrative and checkout systems instantly without signing up:
* **Admin Email:** `admin@quikbite.com`
* **Admin Password:** `Admin@12345`

---

## 🛠️ Architecture & Tech Stack

```text
QuikBite/
├── frontend/   # Customer React Client (Vite)
├── admin/      # Management React Client (Vite)
└── backend/    # REST API Engine (Node.js & Express)
```

* **Frontend & Admin:** React 18, Vite, React Router DOM, Axios, Context API, Vanilla CSS
* **Database & Storage:** MongoDB Atlas, Mongoose ODM, Multer Engine
* **Security & Auth:** JSON Web Tokens (JWT), Bcrypt Password Hashing, CORS Guards

---

## ⚡ Core Features

### 🛒 Customer Experience
* **Dynamic Menu Engine:** Search, category filtering, and structural price sorting.
* **Live Cart Pipeline:** Quantity modifiers with real-time subtotal and delivery calculations.
* **Secure Checkout Flow:** User address compilation and unified order status processing.
* **Protected Profiles:** JWT persistence across personal order history dashboards.

### ⚙️ Management Hub
* **Metrics Analytics:** Aggregated tracking across real-time platform revenue, active accounts, and products.
* **Inventory Control Panel:** Multi-functional CRUD operations for food items with image storage streams.
* **Order Traffic Control:** Live status modulation (Processing ➔ Out for Delivery ➔ Delivered).

---

## ⚙️ Local Development Startup

### 1. Environment Configurations
Create `.env` profiles in their respective directories using these exact key maps:

```env
# backend/.env
PORT=5000
MONGO_URL=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret

# frontend/.env & admin/.env
VITE_API_URL=http://localhost:5000
```

### 2. Boot Sequence
Run the startup sequence inside each respective project subdirectory:

```bash
# Spin up Backend Engine
cd backend && npm install && npm run server

# Spin up Customer Client
cd frontend && npm install && npm run dev

# Spin up Admin Panel
cd admin && npm install && npm run dev
```

---

## 🔒 Security & Route Design
* Cart actions and purchasing workflows are structurally gatekept behind secure JWT token headers.
* Administrative database mutations require a dual-layer check: a valid signature and an explicit backend admin flag.

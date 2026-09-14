# 🛒 ZamZam Mart - Fullstack E-Commerce Grocery Platform

A modern, fullstack online supermarket and grocery platform built with **Spring Boot 3 (Java 21)** on the backend and **React + Vite + Tailwind CSS** on the frontend.

---

## 🌟 Key Features

### 🛍️ Customer Experience
- **100% Halal & Farm Fresh Catalog**: High-definition product imagery, Halal certified tags, weight/unit indicators, and discount tags.
- **Dynamic Category Explorer**: Fresh Fruits & Vegetables, Halal Meats & Poultry, Dairy & Eggs, Bakery & Delights, Rice & Pantry, Dates & Dry Fruits, and Beverages.
- **Smart Live Search & Sorting**: Instant client & server filtering by product name, description, category, and price/rating sorting.
- **Shopping Cart & Checkout**:
  - Live quantity steppers and cart drawer.
  - Coupon code discounts: `ZAMZAM10` (10% off), `WELCOME20` (20% off), `FREESHIP` (Free delivery).
  - Free delivery progress bar (threshold: ₹499).
  - Multi-step checkout with delivery address, delivery slot selection (Morning, Evening, 2-Hour Express), and payment methods (Cash on Delivery, UPI / QR, Card).
- **Celebratory Order Placement**: Confetti celebration, order confirmation receipt, and live 4-step order tracking timeline (`Placed -> Confirmed -> Shipped -> Delivered`).
- **My Orders**: Real-time tracking and previous order history.
- **Wishlist / Favorites**: Save favorite items with persistent local storage.

### 🛡️ Admin Portal
- Access the Admin Portal by signing into the admin account.
- **Inventory Management**: Create, update, or delete products, manage stock levels, pricing, discount prices, units, and images.
- **Order Fulfillment**: Review customer orders, update order status in real-time (`PENDING`, `CONFIRMED`, `SHIPPED`, `DELIVERED`).
- **Store Analytics**: Real-time dashboard with Total Revenue, Total Orders, Pending Orders, and Low Stock Alerts.

---

## 🚀 Quick Start Guide

### Option 1: One-Click Launch (Windows)
1. Double-click `run-backend.bat` to launch the Spring Boot REST API at `http://localhost:8080`.
2. Double-click `run-frontend.bat` to launch the React frontend at `http://localhost:5173`.

### Option 2: Terminal Launch

#### 1. Backend (Spring Boot 3)
```bash
cd zamZamMart
mvn spring-boot:run
```
- The backend starts on port `8080`.
- **H2 Database Console**: [http://localhost:8080/h2-console](http://localhost:8080/h2-console)
  - JDBC URL: `jdbc:h2:mem:zamzam_mart`
  - User: `sa`
  - Password: *(leave blank)*

#### 2. Frontend (React + Vite)
```bash
cd client
npm run dev
```
- Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Authentication

*(New customers automatically receive an automated Welcome Greeting Email from `zamzammart08@gmail.com`)*

---

## 🗄️ Database Options

1. **H2 In-Memory (Default)**:
   - Configured out of the box in `zamZamMart/src/main/resources/application.properties`. Requires **zero setup** and pre-seeds realistic grocery items, categories, and test users every time it starts.
2. **MySQL Support**:
   - A ready-to-use profile is included in `zamZamMart/src/main/resources/application-mysql.properties`.
   - To connect to your local MySQL service, start with:
     ```bash
     mvn spring-boot:run -Dspring-boot.run.profiles=mysql
     ```

---

## 📡 REST API Endpoints Overview

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register new customer account | Public |
| `POST` | `/api/auth/login` | Login and obtain JWT token | Public |
| `GET` | `/api/categories` | Retrieve all grocery categories | Public |
| `GET` | `/api/products` | Retrieve all products in catalog | Public |
| `GET` | `/api/products/{id}` | Get product details by ID | Public |
| `GET` | `/api/products/search?q={query}` | Search products | Public |
| `POST` | `/api/orders` | Place a customer order | Public / User |
| `GET` | `/api/orders/my-orders` | Fetch logged-in customer's orders | User |
| `GET` | `/api/admin/orders` | View all customer orders | Admin |
| `PUT` | `/api/admin/orders/{id}/status` | Update fulfillment status | Admin |
| `POST` | `/api/admin/products` | Create a new catalog item | Admin |
| `PUT` | `/api/admin/products/{id}` | Update existing catalog item | Admin |
| `DELETE` | `/api/admin/products/{id}` | Remove a product | Admin |
| `GET` | `/api/admin/stats` | Retrieve store revenue and metrics | Admin |


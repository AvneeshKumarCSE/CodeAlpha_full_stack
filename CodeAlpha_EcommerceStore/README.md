# CodeAlpha_EcommerceStore 🛒

A full-stack modern E-Commerce web application developed for the **CodeAlpha Full Stack Development Internship (Task 1)**.

Built with **HTML5, CSS3, JavaScript, Node.js, Express.js, and SQLite**, providing a seamless, zero-configuration shopping experience with responsive design, dynamic cart, secure authentication, and order tracking.

---

## ✨ Features

- **Product Catalog & Search**: Filter products by category (Electronics, Fashion, Home & Kitchen, Accessories) and search in real-time.
- **Product Details View**: View high-resolution photos, detailed product descriptions, stock status, ratings, and quantity selectors.
- **Interactive Shopping Cart**: Slide-out cart drawer with increment/decrement quantity, live subtotal & tax calculation, and persistent storage.
- **User Authentication**: Secure registration and login using `bcryptjs` password hashing and JSON Web Tokens (JWT).
- **Order Processing & Checkout**: Shipping address capture, simulated payment options, immediate receipt confirmation, and order history dashboard.
- **Zero-Configuration Database**: Automatic database table creation and seed data insertion on the first run.
- **Cross-Platform**: 100% compatible across Windows, macOS, and Linux without native build tools or external database engines.

---

## 🚀 Quick Start (Works on All Operating Systems)

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (version 16 or newer)
- npm (bundled with Node.js)

### 2. Installation
Clone the repository and install dependencies:
```bash
git clone https://github.com/<your-username>/CodeAlpha_EcommerceStore.git
cd CodeAlpha_EcommerceStore
npm install
```

### 3. Run the Application
```bash
npm start
```
Open your browser and visit: **`http://localhost:3000`**

*(Optional development mode with auto-reload: `npm run dev`)*

---

## 🔑 Demo Account
For rapid testing and evaluation:
- **Email**: `demo@codealpha.com`
- **Password**: `password123`
*(You can also register a new account directly from the UI or click the "Auto-fill Demo Credentials" button).*

---

## 📡 REST API Documentation

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register a new user | No |
| `POST` | `/api/auth/login` | Log in and receive JWT token | No |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | Yes (Bearer token) |
| `GET` | `/api/products` | Retrieve all products (supports `?category=` and `?search=`) | No |
| `GET` | `/api/products/categories` | Retrieve distinct categories | No |
| `GET` | `/api/products/:id` | Retrieve single product details | No |
| `POST` | `/api/orders` | Place a new order | Yes (Bearer token) |
| `GET` | `/api/orders/my-orders` | Fetch user's order history | Yes (Bearer token) |
| `GET` | `/api/orders/:id` | Fetch specific order details | Yes (Bearer token) |

---

## 📁 Project Structure

```text
CodeAlpha_EcommerceStore/
├── server/
│   ├── config/
│   │   └── database.js          # SQLite connection, migrations & seed data
│   ├── controllers/
│   │   ├── authController.js    # Register, login, profile logic
│   │   ├── productController.js # Catalog queries & filters
│   │   └── orderController.js   # Order placement & history
│   ├── middleware/
│   │   └── authMiddleware.js    # JWT authorization validator
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── productRoutes.js
│   │   └── orderRoutes.js
│   └── server.js                # Express app entrypoint & static serving
├── public/
│   ├── css/
│   │   └── styles.css           # Modern responsive design & animations
│   ├── js/
│   │   ├── api.js               # Client API fetch helper
│   │   ├── auth.js              # Authentication state manager
│   │   ├── cart.js              # Dynamic shopping cart state
│   │   └── app.js               # Main UI controller & modal handling
│   └── index.html               # Frontend single-page interface
├── package.json
└── README.md
```

---

## 📹 Video Walkthrough & Presentation Points (for LinkedIn)
When recording your video explanation for CodeAlpha:
1. **Introduction**: Introduce yourself as a Full Stack Web Development Intern at CodeAlpha.
2. **Overview**: Explain the tech stack (Node.js, Express, SQLite, Vanilla HTML/CSS/JS).
3. **Demo Flow**:
   - Show the product catalog, category filters, and live search bar.
   - Click a product to open the product details modal and view product specifications.
   - Add items to the shopping cart and adjust item quantities in the slide-out drawer.
   - Log in using the demo account or sign up a new user.
   - Complete checkout with shipping address and show the order confirmation receipt.
   - Open "My Orders" to demonstrate data persistence from the SQLite database.
4. **Conclusion**: Mention key engineering achievements (zero external DB config, cross-platform stability, and clean RESTful API design).

---

## 📜 License
This project is part of the CodeAlpha Internship Program.

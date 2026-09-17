# CodeAlpha Full Stack Web Development Internship 🚀

This repository contains both full-stack projects built for the **CodeAlpha Full Stack Web Development Internship**:

1. **[CodeAlpha_EcommerceStore](./CodeAlpha_EcommerceStore/)** (Task 1: Simple E-Commerce Store)
2. **[CodeAlpha_SocialMediaApp](./CodeAlpha_SocialMediaApp/)** (Task 2: Social Media Platform)

Complete documentation, architecture blueprints, test results, and roadmap are detailed in **[all.md](./all.md)**.

---

## 📁 Repository Structure

```text
CodeAlpha_full_stack/
├── CodeAlpha_EcommerceStore/       # Task 1: E-Commerce Store (Port 3000)
│   ├── server/                     # Express REST APIs & SQLite
│   ├── public/                     # HTML5/CSS3/JS Shopping interface
│   ├── package.json
│   └── README.md
│
├── CodeAlpha_SocialMediaApp/        # Task 2: Social Media Platform (Port 5000)
│   ├── server/                     # Express REST APIs & SQLite
│   ├── public/                     # Modern responsive social feed UI
│   ├── package.json
│   └── README.md
│
├── all.md                          # Full technical documentation & test logs
└── README.md                       # Project overview
```

---

## 🛒 Task 1: Simple E-Commerce Store

An end-to-end shopping application featuring product listings, live search, category filtering, product specifications modal, a slide-out cart drawer, and complete order processing.

### Quick Run:
```bash
cd CodeAlpha_EcommerceStore
npm install
npm start
```
Open **`http://localhost:3000`** in your browser.  
*Demo Account*: `demo@codealpha.com` / `password123`

---

## 📱 Task 2: Social Media Platform

A full-featured social platform featuring timeline feeds (Discover & Following), post composer with image attachment, optimistic like/unlike system, threaded comments, user profile inspection, and a dynamic follow/unfollow social graph.

### Quick Run:
```bash
cd CodeAlpha_SocialMediaApp
npm install
npm start
```
Open **`http://localhost:5000`** in your browser.  
*Demo Account*: `alex_dev` / `password123`

---

## 🧪 Verification & Tests
Both projects have automated test suites verifying API health, auth, CRUD operations, and relational database integrity:
```bash
# Run Task 1 tests:
node CodeAlpha_EcommerceStore/server/test/verify.js

# Run Task 2 tests:
node CodeAlpha_SocialMediaApp/server/test/verify.js
```
*(All 14 test cases pass successfully).*

---

## 👨‍💻 Author
- **Avneesh Kumar** ([@AvneeshKumarCSE](https://github.com/AvneeshKumarCSE))
- Intern at **CodeAlpha**

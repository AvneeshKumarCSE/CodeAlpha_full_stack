# CodeAlpha_SocialMediaApp 📱

A modern, full-stack social media web application built for the **CodeAlpha Full Stack Development Internship (Task 2)**.

Crafted with **HTML5, CSS3, JavaScript, Node.js, Express.js, and SQLite**, this platform offers timeline feeds, user profiles, threaded comments, optimistic likes, and a follow/unfollow social network graph.

---

## ✨ Features

- **User Profiles**: View public profiles with avatars, bios, follower/following counts, and author post history.
- **Timeline & Feed**: Explore posts across the community or switch to the personalized "Following" feed.
- **Post Composer**: Publish thoughts and attach image previews with relative time-ago timestamps.
- **Interactive Likes**: Real-time optimistic heart/like toggling with animated micro-interactions.
- **Threaded Comments**: Expandable comment threads beneath posts with instant reply publishing.
- **Follow / Unfollow System**: Dynamic social graph allowing users to follow others, with a "Who to Follow" recommendation widget.
- **Zero-Config Database**: Self-contained SQLite relational database with auto-migrations and realistic community starter seed data.
- **Universal Cross-Platform**: Runs effortlessly on Windows, macOS, and Linux without external DB engines or native compilation build tools.

---

## 🚀 Quick Start (Works on All Operating Systems)

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (version 16 or newer)
- npm (bundled with Node.js)

### 2. Installation
Clone the repository and install dependencies:
```bash
git clone https://github.com/<your-username>/CodeAlpha_SocialMediaApp.git
cd CodeAlpha_SocialMediaApp
npm install
```

### 3. Run the Application
```bash
npm start
```
Open your browser and visit: **`http://localhost:5000`**

*(Optional development mode with live watch: `npm run dev`)*

---

## 🔑 Demo Account
For rapid review and evaluation:
- **Username / Identifier**: `alex_dev` (or `demo@codealpha.com`)
- **Password**: `password123`
*(You can also use the 1-click "Auto-fill Demo Credentials" button in the sign-in modal).*

---

## 📡 REST API Documentation

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Create a new user account | No |
| `POST` | `/api/auth/login` | Login with username/email & password | No |
| `GET` | `/api/auth/me` | Fetch authenticated user profile & stats | Yes (Bearer token) |
| `GET` | `/api/posts` | Fetch timeline posts (supports `?filter=following`) | Optional |
| `POST` | `/api/posts` | Create a new post | Yes (Bearer token) |
| `DELETE` | `/api/posts/:id` | Delete post (author only) | Yes (Bearer token) |
| `POST` | `/api/posts/:id/like` | Toggle like / unlike on a post | Yes (Bearer token) |
| `GET` | `/api/posts/:id/comments` | Fetch comments for a post | No |
| `POST` | `/api/posts/:id/comments` | Add comment to a post | Yes (Bearer token) |
| `GET` | `/api/users/profile/:username` | Fetch public user profile and posts | Optional |
| `PUT` | `/api/users/profile` | Update profile bio/avatar/name | Yes (Bearer token) |
| `POST` | `/api/users/:userId/follow` | Toggle follow / unfollow on a user | Yes (Bearer token) |
| `GET` | `/api/users/suggestions` | Get "Who to follow" recommendations | Optional |

---

## 📁 Project Structure

```text
CodeAlpha_SocialMediaApp/
├── server/
│   ├── config/
│   │   └── database.js          # SQLite connection, schema & auto-seed
│   ├── controllers/
│   │   ├── authController.js    # Register, login, getMe
│   │   ├── userController.js    # Profile & follow/unfollow logic
│   │   ├── postController.js    # Feed posts & like toggles
│   │   └── commentController.js # Comment thread handling
│   ├── middleware/
│   │   └── authMiddleware.js    # JWT authorization validator
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   └── postRoutes.js
│   └── server.js                # Express app entrypoint & static serving
├── public/
│   ├── css/
│   │   └── styles.css           # Twitter/Bluesky-inspired responsive UI
│   ├── js/
│   │   ├── api.js               # Client API fetch wrapper
│   │   ├── auth.js              # Authentication state manager
│   │   └── app.js               # Main timeline controller & modals
│   └── index.html               # Single-page client interface
├── package.json
└── README.md
```

---

## 📹 Video Walkthrough & Presentation Points (for LinkedIn)
When recording your video explanation for CodeAlpha:
1. **Introduction**: State your name and your role as a Full Stack Web Development Intern at CodeAlpha.
2. **Overview**: Explain the architecture (Node.js, Express, SQLite, and vanilla HTML/CSS/JS).
3. **Demo Flow**:
   - Show the discovery timeline and scroll through seeded community posts.
   - Click like on a post to demonstrate the optimistic UI heart animation and instant counter update.
   - Expand the comment drawer and post a comment.
   - Click the author's avatar or username to view their public profile modal, bio, and follower metrics.
   - Follow/unfollow a user and show the counter update.
   - Create a brand-new post with text and an image URL, and show it appearing instantly at the top of the feed.
4. **Conclusion**: Emphasize how SQLite provides zero-friction setup for anyone cloning the repository on Windows, Mac, or Linux.

---

## 📜 License
This project is part of the CodeAlpha Internship Program.

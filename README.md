# 🚀 FocusFlow

> A full-stack Pomodoro & Task Management application — stay in flow, get things done.


![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react) ![Express](https://img.shields.io/badge/Express-Node.js-339933?style=flat&logo=node.js) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-4169E1?style=flat&logo=postgresql) ![Tailwind](https://img.shields.io/badge/Tailwind-v4-06B6D4?style=flat&logo=tailwindcss) ![Vercel](https://img.shields.io/badge/Deployed-Vercel-black?style=flat&logo=vercel)

---

## 📖 About

FocusFlow combines the **Pomodoro technique** with **task management** in one clean interface. Create and track tasks, run focused 25-minute sessions with a built-in timer, and watch your productivity stats update in real time. Features a personalized greeting dashboard, live clock, dark/light mode, and full authentication.

---

## ✨ Features

### 🔐 Authentication
- JWT-based registration and login
- Persistent sessions via `localStorage` token
- Protected routes — dashboard requires valid token
- Auto-login on refresh via `/auth/me` verification

### ✅ Task Management
- Full CRUD — Create, Read, Update, Delete tasks
- Three statuses: `Todo`, `In Progress`, `Completed`
- Inline editing of title and description
- One-click completion with animated checkbox
- Focus mode — link any task to the Pomodoro timer

### ⏱️ Pomodoro Timer
- 25-minute focus session countdown
- SVG progress ring that fills as time runs down
- Start, pause, and reset controls
- Audio notification on session complete
- Modal prompt to mark linked task as complete

### 🏠 Dashboard
- Personalized greeting — Good Morning/Afternoon/Evening + username
- Live clock widget — updates every second automatically
- Stats widgets — Total, Completed, In Progress, Completion rate %
- Dynamic message that changes based on your progress

### 🎨 Design & UX
- Dark / Light mode toggle — auto-detects system preference
- Theme persists across sessions via `localStorage`
- **Syne** + **DM Sans** fonts — modern, distinctive typography
- Violet/Indigo pastel accent palette
- Fully responsive — mobile and desktop
- Smooth 200ms transitions between modes

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 (Vite), Tailwind CSS v4, React Router v6 |
| Backend | Node.js, Express.js (ES Modules) |
| Database | PostgreSQL (Neon.tech — serverless) |
| Auth | JWT (jsonwebtoken), bcrypt |
| Validation | Zod (type-safe request schemas) |
| HTTP Client | Axios (with request interceptor) |
| Notifications | react-hot-toast |
| Deployment | Vercel (frontend) + Render (backend) |

---

## 🏛️ Architecture

```
focus-flow/
├── front-end/client/       # React + Vite frontend
│   ├── src/
│   │   ├── api/            # Axios instance
│   │   ├── context/        # AuthContext, ThemeContext
│   │   ├── components/     # Timer, TaskList, ProtectedRoute, ThemeToggle
│   │   ├── pages/          # Login, Register, Dashboard
│   │   └── index.css       # Tailwind v4 + custom theme
│   ├── .env                # VITE_API_BASE_URL
│   └── vercel.json         # SPA routing rewrite
└── server/                 # Express API
    └── src/
        ├── controllers/    # authController, taskController
        ├── services/       # authService
        ├── routes/         # auth.mjs, taskRoutes.mjs
        ├── middleware/     # authMiddleware, errorMiddleware
        ├── validations/    # Zod schemas
        ├── db/             # PostgreSQL pool (index.mjs)
        └── app.mjs         # Express entry point
```

---

## 🚀 Local Setup

### Prerequisites
- Node.js v18+
- PostgreSQL database (local or [Neon.tech](https://neon.tech))
- Git

### 1. Clone the repository
```bash
git clone https://github.com/niamul007/focus-flow.git
cd focus-flow
```

### 2. Setup the Backend
```bash
cd server
npm install
```

Create a `.env` file in `/server`:
```env
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your_long_random_secret
PORT=5000
```

```bash
npm run dev
```

### 3. Setup the Frontend
```bash
cd front-end/client
npm install
```

Create a `.env` file in `/front-end/client`:
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

```bash
npm run dev
```

App runs at **http://localhost:5173**

---

## 🌐 Deployment

### Backend — Render
- Connect your GitHub repo to Render
- Set **Root Directory** to: `server`
- **Build Command:** `npm install`
- **Start Command:** `node src/app.mjs`
- Add environment variables: `DATABASE_URL`, `JWT_SECRET`

### Frontend — Vercel
- Connect your GitHub repo to Vercel
- Set **Root Directory** to: `front-end/client`
- Add environment variable: `VITE_API_BASE_URL` = your Render URL + `/api`
- `vercel.json` handles SPA routing automatically

---

## 📡 API Reference

### Auth Routes — `/api/auth`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | Register new user — `{ username, email, password }` |
| POST | `/login` | Login — `{ email, password }` — returns JWT token |
| GET | `/me` | Get current user — requires Bearer token |

### Task Routes — `/api/tasks` (all protected)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get all tasks for logged-in user |
| POST | `/` | Create task — `{ title, description, status }` |
| PUT | `/:id` | Update task — `{ title?, description?, status? }` |
| DELETE | `/:id` | Delete a task by ID |

---

## ✅ Project Progress

- [x] Initial Repository Architecture
- [x] Express Server with ES Modules
- [x] PostgreSQL Connection Pool (Neon.tech)
- [x] SQL Schema & Table Creation
- [x] User Authentication & JWT
- [x] Task Management CRUD
- [x] React Frontend (Vite + Tailwind v4)
- [x] Pomodoro Timer with SVG progress ring
- [x] Dark / Light Mode with system detection
- [x] Personalized Dashboard with live clock
- [x] Deployed — Vercel + Render
- [x] CORS configured for production

---

## 📄 License

MIT License — feel free to use and build on this project.

---

<p align="center">Built by Niamul &nbsp;·&nbsp; FocusFlow &nbsp;·&nbsp; Stay in flow. 🚀</p>

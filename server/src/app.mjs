/**
 * APP.MJS — THE ENTRY POINT
 * -------------------------
 * This is the first file Node.js runs. It creates the Express app,
 * wires up all the middleware, mounts the routes, and starts the server.
 * Think of it as the "main switchboard" of your backend.
 */

// ─── IMPORTS ─────────────────────────────────────────────────────────────────

// Express: the framework that handles HTTP requests and responses
import express from "express";

// CORS: allows your Vercel frontend to talk to this Render backend
// Without this, browsers would block all cross-origin requests
import cors from "cors";

// Dotenv: loads your .env file into process.env so you can use
// process.env.PORT, process.env.JWT_SECRET, etc. throughout the app
import dotenv from "dotenv";

// Route handlers — each file contains a group of related endpoints
import authRoutes from "./routes/auth.mjs";   // /api/auth/*
import taskRoutes from "./routes/taskRoutes.mjs"; // /api/tasks/*

// Global error handler — catches any error passed via next(err) anywhere in the app
import { globalErrorHandler } from "./middleware/errorMiddleware.mjs";

// AppError — a custom error class that lets us create errors with
// a message AND a status code (e.g. 404, 401, 500)
import AppError from "./utils/appError.mjs";

// ─── INITIALIZATION ───────────────────────────────────────────────────────────

// Load .env file — must be called before reading any process.env values
dotenv.config();

// Create the Express application instance
const app = express();

// PORT: use Render's assigned port in production, fall back to 5000 locally
// Render sets process.env.PORT automatically — hardcoding 5000 would break deployment
const PORT = process.env.PORT || 5000;

// ─── CORS CONFIGURATION ───────────────────────────────────────────────────────

/**
 * CORS (Cross-Origin Resource Sharing)
 * -------------------------------------
 * Browsers block requests between different origins by default.
 * Since your frontend (Vercel) and backend (Render) are on different URLs,
 * we must explicitly tell the server which origins are allowed.
 *
 * origin       → whitelist of allowed frontend URLs
 * methods      → which HTTP verbs are permitted
 * allowedHeaders → which request headers the frontend can send
 * credentials  → allows Authorization header (Bearer token) to be sent
 */
const corsOptions = {
  origin: [
    "https://focusflow-frontend-seven.vercel.app", // production frontend
    "http://localhost:5173", // Vite dev server (default port)
    "http://localhost:5174", // Vite dev server (fallback port)
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  // OPTIONS is required — browsers send a "preflight" OPTIONS request
  // before every real request to check if CORS will allow it

  allowedHeaders: ["Content-Type", "Authorization"],
  // Content-Type → needed to send JSON in request body
  // Authorization → needed to send "Bearer <token>" for protected routes

  credentials: true,
  // Must be true when sending Authorization headers cross-origin
};

// ─── GLOBAL MIDDLEWARE ────────────────────────────────────────────────────────

// Apply CORS to every incoming request — must be before routes
app.use(cors(corsOptions));

// Parse incoming JSON request bodies into req.body
// Without this, req.body would be undefined
app.use(express.json());

// ─── HEALTH CHECK ─────────────────────────────────────────────────────────────

/**
 * GET /health
 * -----------
 * A simple endpoint to verify the server is running.
 * Useful for checking if Render has woken up from sleep,
 * and for monitoring tools to ping periodically.
 */
app.get("/health", (req, res) => {
  res.status(200).json({ status: "FocusFlow Server is flowing... 🌊" });
});

// ─── ROUTES ───────────────────────────────────────────────────────────────────

// Mount auth routes — all endpoints in auth.mjs will be prefixed with /api/auth
// e.g. POST /api/auth/login, POST /api/auth/register, GET /api/auth/me
app.use("/api/auth", authRoutes);

// Mount task routes — all endpoints in taskRoutes.mjs prefixed with /api/tasks
// e.g. GET /api/tasks, POST /api/tasks, PUT /api/tasks/:id
app.use("/api/tasks", taskRoutes);

// ─── 404 HANDLER ──────────────────────────────────────────────────────────────

/**
 * Catch-all for undefined routes.
 * If a request reaches here, no route above matched it.
 * We create a 404 AppError and pass it to the global error handler via next().
 * req.originalUrl contains the URL the client tried to access.
 */
app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

// ─── GLOBAL ERROR HANDLER ─────────────────────────────────────────────────────

/**
 * Must be registered LAST — after all routes and middleware.
 * Express identifies error-handling middleware by its 4 parameters: (err, req, res, next).
 * Any time next(err) is called anywhere in the app, execution jumps here.
 */
app.use(globalErrorHandler);

// ─── START SERVER ─────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`
  🚀 FocusFlow Engine Started!
  📡 URL: http://localhost:${PORT}
  🛠️  Routes: /api/auth & /api/tasks
  `);
});
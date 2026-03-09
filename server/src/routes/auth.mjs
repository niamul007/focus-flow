/**
 * ROUTES/AUTH.MJS — AUTHENTICATION ROUTES
 * ----------------------------------------
 * This file defines all routes related to user authentication.
 * It uses express.Router() to create a mini-app that handles
 * only auth-related endpoints.
 *
 * These routes are mounted in app.mjs at /api/auth, so:
 * /me       → becomes GET  /api/auth/me
 * /register → becomes POST /api/auth/register
 * /login    → becomes POST /api/auth/login
 */

import express from "express";

// The two controller functions that contain the actual auth logic
import { register, login } from "../controllers/authController.mjs";

// protect middleware — verifies JWT token and attaches user to req.user
// Used to guard routes that require the user to be logged in
import { protect } from "../middleware/authMiddleware.mjs";

// Zod validation schemas — define the shape of valid request bodies
// signupSchema: requires username, email, password
// loginSchema: requires email, password
import { signupSchema, loginSchema } from "../validations/authValidation.mjs";

// validate() is a middleware factory — it takes a Zod schema and returns
// a middleware function that validates req.body against that schema
import { validate } from "../validations/validate.mjs";

/**
 * Create a Router instance.
 * This is a mini Express app that only handles auth routes.
 * It gets mounted onto the main app in app.mjs at /api/auth.
 */
const router = express.Router();

// ─── ROUTES ───────────────────────────────────────────────────────────────────

/**
 * GET /api/auth/me — Get current logged-in user
 * ------------------------------------------------
 * PROTECTED: requires a valid JWT token in the Authorization header.
 *
 * Middleware chain:
 * 1. protect → verifies token, attaches user to req.user, calls next()
 *              if token is missing or invalid, sends 401 and stops here
 * 2. (req, res) → if protect passed, sends back the user object
 *
 * Used by AuthContext on page refresh to restore the user session
 * without requiring a new login.
 */
router.get("/me", protect, (req, res) => {
  res.json({ message: "You are authorized!", user: req.user });
});

/**
 * POST /api/auth/register — Create a new user account
 * -----------------------------------------------------
 * PUBLIC: no token required.
 *
 * Middleware chain:
 * 1. validate(signupSchema) → checks req.body has valid username, email, password
 *                             sends 400 with error details if invalid, stops here
 * 2. register → if validation passed, creates the user in the database
 *               and returns a JWT token
 */
router.post("/register", validate(signupSchema), register);

/**
 * POST /api/auth/login — Login with existing credentials
 * -------------------------------------------------------
 * PUBLIC: no token required.
 *
 * Middleware chain:
 * 1. validate(loginSchema) → checks req.body has valid email and password
 *                            sends 400 if invalid, stops here
 * 2. login → if validation passed, verifies credentials against database
 *            and returns a JWT token if correct
 */
router.post("/login", validate(loginSchema), login);

// Export the router so app.mjs can mount it
export default router;
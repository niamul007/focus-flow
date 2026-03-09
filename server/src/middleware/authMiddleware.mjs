/**
 * MIDDLEWARE/AUTHMIDDLEWARE.MJS — JWT AUTHENTICATION GUARD
 * ---------------------------------------------------------
 * This middleware protects private routes by verifying the JWT token
 * sent in the Authorization header of every request.
 *
 * HOW IT FITS IN THE REQUEST LIFECYCLE:
 * 1. Request arrives at a protected route (e.g. GET /api/tasks)
 * 2. protect runs BEFORE the controller
 * 3. If token is valid → attaches user to req.user → calls next()
 * 4. Controller runs with req.user already available
 * 5. If token is invalid/missing → sends 401 → controller never runs
 */

import jwt from "jsonwebtoken";
import pool from "../db/index.mjs";

/**
 * protect — Authentication middleware
 *
 * Verifies the JWT token from the Authorization header,
 * fetches the full user from the database,
 * and attaches them to req.user for downstream use.
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Calls the next middleware in the chain
 */
export const protect = async (req, res, next) => {
  try {
    /**
     * Step 1: Extract the Authorization header
     * The frontend sends: "Authorization: Bearer eyJhbG..."
     * req.headers is an object of all request headers.
     * req.headers.authorization grabs specifically the Authorization header.
     * Visible in Chrome DevTools → Network → Request Headers
     */
    const authHeader = req.headers.authorization;

    /**
     * Step 2: Validate the header exists and has correct format
     * We check two things:
     * - authHeader exists (not undefined/null)
     * - It starts with "Bearer " (correct token format)
     * If either fails, reject immediately with 401 Unauthorized.
     */
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token, authorization denied" });
    }

    /**
     * Step 3: Extract the raw token from the header
     * The header value is: "Bearer eyJhbGciOiJIUzI1NiJ9..."
     * .split(" ") splits at the space → ["Bearer", "eyJhbG..."]
     * [1] grabs the second item → the raw token without "Bearer "
     */
    const token = authHeader.split(" ")[1];

    /**
     * Step 4: Verify and decode the token
     * jwt.verify() does two things simultaneously:
     * - Verifies the token was signed with our JWT_SECRET (not tampered with)
     * - Decodes the payload baked inside: { id: 5, iat: ..., exp: ... }
     *
     * The id was put there during login in authController:
     * jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1d' })
     *
     * If token is expired, modified, or signed with wrong secret,
     * jwt.verify() throws an error → caught below → sends 401
     */
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    /**
     * Step 5: Fetch the full user from the database
     * The token only contains the user's ID.
     * We query the database to get their full profile (email, username).
     *
     * $1 is a parameterized placeholder — pg replaces it with decoded.id safely.
     * This prevents SQL injection attacks.
     *
     * result.rows is always an array even if one row matches.
     * result.rows[0] gets the first (and only) matching user object.
     */
    const result = await pool.query(
      "SELECT id, email, username FROM users WHERE id = $1",
      [decoded.id]
    );

    /**
     * Step 6: Check the user still exists
     * The token might be valid but the user account could have been deleted.
     * If no rows returned, the user doesn't exist → reject with 401.
     */
    if (result.rows.length === 0) {
      return res.status(401).json({ message: "User not found" });
    }

    /**
     * Step 7: Attach user to req and continue
     * req.user = { id: 5, email: "...", username: "Niamul" }
     *
     * req is like a bag that travels through the whole middleware chain.
     * Anything we attach to req here is available in every subsequent
     * middleware and controller — no need to query the database again.
     *
     * next() passes control to the next middleware or route handler.
     */
    req.user = result.rows[0];
    next();

  } catch (error) {
    /**
     * Catches any error from jwt.verify() — expired token, wrong secret,
     * malformed token, or database errors.
     * Sends 401 without revealing details about what specifically failed.
     */
    console.error("JWT Verification Error:", error.message);
    res.status(401).json({ message: "Token not valid" });
  }
};
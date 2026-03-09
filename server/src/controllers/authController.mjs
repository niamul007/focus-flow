/**
 * CONTROLLERS/AUTHCONTROLLER.MJS — AUTHENTICATION LOGIC
 * -------------------------------------------------------
 * Controllers are the "action handlers" of your API.
 * They receive the request (after middleware has validated it),
 * execute the business logic, and send back a response.
 *
 * This file handles two actions:
 * - register: create a new user account
 * - login: verify credentials and issue a JWT token
 *
 * Controllers are kept thin — heavy database work is delegated
 * to authService to keep concerns separated.
 */

// authService contains the actual database queries (INSERT, SELECT)
// We import everything as a namespace with * as authService
import * as authService from "../services/authService.mjs";

// bcrypt: used to compare plain passwords against stored hashes
// Never stores or compares plain passwords directly
import bcrypt from "bcrypt";

// jsonwebtoken: used to create and sign JWT tokens
// These tokens are what the frontend stores and sends on every request
import jwt from "jsonwebtoken";

/**
 * POST /api/auth/register — Create a new user
 * ---------------------------------------------
 * Flow:
 * 1. Extract user data from request body
 * 2. Save user to database via authService (password gets hashed there)
 * 3. Create a JWT token with the new user's ID
 * 4. Send back the token and user data
 *
 * HTTP 201 = "Created" — used when something new is created in the database
 */
export const register = async (req, res) => {
  // req.body contains the data sent from the frontend registration form
  // { username, email, password } — parsed by express.json() middleware
  // This is the BODY of the request, NOT the headers
  const { email, password, username } = req.body;

  try {
    /**
     * Step 1: Save user to database
     * authService.registerUser() handles:
     * - Hashing the password with bcrypt
     * - Running the INSERT SQL query
     * - Returning the newly created user row including its auto-generated id
     */
    const user = await authService.registerUser(email, password, username);

    /**
     * Step 2: Create a JWT token
     * jwt.sign(payload, secret, options)
     *
     * payload  { id: user.id } — the data baked into the token.
     *          Only the ID — never put passwords or sensitive data here.
     *          The payload is encoded not encrypted — readable by anyone.
     *          The secret just proves it wasn't tampered with.
     *
     * secret   JWT_SECRET from .env — the private key for signing.
     *          Fallback "dev_secret_key" for local dev only.
     *          In production this must always be set in environment variables.
     *
     * expiresIn "1d" — token expires after 1 day.
     *          Other options: "7d", "1h", "15m", "30s"
     *          After expiry jwt.verify() throws an error → user gets 401
     */
    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET || "dev_secret_key",
      { expiresIn: "1d" },
    );

    /**
     * Step 3: Send success response
     * HTTP 201 = Created
     * We send back the token so the frontend can store it immediately
     * in localStorage — the user is logged in right after registering.
     */
    res.status(201).json({
      status: "success",
      token: token,
      message: "Welcome to FocusFlow!",
      data: {
        user: {
          id: user.id,
          email: user.email,
          username: user.username || "New User",
        },
      },
    });
  } catch (err) {
    // HTTP 500 = Internal Server Error
    // Could be a duplicate email, database connection issue, etc.
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ status: "error", message: err.message });
  }
};

/**
 * POST /api/auth/login — Authenticate existing user
 * ---------------------------------------------------
 * Flow:
 * 1. Extract credentials from request body
 * 2. Find user by email in database
 * 3. Compare submitted password against stored hash using bcrypt
 * 4. Generate a fresh JWT token
 * 5. Send back the token and user data
 *
 * HTTP 200 = OK — the standard success response for existing data
 */
export const login = async (req, res) => {
  try {
    // Extract email and password from request body
    // Note: no username needed for login — email is the unique identifier
    const { email, password } = req.body;

    /**
     * Step 1: Find the user by email
     * authService.findUserByEmail() runs:
     * SELECT * FROM users WHERE email = $1
     * Returns the full user row including password_hash column,
     * or null if no user with that email exists.
     */
    const user = await authService.findUserByEmail(email);

    // If no user found, reject immediately
    // We say "Invalid Credentials" not "Email not found" — this is intentional.
    // Telling attackers which field is wrong helps them narrow their attack.
    if (!user) {
      return res
        .status(401)
        .json({ status: "fail", message: "Invalid Credentials" });
    }

    /**
     * Step 2: Compare passwords
     * password          = what the user just typed in the login form (plain text)
     * user.password_hash = the bcrypt hash stored in the database column
     *
     * bcrypt.compare() re-hashes the plain password and compares it
     * to the stored hash. Returns true if they match, false if not.
     *
     * We NEVER store plain passwords. If the database is hacked,
     * attackers only get hashes which cannot be reversed.
     *
     * The 'password_hash' name is just our PostgreSQL column name —
     * it's not a bcrypt method, it's just where we store the hash.
     */
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res
        .status(401)
        .json({ status: "fail", message: "Invalid Credentials" });
    }

    /**
     * Step 3: Generate a fresh JWT token
     * We generate a new token on every login because:
     * - The token IS the session — it's how the frontend proves identity
     * - Without a token, even a successful login would be useless
     * - The frontend stores this token in localStorage and sends it
     *   in the Authorization header on every subsequent request
     *
     * Think of it as a theme park wristband — you show your ID once
     * at the gate (login) and get a wristband (token) to use all day.
     */
    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET || "dev_secret_key",
      { expiresIn: "1d" },
    );

    // HTTP 200 = OK
    // Send token and user data back to the frontend
    return res.status(200).json({
      status: "success",
      token: token,
      message: "Login successful",
      data: {
        user: {
          id: user.id,
          email: user.email,
          username: user.username
        },
      },
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ status: "error", message: "Check server terminal" });
  }
};
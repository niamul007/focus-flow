/**
 * SERVICES/AUTHSERVICE.MJS — DATABASE OPERATIONS FOR AUTH
 * ---------------------------------------------------------
 * Services contain the actual database queries.
 * Controllers handle HTTP (req/res), services handle data.
 *
 * This separation means:
 * - Controllers stay thin and readable
 * - Database logic is reusable across multiple controllers
 * - Easier to test each layer independently
 *
 * This file exports three functions:
 * - registerUser   → create a new user in the database
 * - findUserByEmail → find a user by their email address
 * - loginUser      → verify credentials and return user (currently unused in controller)
 */

import pool from '../db/index.mjs';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

/**
 * registerUser — Create a new user account
 * ------------------------------------------
 * @param {string} email
 * @param {string} password — plain text, gets hashed here
 * @param {string} username
 * @returns {Object} newly created user row { id, email, username }
 * @throws {Error} if email already exists in database
 */
export const registerUser = async (email, password, username) => {

  /**
   * Step 1: Check if email is already taken
   * We query for any user with this email.
   * result.rows.length > 0 means a user was found → email taken → throw error
   * The controller's catch block will handle this and send 500 back to frontend
   */
  const userExists = await pool.query(
    'SELECT * FROM users WHERE email = $1',
    [email]
  );
  if (userExists.rows.length > 0) {
    throw new Error('User already exists with this email');
  }

  /**
   * Step 2: Hash the password with bcrypt
   *
   * saltRounds = 10 — bcrypt runs the hashing algorithm 2^10 = 1024 times.
   * More rounds = harder to crack but slower. 10 is the industry standard.
   *
   * A "salt" is a random string bcrypt generates and adds to the password
   * before hashing. This means the same password always produces a different
   * hash — making pre-computed attack tables (rainbow tables) useless.
   *
   * bcrypt.hash(plainPassword, saltRounds)
   * → returns a 60-character hash string
   * → the salt is embedded inside the hash automatically
   * → always async, always use await
   *
   * We NEVER store the plain password. Ever.
   */
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  /**
   * Step 3: Insert the new user into the database
   *
   * RETURNING id, email, username — tells PostgreSQL to send back
   * the newly created row after inserting. This is how we get the
   * auto-generated id that PostgreSQL assigned to this user.
   *
   * We store hashedPassword in password_hash column — never the plain password.
   * We do NOT select password_hash in RETURNING — no need to bring it back.
   */
  const newUser = await pool.query(
    'INSERT INTO users (email, password_hash, username) VALUES ($1, $2, $3) RETURNING id, email, username',
    [email, hashedPassword, username]
  );

  /**
   * result.rows[0] is the newly created user object:
   * { id: 7, email: "niamul@test.com", username: "Niamul" }
   * This gets returned to authController where jwt.sign({ id: user.id }) uses it
   */
  return newUser.rows[0];
};

/**
 * findUserByEmail — Retrieve a user by email address
 * ----------------------------------------------------
 * @param {string} email
 * @returns {Object|undefined} full user row including password_hash, or undefined if not found
 *
 * NOTE: This returns the password_hash because the login controller
 * needs it to run bcrypt.compare(). It should never be sent to the frontend.
 */
export const findUserByEmail = async (email) => {
  try {
    const sql = 'SELECT * FROM users WHERE email = $1';
    const result = await pool.query(sql, [email]);

    // result.rows[0] returns the user object or undefined if no user found
    // The controller checks for undefined and handles it
    return result.rows[0];
  } catch (error) {
    // If the database itself is down or query fails, log and re-throw
    // "throw error" sends it up to whoever called this function
    // The controller's catch block then handles it and sends 500
    console.error("Database Error in findUserByEmail:", error);
    throw error;
  }
};

/**
 * loginUser — Verify credentials and return user without password hash
 * ---------------------------------------------------------------------
 * NOTE: This function is currently not used by authController.
 * The controller duplicates this logic manually (findUserByEmail + bcrypt.compare).
 * This could be cleaned up by calling authService.loginUser() in the controller instead.
 *
 * @param {string} email
 * @param {string} password — plain text from login form
 * @returns {Object} user object WITHOUT password_hash
 * @throws {Error} with statusCode 401 if credentials are invalid
 */

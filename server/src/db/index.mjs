/**
 * DB/INDEX.MJS — DATABASE CONNECTION POOL
 * ----------------------------------------
 * This file creates and exports a single PostgreSQL connection pool
 * that is shared across the entire application.
 *
 * WHY A POOL?
 * Opening a new database connection for every request is slow and
 * wastes resources. A Pool keeps multiple connections open and ready,
 * handing them out to requests as needed and returning them when done.
 * Think of it as a taxi company — cars waiting outside rather than
 * being called from scratch each time.
 *
 * WHY ONLY ONE POOL?
 * We export this single pool instance and import it wherever we need
 * to query the database. This is called the Singleton pattern — one
 * shared instance across the whole app rather than creating a new
 * pool in every file.
 */

// pg is the official Node.js driver for PostgreSQL.
// We use this import style (import pkg, then destructure) because
// pg is a CommonJS package and our project uses ES Modules (.mjs).
// Direct named imports like { Pool } from 'pg' can fail with CommonJS packages.
import pkg from 'pg';
const { Pool } = pkg;

// dotenv loads our .env file so process.env.DATABASE_URL is available
import dotenv from 'dotenv';
dotenv.config();

/**
 * Create the connection pool.
 *
 * connectionString: the full PostgreSQL URL from Neon.tech, stored
 * in .env as DATABASE_URL. It contains the host, port, database name,
 * username and password all in one string.
 * Format: postgresql://user:password@host/database
 *
 * ssl.rejectUnauthorized: false — Neon uses SSL to encrypt connections.
 * This setting tells Node.js not to verify the SSL certificate authority,
 * which is required for Neon's cloud certificates to work without errors.
 * The connection is still encrypted — we just skip strict cert verification.
 */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

/**
 * Connection event listener.
 * Fires every time the pool successfully opens a new connection.
 * Useful for confirming the database is reachable on startup.
 * In production you might remove this or replace with a proper logger.
 */
pool.on('connect', () => {
  console.log('🐘 Connected to the Neon Postgres database');
});

/**
 * Export the pool as the default export.
 * Any file that needs to query the database imports this pool:
 *
 * import pool from '../db/index.mjs';
 * const result = await pool.query('SELECT * FROM tasks WHERE user_id = $1', [userId]);
 */
export default pool;
import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

// The Pool manages multiple connections to Neon for us
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// A helper to let us see if the connection is working
pool.on('connect', () => {
  console.log('🐘 Connected to the Neon Postgres database');
});

export default pool;
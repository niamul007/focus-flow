import pool from '../db/index.mjs'
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const registerUser = async (email, password) => {
    // 1. Check if user already exists
    const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userExists.rows.length > 0) {
        throw new Error('User already exists with this email');
    }

    // 2. Hash the password (Leaving the comfort zone!)
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 3. Save to Neon
    const newUser = await pool.query(
        'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email',
        [email, hashedPassword]
    );

    return newUser.rows[0];
};


export const findUserByEmail = async (email) => {
    // We use a try/catch here in case the database is down
    try {
        const sql = 'SELECT * FROM users WHERE email = $1';
        const result = await pool.query(sql, [email]);
        return result.rows[0]; 
    } catch (error) {
        console.error("Database Error in findUserByEmail:", error);
        throw error; // Send the error up to the controller
    }
}

export const loginUser = async (email, password) => {
    // Logic for login will go here next...
};
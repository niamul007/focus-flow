import pool from '../db/index.mjs'
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// 1. ADD 'name' TO THE PARAMETERS HERE:
export const registerUser = async (email, password, username) => {
    // Check if user already exists
    const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userExists.rows.length > 0) {
        throw new Error('User already exists with this email');
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 2. NOW 'name' IS DEFINED AND CAN BE SAVED!
    const newUser = await pool.query(
    'INSERT INTO users (email, password_hash, username) VALUES ($1, $2, $3) RETURNING id, email, username',
    [email, hashedPassword, username] 
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
    // 1. Find the user by email
    const user = await findUserByEmail(email);

    // 2. If no user exists, we throw a 401-style error
    if (!user) {
        const error = new Error('Invalid email or password');
        error.statusCode = 401;
        throw error;
    }

    // 3. Compare the "Plain Text" password from the user 
    // with the "Hashed" password from Neon
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
        const error = new Error('Invalid email or password');
        error.statusCode = 401;
        throw error;
    }

    // 4. If everything is correct, return the user (without the hash!)
    const { password_hash, ...userWithoutHash } = user;
    return userWithoutHash;
};
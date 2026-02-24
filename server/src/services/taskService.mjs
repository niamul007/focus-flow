import pool from "../config/db.mjs";

export const createNewTask = async (userId, title) => {
  // Write the SQL Query:
  // INSERT INTO tasks (user_id, title) VALUES ($1, $2) RETURNING *;
  const sql = `INSERT INTO tasks (user_id , title) VALUES($1,$2) RETURNING *`;

  // Use the 'pool' to execute the query.
  const result = await pool.query(sql,[userId,title])

  // Return the result.rows[0];
  return result.rows[0]
};









import pool from "../db/index.mjs";

export const createNewTask = async (userId, title) => {
  // Write the SQL Query:
  // INSERT INTO tasks (user_id, title) VALUES ($1, $2) RETURNING *;
  const sql = `INSERT INTO tasks (user_id , title) VALUES($1,$2) RETURNING *`;

  // Use the 'pool' to execute the query.
  const result = await pool.query(sql,[userId,title])

  // Return the result.rows[0];
  return result.rows[0]
};


export const getUserTasks = async (userId) => {
    // We want all tasks where the owner is this user
    const sql = `SELECT * FROM tasks WHERE user_id = $1 ORDER BY created_at DESC`;
    const result = await pool.query(sql, [userId]);
    return result.rows; // Note: We return .rows (all tasks), not just .rows[0]
}


export const deleteTask = async (taskId, userId) => {
  const sql = `DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING *`;
  const result = await pool.query(sql, [taskId, userId]);
  return result.rowCount > 0; // Returns true if something was actually deleted
};



export const updateTaskStatus = async (taskId, userId, completed) => {
  const sql = `
    UPDATE tasks 
    SET completed = $3 
    WHERE id = $1 AND user_id = $2 
    RETURNING *`;
  
  const result = await pool.query(sql, [taskId, userId, completed]);
  return result.rows[0];
};



/**
 * Edits the title of an existing task
 */
export const editTaskTitle = async (taskId, userId, newTitle) => {
  const sql = `
    UPDATE tasks 
    SET title = $1 
    WHERE id = $2 AND user_id = $3 
    RETURNING *`;
  
  const result = await pool.query(sql, [newTitle, taskId, userId]);
  return result.rows[0];
};


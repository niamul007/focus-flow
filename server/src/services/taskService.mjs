import pool from "../db/index.mjs";

// 1. Add 'description' to the parameters
export const createNewTask = async (userId, title, description, status) => {
  // 1. Add 'status' to the column list and '$4' to the VALUES
  const sql = `
    INSERT INTO tasks (user_id, title, description, status) 
    VALUES ($1, $2, $3, $4) 
    RETURNING *`;

  // 2. Add 'status' to the parameters array
  const result = await pool.query(sql, [userId, title, description, status || 'pending']);

  return result.rows[0];
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



export const updateTaskStatus = async (taskId, userId, status) => {
  // We use user_id=$2 to make sure a user can only edit their OWN tasks
  const sql = `
    UPDATE tasks 
    SET status = $3 
    WHERE id = $1 AND user_id = $2 
    RETURNING *`;

  const result = await pool.query(sql, [taskId, userId, status]);
  return result.rows[0];
};


/**
 * Edits the title of an existing task
 */

export const editTaskGeneral = async (taskId, userId, updates) => {
  const { title, description, status } = updates;

  const sql = `
    UPDATE tasks 
    SET 
      title = COALESCE($1, title), 
      description = COALESCE($2, description), 
      status = COALESCE($3, status)
    WHERE id = $4 AND user_id = $5 
    RETURNING *`;
  
  const result = await pool.query(sql, [title, description, status, taskId, userId]);
  return result.rows[0];
};
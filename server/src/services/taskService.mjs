/**
 * SERVICES/TASKSERVICE.MJS — DATABASE OPERATIONS FOR TASKS
 * ----------------------------------------------------------
 * This file contains all SQL queries related to task management.
 * Controllers never touch the database directly — they call these functions.
 *
 * Security pattern used throughout:
 * Every write operation (UPDATE, DELETE) includes AND user_id = $n
 * This ensures users can only modify their OWN tasks — enforced at
 * the database level, not just the application level.
 */

import pool from "../db/index.mjs";

/**
 * createNewTask — Insert a new task into the database
 * ----------------------------------------------------
 * @param {number} userId - ID of the logged-in user (from req.user.id)
 * @param {string} title - Task title
 * @param {string} description - Task description
 * @param {string} status - Task status ('pending', 'in_progress', 'completed')
 * @returns {Object} newly created task row
 *
 * status || 'pending' — if no status is provided, default to 'pending'
 * RETURNING * — sends back the full created row including auto-generated id
 */
export const createNewTask = async (userId, title, description, status) => {
  const sql = `
    INSERT INTO tasks (user_id, title, description, status) 
    VALUES ($1, $2, $3, $4) 
    RETURNING *`;

  const result = await pool.query(sql, [userId, title, description, status || 'pending']);

  return result.rows[0];
};

/**
 * getUserTasks — Fetch all tasks for a specific user
 * ---------------------------------------------------
 * @param {number} userId - ID of the logged-in user
 * @returns {Array} array of task objects (empty array if no tasks)
 *
 * WHERE user_id = $1 — only returns tasks belonging to this user
 * ORDER BY created_at DESC — newest tasks appear first
 *
 * Note: returns result.rows (the full array) not result.rows[0]
 * because we want ALL matching tasks, not just the first one
 */
export const getUserTasks = async (userId) => {
  const sql = `
    SELECT * FROM tasks 
    WHERE user_id = $1 
    ORDER BY created_at DESC`;

  const result = await pool.query(sql, [userId]);
  return result.rows;
};

/**
 * deleteTask — Delete a task by ID
 * ---------------------------------
 * @param {number} taskId - ID of the task to delete (from req.params.id)
 * @param {number} userId - ID of the logged-in user (ownership check)
 * @returns {boolean} true if deleted, false if not found or not owned
 *
 * AND user_id = $2 — ownership check at database level
 * If task exists but belongs to different user → no rows deleted → returns false
 * If task doesn't exist → no rows deleted → returns false
 *
 * result.rowCount → number of rows affected by the query
 * rowCount > 0 means something was actually deleted → return true
 * rowCount === 0 means nothing was deleted → return false → controller sends 404
 *
 * RETURNING * is included so we could use the deleted data if needed
 */
export const deleteTask = async (taskId, userId) => {
  const sql = `
    DELETE FROM tasks 
    WHERE id = $1 AND user_id = $2 
    RETURNING *`;

  const result = await pool.query(sql, [taskId, userId]);
  return result.rowCount > 0;
};

/**
 * editTaskGeneral — Partially update a task's fields
 * ----------------------------------------------------
 * @param {number} taskId - ID of the task to update
 * @param {number} userId - ID of the logged-in user (ownership check)
 * @param {Object} updates - { title?, description?, status? } any combination
 * @returns {Object|undefined} updated task row, or undefined if not found/not owned
 *
 * COALESCE($1, title) — PostgreSQL function for partial updates:
 * - If $1 (new value) is provided → use the new value
 * - If $1 is null (field not sent) → keep the existing database value
 *
 * This means you can send just ONE field and the others stay untouched:
 * { status: 'completed' } → only status updates, title and description unchanged
 * { title: 'New title' }  → only title updates, description and status unchanged
 *
 * JavaScript equivalent: newValue || existingValue
 *
 * AND user_id = $5 — ownership check. If task belongs to different user,
 * WHERE clause matches nothing → result.rows[0] is undefined → controller sends 404
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

  const result = await pool.query(
    sql,
    [title, description, status, taskId, userId]
  );

  return result.rows[0];
};
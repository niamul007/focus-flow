/**
 * CONTROLLERS/TASKCONTROLLER.MJS — TASK REQUEST HANDLERS
 * --------------------------------------------------------
 * Controllers are the bridge between HTTP requests and business logic.
 * They never touch the database directly — they delegate to taskService.
 *
 * Every controller follows the same pattern:
 * 1. Extract identity from req.user.id (set by protect middleware)
 * 2. Extract data from req.body or req.params
 * 3. Call the appropriate service function
 * 4. Send back a structured JSON response
 *
 * All routes here are protected — req.user is always available.
 */

import * as taskService from "../services/taskService.mjs";

/**
 * GET /api/tasks
 * ---------------
 * Returns all tasks belonging to the logged-in user.
 *
 * No req.body needed — we only need to know WHO is asking,
 * which comes from req.user.id set by protect middleware.
 *
 * Response includes results count so the frontend knows
 * how many tasks were returned without counting the array.
 */
export const getTasks = async (req, res) => {
  try {
    // req.user.id comes from protect middleware
    // It's the logged-in user's database ID extracted from their JWT token
    const userId = req.user.id;

    const tasks = await taskService.getUserTasks(userId);

    res.status(200).json({
      status: "success",
      results: tasks.length, // convenience count for the frontend
      data: { tasks },
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

/**
 * POST /api/tasks
 * ----------------
 * Creates a new task for the logged-in user.
 *
 * req.body contains: { title, description, status }
 * validated by createTaskSchema before reaching here.
 *
 * userId is NOT taken from req.body — always from req.user.id.
 * This prevents users from creating tasks for other users
 * by sending a different userId in the request body.
 */
export const createTask = async (req, res) => {
  const { title, description, status } = req.body;
  const userId = req.user.id;

  try {
    const newTask = await taskService.createNewTask(userId, title, description, status);

    // HTTP 201 = Created — used when something new is added to the database
    res.status(201).json({
      status: "success",
      data: { task: newTask }
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

/**
 * PUT /api/tasks/:id
 * -------------------
 * Updates a task's title, description, and/or status.
 *
 * :id comes from the URL → req.params.id
 * e.g. PUT /api/tasks/7 → req.params.id = "7"
 *
 * req.body can contain any combination of: { title, description, status }
 * The service handles partial updates — only updates fields that are provided.
 *
 * Ownership check happens in the service — the task must belong
 * to the logged-in user or null is returned.
 */
export const updateTaskContent = async (req, res) => {
  try {
    // req.params.id → from the URL (e.g. /api/tasks/7)
    const { id } = req.params;

    // req.user.id → from protect middleware (logged-in user's identity)
    const userId = req.user.id;

    // Any combination of these can be in the body
    // The service only updates fields that are actually provided
    const { title, description, status } = req.body;

    const task = await taskService.editTaskGeneral(id, userId, { title, description, status });

    /**
     * Service returns null in two cases:
     * 1. Task with this id doesn't exist
     * 2. Task exists but belongs to a different user
     *
     * We return the same 404 message for both — we don't tell
     * the requester which case it was (security best practice)
     */
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.status(200).json({ status: "success", data: { task } });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

/**
 * DELETE /api/tasks/:id
 * ----------------------
 * Deletes a task by ID — only if it belongs to the logged-in user.
 *
 * :id comes from URL → req.params.id
 * userId comes from protect middleware → req.user.id
 *
 * Service returns true on success, null if task not found or not owned.
 * HTTP 200 on success — sends confirmation message.
 * HTTP 404 if task not found or access denied.
 */
export const removeTask = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const success = await taskService.deleteTask(id, userId);

    if (!success) {
      return res.status(404).json({ message: "Task not found or access denied" });
    }

    // HTTP 200 with message OR HTTP 204 (No Content) are both standard for deletion
    // We use 200 here so the frontend gets a confirmation message
    res.status(200).json({
      status: "success",
      message: "Task successfully removed",
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};
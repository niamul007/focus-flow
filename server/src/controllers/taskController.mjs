/**
 * TASK CONTROLLER
 * Handles incoming HTTP requests for task operations.
 * It acts as the "Manager," taking data from the request, 
 * passing it to the service, and sending back the appropriate response.
 */

import * as taskService from "../services/taskService.mjs";

/**
 * @route   GET /api/tasks
 * @desc    Fetch all tasks belonging to the authenticated user
 * @access  Private (requires JWT)
 */
export const getTasks = async (req, res) => {
  try {
    // Identity is extracted from the 'protect' middleware
    const userId = req.user.id;
    
    const tasks = await taskService.getUserTasks(userId);

    res.status(200).json({
      status: "success",
      results: tasks.length,
      data: { tasks },
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

/**
 * @route   POST /api/tasks
 * @desc    Create a new task for the authenticated user
 * @access  Private
 */
export const createTask = async (req, res) => {
  try {
    const { title } = req.body;
    const userId = req.user.id;

    // Validation: Ensure the user actually sent a title
    if (!title) {
      return res.status(400).json({ message: "Task title is required" });
    }

    const task = await taskService.createNewTask(userId, title);

    res.status(201).json({
      status: "success",
      data: { task },
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

/**
 * @route   PATCH /api/tasks/:id
 * @desc    Update the 'completed' status of a specific task
 * @access  Private (Ownership checked)
 */
export const updateTask = async (req, res) => {
  try {
    const { id } = req.params; // The Task ID from URL
    const userId = req.user.id; // The Owner's ID from JWT
    const { completed } = req.body;

    // We pass both IDs to the service to ensure ownership
    const task = await taskService.updateTaskStatus(id, userId, completed);

    // If no task returned, it means it didn't exist OR user doesn't own it
    if (!task) {
      return res.status(404).json({ message: "Task not found or access denied" });
    }

    res.status(200).json({
      status: "success",
      data: { task },
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

/**
 * @route   DELETE /api/tasks/:id
 * @desc    Delete a specific task
 * @access  Private (Ownership checked)
 */
export const removeTask = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const success = await taskService.deleteTask(id, userId);

    if (!success) {
      return res.status(404).json({ message: "Task not found or access denied" });
    }

    // 200 OK or 204 No Content are standard for successful deletion
    res.status(200).json({
      status: "success",
      message: "Task successfully removed",
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

export const updateTaskTitle = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({ message: "New title is required" });
    }

    const task = await taskService.editTaskTitle(id, userId, title);

    if (!task) {
      return res.status(404).json({ message: "Task not found or unauthorized" });
    }

    res.status(200).json({
      status: "success",
      data: { task },
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};
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
// src/controllers/taskController.mjs
export const createTask = async (req, res) => {
  // 1. Destructure 'status' from the request body
  const { title, description, status } = req.body; 
  const userId = req.user.id; 

  try {
    // 2. Pass 'status' as the 4th argument
    const newTask = await taskService.createNewTask(userId, title, description, status);
    
    res.status(201).json({
      status: "success",
      data: { task: newTask }
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
    const { id } = req.params;
    const userId = req.user.id;
    
    // ❌ OLD: const { completed } = req.body;
    // ✅ NEW: Look for 'status'
    const { status } = req.body; 

    // Pass 'status' to the service
    const task = await taskService.updateTaskStatus(id, userId, status);

    if (!task) {
      return res.status(404).json({ message: "Task not found or access denied" });
    }

    res.status(200).json({
      status: "success",
      data: { task },
    });
  } catch (err) {
    // This is where that 500 error was coming from!
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

export const updateTaskContent = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    // Get everything that COULD be in the body
    const { title, description, status } = req.body;

    // Use a service function that handles partial updates
    const task = await taskService.editTaskGeneral(id, userId, { title, description, status });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.status(200).json({ status: "success", data: { task } });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};
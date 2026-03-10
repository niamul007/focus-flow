/**
 * ROUTES/TASKROUTES.MJS — TASK ROUTES
 * -------------------------------------
 * Defines all endpoints related to task management.
 * All routes in this file are PROTECTED — you must be logged in
 * to access any of them.
 *
 * Mounted in app.mjs at /api/tasks, so:
 * GET    /api/tasks        → get all tasks for logged-in user
 * POST   /api/tasks        → create a new task
 * PUT    /api/tasks/:id    → update a task's content
 * DELETE /api/tasks/:id    → delete a task
 *
 * The /api/tasks prefix comes from app.mjs — this router
 * only knows about the paths after that prefix.
 */

import express from 'express';

// taskCtrl contains all the handler functions for task operations
import * as taskCtrl from '../controllers/taskController.mjs';

// protect middleware — verifies JWT token on every request
import { protect } from '../middleware/authMiddleware.mjs';

// validate() — middleware factory that validates req.body against a Zod schema
import { validate } from '../validations/validate.mjs';

// createTaskSchema — Zod schema defining what a valid new task looks like
import { createTaskSchema } from '../validations/taskValidation.mjs';

const router = express.Router();

/**
 * Apply protect middleware to ALL routes in this file.
 * router.use() runs before every route defined below it.
 *
 * This is cleaner than adding protect to each route individually.
 * Every task operation requires authentication — there are no public task routes.
 *
 * After protect runs successfully:
 * - req.user is available in every controller below
 * - req.user.id is used to filter tasks by the logged-in user
 */
router.use(protect);

/**
 * GET /api/tasks
 * ---------------
 * Returns all tasks belonging to the logged-in user.
 * Uses req.user.id (set by protect) to filter tasks.
 * No request body needed — identity comes from the token.
 */
router.get('/', taskCtrl.getTasks);

/**
 * POST /api/tasks
 * ----------------
 * Creates a new task for the logged-in user.
 *
 * Middleware chain:
 * 1. protect (already applied via router.use above)
 * 2. validate(createTaskSchema) → checks req.body has valid title, description, status
 * 3. taskCtrl.createTask → inserts the new task into the database
 */
router.post('/', validate(createTaskSchema), taskCtrl.createTask);

/**
 * PUT /api/tasks/:id
 * -------------------
 * Updates an existing task's content (title, description, status).
 * :id is a URL parameter — e.g. PUT /api/tasks/7 updates task with id 7.
 * Accessible in the controller via req.params.id.
 */
router.put('/:id', taskCtrl.updateTaskContent);

/**
 * DELETE /api/tasks/:id
 * ----------------------
 * Deletes a task by its ID.
 * :id is a URL parameter — e.g. DELETE /api/tasks/7 deletes task with id 7.
 * Controller verifies the task belongs to the logged-in user before deleting.
 */
router.delete('/:id', taskCtrl.removeTask);

export default router;
import express from 'express';
import * as taskCtrl from '../controllers/taskController.mjs';
import { protect } from '../middleware/authMiddleware.mjs';

const router = express.Router();

router.use(protect); // The Bouncer protects all task routes

router.get('/', taskCtrl.getTasks);      // GET all my tasks
router.post('/', taskCtrl.createTask);    // POST a new task
router.patch('/:id', taskCtrl.updateTask); // PATCH (update) a specific task
router.delete('/:id', taskCtrl.removeTask); // DELETE a specific task
router.put('/:id', taskCtrl.updateTaskTitle); //To update the title 

export default router;
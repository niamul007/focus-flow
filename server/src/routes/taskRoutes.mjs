import express from 'express';
import * as taskCtrl from '../controllers/taskController.mjs';
import { protect } from '../middleware/authMiddleware.mjs';
import { validate } from '../validations/validate.mjs';
import { createTaskSchema } from '../validations/taskValidation.mjs';

const router = express.Router();

router.use(protect); 

router.get('/', taskCtrl.getTasks);
router.post('/', validate(createTaskSchema), taskCtrl.createTask);

// ✅ CHANGE THIS: Point it to the handler that handles Title + Description
// Change this in your router file:
router.put('/:id', taskCtrl.updateTaskContent);
router.delete('/:id', taskCtrl.removeTask);

// 💡 You can remove the PUT route now, as PATCH is more standard for updates
// router.put('/:id', taskCtrl.updateTaskTitle); 

export default router;
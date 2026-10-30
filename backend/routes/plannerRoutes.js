import express from 'express';
import {
  getWeeklyPlanner,
  getDailyPlanner,
  updateDailyPlanner,
  addTaskToDay,
  toggleTask,
  deleteTask,
  updateSelfCare,
} from '../controllers/plannerController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All planner routes require authentication
router.use(protect);

// Weekly planner routes
router.get('/', getWeeklyPlanner);
router.get('/week/:date', getWeeklyPlanner);
router.put('/week/:date/self-care', updateSelfCare);

// Daily planner routes
router.route('/day/:date')
  .get(getDailyPlanner)
  .put(updateDailyPlanner);

// Task specific routes
router.post('/day/:date/task', addTaskToDay);
router.patch('/day/:date/task/:taskId/toggle', toggleTask);
router.delete('/day/:date/task/:taskId', deleteTask);

export default router;

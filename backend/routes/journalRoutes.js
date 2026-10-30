import express from 'express';
import {
  getEntries,
  getEntryById,
  createEntry,
  updateEntry,
  deleteEntry,
  getJournalTags,
  getJournalStats,
} from '../controllers/journalController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All journal routes require authentication
router.use(protect);

router.route('/').get(getEntries).post(createEntry);
router.route('/tags').get(getJournalTags);
router.route('/stats').get(getJournalStats);
router
  .route('/:id')
  .get(getEntryById)
  .put(updateEntry)
  .delete(deleteEntry);

export default router;

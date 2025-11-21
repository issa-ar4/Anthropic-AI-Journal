import { Router } from 'express';
import { body } from 'express-validator';
import {
  createEntry,
  getEntries,
  getEntry,
  updateEntry,
  deleteEntry,
  getUnanalyzedEntries,
} from '../controllers/entryController';
import { authMiddleware } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validation.middleware';

const router = Router();

// All entry routes require authentication
router.use(authMiddleware);

// Validation rules
const entryValidation = [
  body('title').optional().trim().isLength({ max: 200 }),
  body('content').notEmpty().trim(),
];

// Routes
router.post('/', entryValidation, validate, createEntry);
router.get('/unanalyzed', getUnanalyzedEntries); // Must be before /:id route
router.get('/', getEntries);
router.get('/:id', getEntry);
router.put('/:id', entryValidation, validate, updateEntry);
router.delete('/:id', deleteEntry);

export default router;

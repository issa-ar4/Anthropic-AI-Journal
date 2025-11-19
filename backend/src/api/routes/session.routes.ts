import { Router } from 'express';
import { authenticateToken as authenticate } from '../../middleware/auth.middleware';
import {
  createSession,
  continueSession,
  getSessions,
  getSession,
  deleteSession,
} from '../controllers/sessionController';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Session routes
router.post('/', createSession);
router.get('/', getSessions);
router.get('/:id', getSession);
router.post('/:id/continue', continueSession);
router.delete('/:id', deleteSession);

export default router;

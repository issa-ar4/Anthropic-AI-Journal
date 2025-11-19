import { Router } from 'express';
import { generateCanvas, saveCanvas, loadCanvas, generateSessionCanvas } from '../controllers/canvasController';
import { authenticateToken } from '../../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Canvas routes
router.post('/generate', generateCanvas);
router.post('/save', saveCanvas);
router.get('/', loadCanvas);
router.get('/session/:sessionId', generateSessionCanvas);

export default router;

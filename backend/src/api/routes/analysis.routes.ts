import { Router } from 'express';
import {
  analyzeEntry,
  analyzeBatch,
  getInsights,
  detectPatterns,
  getPatterns,
} from '../controllers/analysisController';
import { authenticateToken } from '../../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Analysis routes
router.post('/analyze/:entryId', analyzeEntry);
router.post('/analyze/batch', analyzeBatch);

// Insights route
router.get('/insights', getInsights);

// Pattern routes
router.post('/patterns/detect', detectPatterns);
router.get('/patterns', getPatterns);

export default router;

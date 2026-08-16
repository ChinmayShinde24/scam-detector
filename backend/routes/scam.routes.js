import express from 'express';
import {
  detectScam,
  getScamHistory,
  getScamDetection,
  deleteScamDetection,
  getScamStats,
  getScamsByUserId
} from '../controllers/scam.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Detect scam in a message
router.post('/detect', detectScam);

// Get user's scam detection history
router.get('/history', getScamHistory);

// Get scam statistics
router.get('/stats', getScamStats);

// Get scams by specific user ID
router.get('/user/:userId', getScamsByUserId);

// Get specific detection result
router.get('/:id', getScamDetection);

// Delete detection result
router.delete('/:id', deleteScamDetection);

export default router;
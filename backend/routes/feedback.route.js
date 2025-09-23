import express from 'express';
import {
  createFeedback,
  getAllFeedbacks,
  deleteFeedback,
} from '../controllers/feedback.controller.js';
import { adminRoute, protectRoute } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/', protectRoute, createFeedback);
router.get('/', protectRoute, adminRoute, getAllFeedbacks);
router.delete('/:id', protectRoute, adminRoute, deleteFeedback);

export default router;

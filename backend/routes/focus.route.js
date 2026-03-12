import express from 'express';
import {
    getFocusSessions,
    createFocusSession,
    getFocusStats,
    getHeatmapData,
    getSessionsByRange,
    deleteFocusSession,
} from '../controllers/focus.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(protectRoute);

// Get all focus sessions for current user
router.get('/', getFocusSessions);

// Create a new focus session
router.post('/', createFocusSession);

// Get stats
router.get('/stats', getFocusStats);

// Get heatmap data
router.get('/heatmap', getHeatmapData);

// Get sessions by date range
router.get('/range', getSessionsByRange);

// Delete a session
router.delete('/:id', deleteFocusSession);

export default router;

import express from 'express';
import {
  getSystemAnalytics,
  getDepartmentAnalytics,
  getUserAnalytics,
  getComplaintTrends,
  getPerformanceMetrics,
  getLocationAnalytics
} from '../controllers/analytics.js';
import { protect, authorize } from '../middleware/auth.js';
import { validateObjectId } from '../middleware/validation.js';

const router = express.Router();

// Protected routes
router.use(protect);

// System-wide analytics (admin only)
router.get('/system', authorize('admin'), getSystemAnalytics);
router.get('/trends', authorize('admin'), getComplaintTrends);
router.get('/performance', authorize('admin'), getPerformanceMetrics);
router.get('/location', authorize('admin'), getLocationAnalytics);

// Department analytics
router.get('/department/:id', validateObjectId, authorize('admin', 'provider'), getDepartmentAnalytics);

// User analytics
router.get('/user/:id', validateObjectId, authorize('admin'), getUserAnalytics);

export default router;
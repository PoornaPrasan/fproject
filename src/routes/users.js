import express from 'express';
import {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getUserStats,
  getUserComplaints,
  updateUserRole
} from '../controllers/users.js';
import { protect, authorize, authorizeOwnerOrAdmin } from '../middleware/auth.js';
import {
  validateUserRegistration,
  validateUserUpdate,
  validateObjectId,
  validatePagination
} from '../middleware/validation.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Admin only routes
router.get('/', authorize('admin'), validatePagination, getUsers);
router.post('/', authorize('admin'), validateUserRegistration, createUser);

// Individual user routes
router.get('/:id', validateObjectId, authorizeOwnerOrAdmin(), getUser);
router.put('/:id', validateObjectId, validateUserUpdate, authorizeOwnerOrAdmin(), updateUser);
router.delete('/:id', validateObjectId, authorize('admin'), deleteUser);

// User-specific data
router.get('/:id/stats', validateObjectId, authorizeOwnerOrAdmin(), getUserStats);
router.get('/:id/complaints', validateObjectId, authorizeOwnerOrAdmin(), getUserComplaints);

// Admin actions
router.put('/:id/role', validateObjectId, authorize('admin'), updateUserRole);

export default router;
import express from 'express';
import { requireAdmin } from '../middleware/authMiddleware';
import {
  getAllUsers,
  updateUserStatus,
  updateUserRole,
  getSubscriptionOverview,
  overrideSubscription,
  getAuditLogs,
  exportAuditLogs,
  getSystemMetrics
} from '../controllers/adminController';

const router = express.Router();

// All routes require admin role
router.use(requireAdmin);

// User management
router.get('/users', getAllUsers);
router.patch('/users/:userId/status', updateUserStatus); // suspend/reactivate
router.patch('/users/:userId/role', updateUserRole); // change role

// Subscription management
router.get('/subscriptions', getSubscriptionOverview);
router.patch('/subscriptions/:userId', overrideSubscription);

// Audit logs
router.get('/audit-logs', getAuditLogs);
router.get('/audit-logs/export', exportAuditLogs);

// System metrics
router.get('/metrics', getSystemMetrics);

export default router; 
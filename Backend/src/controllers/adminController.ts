import { Request, Response, RequestHandler } from 'express';
import User from '../models/User';
import { IUser } from '../types/interfaces';
import AuditLog from '../models/AuditLog';

// Define AuthenticatedRequest type for req.user
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: 'admin' | 'creator' | 'student';
    subscriptionPlan?: string;
    isEmailVerified: boolean;
  };
}

// Get all users (with filters/search)
export const getAllUsers: RequestHandler = async (req, res) => {
  try {
    // Parse query params
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string) || 20));
    const role = req.query.role as string | undefined;
    const search = req.query.search as string | undefined;

    // Build filter
    const filter: Record<string, any> = {};
    if (role && ['admin', 'creator', 'student'].includes(role)) {
      filter.role = role;
    }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } }
      ];
    }

    // Query users
    const users = await User.find(filter)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });
    const total = await User.countDocuments(filter);

    // Omit sensitive fields using toSafeObject
    const safeUsers = users.map((user) => (user as any).toSafeObject());

    res.status(200).json({
      users: safeUsers,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch users', error });
  }
};

// Suspend/reactivate user account
export const updateUserStatus: RequestHandler = async (req, res) => {
  const typedReq = req as AuthenticatedRequest;
  try {
    const { userId } = typedReq.params;
    const { suspended } = typedReq.body;
    if (typeof suspended !== 'boolean') {
      res.status(400).json({ message: 'Missing or invalid suspended value (boolean required)' });
      return;
    }
    // Prevent admin from suspending themselves
    if (typedReq.user && typedReq.user.id === userId) {
      res.status(403).json({ message: 'You cannot suspend/reactivate your own account.' });
      return;
    }
    const user = await User.findOneAndUpdate(
      { userId },
      { suspended },
      { new: true }
    );
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    // Log the action
    await AuditLog.create({
      userId: typedReq.user?.id,
      action: suspended ? 'suspend_user' : 'reactivate_user',
      targetType: 'User',
      targetId: userId,
      details: { suspended },
    });
    res.status(200).json({ user: (user as any).toSafeObject() });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update user status', error });
  }
};

// Change user role/permissions
export const updateUserRole: RequestHandler = async (req, res) => {
  // TODO: Implement role/permission update logic
  res.status(200).json({ message: 'Not implemented' });
};

// Get subscription overview
export const getSubscriptionOverview: RequestHandler = async (req, res) => {
  // TODO: Implement subscription overview
  res.status(200).json({ message: 'Not implemented' });
};

// Manual subscription override
export const overrideSubscription: RequestHandler = async (req, res) => {
  // TODO: Implement manual subscription override
  res.status(200).json({ message: 'Not implemented' });
};

// Get audit logs
export const getAuditLogs: RequestHandler = async (req, res) => {
  // TODO: Implement audit log retrieval
  res.status(200).json({ message: 'Not implemented' });
};

// Export audit logs
export const exportAuditLogs: RequestHandler = async (req, res) => {
  // TODO: Implement audit log export (CSV, PDF, etc.)
  res.status(200).json({ message: 'Not implemented' });
};

// Get system metrics
export const getSystemMetrics: RequestHandler = async (req, res) => {
  // TODO: Implement system metrics (active users, traffic, assessment count)
  res.status(200).json({ message: 'Not implemented' });
}; 
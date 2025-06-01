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
  const typedReq = req as AuthenticatedRequest;
  try {
    const { userId } = typedReq.params;
    const { role } = typedReq.body;
    
    if (!role || !['admin', 'creator', 'student'].includes(role)) {
      res.status(400).json({ message: 'Invalid or missing role value. Must be one of: admin, creator, student' });
      return;
    }
    
    // Prevent admin from changing their own role
    if (typedReq.user && typedReq.user.id === userId) {
      res.status(403).json({ message: 'You cannot change your own role.' });
      return;
    }
    
    const user = await User.findOneAndUpdate(
      { userId },
      { role },
      { new: true }
    );
    
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    
    // Log the action
    await AuditLog.create({
      userId: typedReq.user?.id,
      action: 'update_user_role',
      targetType: 'User',
      targetId: userId,
      details: { newRole: role },
    });
    
    res.status(200).json({ user: (user as any).toSafeObject() });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update user role', error });
  }
};

// Get subscription overview
export const getSubscriptionOverview: RequestHandler = async (req, res) => {
  try {
    // Count users by subscription plan
    const subscriptionStats = await User.aggregate([
      { $match: { role: 'creator' } },
      { $group: {
          _id: '$subscriptionPlan',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    // Format the response
    const overview = subscriptionStats.map(stat => ({
      plan: stat._id || 'None',
      userCount: stat.count
    }));
    
    res.status(200).json({ subscriptions: overview });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch subscription overview', error });
  }
};

// Manual subscription override
export const overrideSubscription: RequestHandler = async (req, res) => {
  const typedReq = req as AuthenticatedRequest;
  try {
    const { userId } = typedReq.params;
    const { subscriptionPlan, overrideReason } = typedReq.body;
    
    if (!subscriptionPlan) {
      res.status(400).json({ message: 'Missing subscription plan value' });
      return;
    }
    
    if (!overrideReason || typeof overrideReason !== 'string') {
      res.status(400).json({ message: 'Missing or invalid override reason (string required)' });
      return;
    }
    
    const user = await User.findOneAndUpdate(
      { userId },
      { subscriptionPlan },
      { new: true }
    );
    
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    
    // Log the action
    await AuditLog.create({
      userId: typedReq.user?.id,
      action: 'override_subscription',
      targetType: 'User',
      targetId: userId,
      details: { newPlan: subscriptionPlan, reason: overrideReason },
    });
    
    res.status(200).json({ user: (user as any).toSafeObject() });
  } catch (error) {
    res.status(500).json({ message: 'Failed to override subscription', error });
  }
};

// Get audit logs
export const getAuditLogs: RequestHandler = async (req, res) => {
  try {
    // Parse query params
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string) || 20));
    const action = req.query.action as string | undefined;
    const targetType = req.query.targetType as string | undefined;
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

    // Build filter
    const filter: Record<string, any> = {};
    if (action) {
      filter.action = action;
    }
    if (targetType) {
      filter.targetType = targetType;
    }
    if (startDate && !isNaN(startDate.getTime())) {
      filter.createdAt = { ...filter.createdAt, $gte: startDate };
    }
    if (endDate && !isNaN(endDate.getTime())) {
      filter.createdAt = { ...filter.createdAt, $lte: endDate };
    }

    // Query audit logs
    const logs = await AuditLog.find(filter)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });
    const total = await AuditLog.countDocuments(filter);

    res.status(200).json({
      logs,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch audit logs', error });
  }
};

// Export audit logs
export const exportAuditLogs: RequestHandler = async (req, res) => {
  try {
    // Parse query params
    const format = (req.query.format as string || 'csv').toLowerCase();
    const action = req.query.action as string | undefined;
    const targetType = req.query.targetType as string | undefined;
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

    if (!['csv', 'pdf'].includes(format)) {
      res.status(400).json({ message: 'Invalid format. Use csv or pdf.' });
      return;
    }

    // Build filter
    const filter: Record<string, any> = {};
    if (action) {
      filter.action = action;
    }
    if (targetType) {
      filter.targetType = targetType;
    }
    if (startDate && !isNaN(startDate.getTime())) {
      filter.createdAt = { ...filter.createdAt, $gte: startDate };
    }
    if (endDate && !isNaN(endDate.getTime())) {
      filter.createdAt = { ...filter.createdAt, $lte: endDate };
    }

    // Query audit logs (limit to 1000 for export to prevent overload)
    const logs = await AuditLog.find(filter)
      .limit(1000)
      .sort({ createdAt: -1 });

    // TODO: Implement actual CSV/PDF generation logic
    // This is a placeholder for the actual implementation
    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=audit_logs.csv');
      // Placeholder for CSV content
      res.status(200).send('CSV content placeholder\n' + JSON.stringify(logs).slice(0, 100) + '...');
    } else {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=audit_logs.pdf');
      // Placeholder for PDF content
      res.status(200).send('PDF content placeholder');
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to export audit logs', error });
  }
};

// Get system metrics
export const getSystemMetrics: RequestHandler = async (req, res) => {
  try {
    // Get active user count (users who logged in within the last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const activeUsers = await User.countDocuments({ lastLogin: { $gte: thirtyDaysAgo } });
    
    // Get total user count by role
    const userStats = await User.aggregate([
      { $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // TODO: Implement actual metrics for traffic and assessment count
    // These are placeholders
    const traffic = {
      requestsLast24Hours: 0,
      peakHour: 'N/A'
    };
    
    const assessments = {
      total: 0,
      active: 0
    };
    
    // Format user stats
    const userBreakdown = userStats.reduce((acc, stat) => {
      acc[stat._id] = stat.count;
      return acc;
    }, { admin: 0, creator: 0, student: 0 });
    
    res.status(200).json({
      activeUsers,
      userBreakdown,
      traffic,
      assessments
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch system metrics', error });
  }
}; 
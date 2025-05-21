import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

interface DecodedToken {
  userId: string;
  email: string;
  role: 'admin' | 'creator' | 'student';
  iat: number;
  exp: number;
}

/**
 * Middleware to verify JWT token and attach user to request
 */
export const authenticateToken = async (
  req: Request & { user?: any },
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({ message: 'Access denied. No token provided.' });
      return;
    }

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your_strong_jwt_secret_here'
    ) as DecodedToken;

    // Find user
    const user = await User.findById(decoded.userId);
    if (!user) {
      res.status(401).json({ message: 'Invalid token. User not found.' });
      return;
    }

    // Attach user to request
    req.user = {
      id: user._id,
      email: user.email,
      role: user.role,
      subscriptionPlan: user.subscriptionPlan,
      isEmailVerified: user.isEmailVerified,
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ message: 'Invalid token.' });
  }
};

/**
 * Middleware to check if user's email is verified
 * Must be used after authenticateToken middleware
 */
export const requireEmailVerified = (
  req: Request & { user?: any },
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({ message: 'Authentication required.' });
    return;
  }

  if (!req.user.isEmailVerified) {
    res.status(403).json({
      message: 'Email verification required.',
      needsVerification: true,
    });
    return;
  }

  next();
};

/**
 * Middleware to check if user has admin role
 * Must be used after authenticateToken middleware
 */
export const requireAdmin = (
  req: Request & { user?: any },
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({ message: 'Authentication required.' });
    return;
  }

  if (req.user.role !== 'admin') {
    res.status(403).json({ message: 'Admin access required.' });
    return;
  }

  next();
};

/**
 * Middleware to check if user has creator role
 * Must be used after authenticateToken middleware
 */
export const requireCreator = (
  req: Request & { user?: any },
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({ message: 'Authentication required.' });
    return;
  }

  if (req.user.role !== 'creator') {
    res.status(403).json({ message: 'Creator access required.' });
    return;
  }

  next();
};

/**
 * Middleware to check if user has creator or admin role
 * Must be used after authenticateToken middleware
 */
export const requireCreatorOrAdmin = (
  req: Request & { user?: any },
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({ message: 'Authentication required.' });
    return;
  }

  if (req.user.role !== 'creator' && req.user.role !== 'admin') {
    res.status(403).json({ message: 'Creator or Admin access required.' });
    return;
  }

  next();
};

/**
 * Middleware to check if user has student role
 * Must be used after authenticateToken middleware
 */
export const requireStudent = (
  req: Request & { user?: any },
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({ message: 'Authentication required.' });
    return;
  }

  if (req.user.role !== 'student') {
    res.status(403).json({ message: 'Student access required.' });
    return;
  }

  next();
};

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

// Interface for request with authenticated user
interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
    role: 'admin' | 'creator' | 'student';
    subscriptionPlan?: string;
    isEmailVerified: boolean;
  };
}

// Export AuthenticatedRequest for use in other files
export { AuthenticatedRequest };

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
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      console.log('No token provided in authorization header');
      res.status(401).json({ message: 'Access denied. No token provided.' });
      return;
    }

    try {
      // Verify token
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'your_strong_jwt_secret_here'
      ) as DecodedToken;

      console.log('Token decoded successfully:', {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role
      });

      // Find user
      const user = await User.findById(decoded.userId);
      if (!user) {
        console.log('User not found for token with userId:', decoded.userId);
        res.status(401).json({ message: 'Invalid token. User not found.' });
        return;
      }

      // Ensure user has the expected properties by asserting its type
      interface UserDocument {
        _id: { toString(): string };
        email: string;
        role: 'admin' | 'creator' | 'student';
        subscriptionPlan?: string | null;
        isEmailVerified: boolean;
      }

      // Attach user to request
      (req as AuthenticatedRequest).user = {
        id: (user as UserDocument)._id.toString(),
        email: (user as UserDocument).email,
        role: (user as UserDocument).role,
        subscriptionPlan: (user as UserDocument).subscriptionPlan || undefined,
        isEmailVerified: (user as UserDocument).isEmailVerified,
      };

      console.log('User attached to request:', (req as AuthenticatedRequest).user);

      next();
    } catch (jwtError) {
      console.error('JWT verification error:', jwtError);
      res.status(401).json({ message: 'Invalid token. JWT verification failed.' });
      return;
    }
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
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!(req as AuthenticatedRequest).user) {
    res.status(401).json({ message: 'Authentication required.' });
    return;
  }

  if (!(req as AuthenticatedRequest).user.isEmailVerified) {
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
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!(req as AuthenticatedRequest).user) {
    res.status(401).json({ message: 'Authentication required.' });
    return;
  }

  if ((req as AuthenticatedRequest).user.role !== 'admin') {
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
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!(req as AuthenticatedRequest).user) {
    res.status(401).json({ message: 'Authentication required.' });
    return;
  }

  if ((req as AuthenticatedRequest).user.role !== 'creator') {
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
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!(req as AuthenticatedRequest).user) {
    res.status(401).json({ message: 'Authentication required.' });
    return;
  }

  if ((req as AuthenticatedRequest).user.role !== 'creator' && (req as AuthenticatedRequest).user.role !== 'admin') {
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
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!(req as AuthenticatedRequest).user) {
    res.status(401).json({ message: 'Authentication required.' });
    return;
  }

  if ((req as AuthenticatedRequest).user.role !== 'student') {
    res.status(403).json({ message: 'Student access required.' });
    return;
  }

  next();
};

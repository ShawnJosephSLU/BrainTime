import { Request, Response, NextFunction } from 'express';

type UserRole = 'admin' | 'creator' | 'student';

/**
 * Middleware to check if user has one of the specified roles
 * Must be used after authenticateToken middleware
 * @param roles - Array of allowed roles
 */
export const roleMiddleware = (roles: UserRole[]) => {
  return (req: Request & { user?: any }, res: Response, next: NextFunction): void => {
    // Debug log all requests
    console.log(`Role Middleware - Path: ${req.path}, Method: ${req.method}`);
    console.log('Auth Headers:', req.headers.authorization ? 'Present' : 'Missing');
    
    // Detailed validation of the request
    if (!req.headers.authorization) {
      console.error('No authorization header found');
    }
    
    // User should be added by authenticateToken middleware
    if (!req.user) {
      console.error('roleMiddleware: No user found in request. Make sure authenticateToken middleware is used before roleMiddleware.');
      res.status(401).json({ message: 'Authentication required.' });
      return;
    }
    
    // Check if user object has necessary properties
    if (!req.user.id || !req.user.role) {
      console.error('roleMiddleware: Malformed user object in request:', req.user);
      res.status(401).json({ message: 'Invalid user data in authentication.' });
      return;
    }
    
    console.log(`User authenticated: ${req.user.email} (${req.user.id}) with role: ${req.user.role}`);
    console.log(`Expected roles: ${roles.join(', ')}`);
    
    // Check if user role is allowed
    if (!roles.includes(req.user.role)) {
      console.log(`User role ${req.user.role} is not in allowed roles: ${roles.join(', ')}`);
      res.status(403).json({ 
        message: `Insufficient permissions. Required roles: ${roles.join(', ')}` 
      });
      return;
    }
    
    console.log(`Role check passed for ${req.user.email} - allowed roles: ${roles.join(', ')}`);
    next();
  };
}; 
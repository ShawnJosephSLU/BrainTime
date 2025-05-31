import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User'; // Assuming User model might be needed
import { IUser } from '../types/interfaces';

const ACCESS_TOKEN_SECRET = process.env.JWT_SECRET || 'your_strong_jwt_secret_here';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'your_strong_refresh_secret_here'; // Ensure this is in your .env

interface DecodedToken {
  userId: string;
  email: string;
  role: string;
  // Add other properties if they exist in your token payload
}

/**
 * Middleware to generate a new access token using a refresh token.
 * Refresh token is expected in an HTTPOnly cookie.
 */
export const refreshToken = async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.refreshToken; // Ensure cookie-parser is used

  if (!refreshToken) {
    return res.status(401).json({ message: 'Refresh token not found. Please login again.' });
  }

  try {
    const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET) as DecodedToken;
    
    // Optionally, check if the user still exists or if the refresh token is revoked
    const user = await User.findById(decoded.userId) as IUser | null;
    if (!user) {
      return res.status(403).json({ message: 'Invalid refresh token. User not found.' });
    }

    // TODO: Implement a refresh token versioning or blacklist to handle token revocation more robustly
    // For example, if a user logs out, their refresh tokens should be invalidated.

    const newAccessToken = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      ACCESS_TOKEN_SECRET,
      { expiresIn: '15m' } // Short-lived access token
    );

    res.status(200).json({
      accessToken: newAccessToken,
      message: 'Access token refreshed successfully.'
    });

  } catch (error) {
    console.error('Refresh token error:', error);
    // If refresh token is expired or invalid
    res.clearCookie('refreshToken', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' });
    return res.status(403).json({ message: 'Invalid or expired refresh token. Please login again.' });
  }
};

/**
 * Placeholder for user activity tracking middleware.
 * This would typically update a 'lastActivity' timestamp for the user.
 */
export const trackUserActivity = (req: Request, res: Response, next: NextFunction) => {
  // TODO: Implement user activity tracking logic
  // This could involve updating a lastActiveAt field in the User model
  // or in a separate session store.
  // For idle timeout, the client can monitor inactivity and prompt the user,
  // or the server can invalidate sessions based on lastActivity.
  console.log('User activity tracking to be implemented.');
  next();
};

// Note: Idle timeout and forced logout for JWTs often rely on a combination of:
// 1. Short-lived access tokens.
// 2. Refresh tokens for renewing access tokens.
// 3. Client-side logic to detect inactivity and request new tokens or logout.
// 4. Server-side refresh token validation (and potential revocation list for forced logout).

// Express-compatible handler for refreshToken
export function refreshTokenHandler(req: Request, res: Response, next: NextFunction) {
  refreshToken(req, res).catch(next);
} 
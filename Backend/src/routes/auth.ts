import express from 'express';
import {
  register,
  verifyEmail,
  login,
  logout,
  forgotPassword,
  resetPassword,
  updateProfile,
  updatePassword,
  resendVerification
} from '../controllers/authController';
import { refreshTokenHandler } from '../middleware/sessionMiddleware';
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();

/**
 * @route POST /api/auth/register
 * @desc Register a new user and send verification email
 * @access Public
 */
router.post('/register', register);

/**
 * @route GET /api/auth/verify-email
 * @desc Verify user email with token
 * @access Public
 */
router.get('/verify-email', verifyEmail);

/**
 * @route POST /api/auth/login
 * @desc Login user
 * @access Public
 */
router.post('/login', login);

/**
 * @route POST /api/auth/logout
 * @desc Logout user
 * @access Public
 */
router.post('/logout', logout);

/**
 * @route POST /api/auth/forgot-password
 * @desc Send a reset password email
 * @access Public
 */
router.post('/forgot-password', forgotPassword);

/**
 * @route POST /api/auth/reset-password
 * @desc Reset user password
 * @access Public
 */
router.post('/reset-password', resetPassword);

/**
 * @route POST /api/auth/resend-verification
 * @desc Resend verification email
 * @access Public
 */
router.post('/resend-verification', resendVerification);

/**
 * @route POST /api/auth/refresh-token
 * @desc Refresh access token
 * @access Public
 */
router.post('/refresh-token', refreshTokenHandler);

/**
 * @route PUT /api/auth/profile
 * @desc Update user profile
 * @access Protected
 */
router.put('/profile', authenticateToken, updateProfile);

/**
 * @route PUT /api/auth/password
 * @desc Update user password
 * @access Protected
 */
router.put('/password', authenticateToken, updatePassword);

export default router;

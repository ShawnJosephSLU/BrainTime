import express from 'express';
import * as authController from '../controllers/authController';

const router = express.Router();

/**
 * @route POST /api/auth/register
 * @desc Register a new user and send verification email
 * @access Public
 */
router.post('/register', authController.register);

/**
 * @route GET /api/auth/verify-email
 * @desc Verify user email with token
 * @access Public
 */
router.get('/verify-email', authController.verifyEmail);

/**
 * @route POST /api/auth/login
 * @desc Login user
 * @access Public
 */
router.post('/login', authController.login);

/**
 * @route POST /api/auth/resend-verification
 * @desc Resend verification email
 * @access Public
 */
router.post('/resend-verification', authController.resendVerification);

export default router;

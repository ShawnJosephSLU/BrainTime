import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { generateVerificationToken, calculateTokenExpiry } from '../utils/tokenUtils';
import { sendVerificationEmail, sendEtherealVerificationEmail, sendPasswordResetEmail } from '../services/email/emailService';

/**
 * Register a new user
 * @route POST /api/auth/register
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, role } = req.body;

    // Validate input
    if (!email || !password || !role) {
      res.status(400).json({ message: 'Email, password, and role are required' });
      return;
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: 'User with this email already exists' });
      return;
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Generate verification token
    const verificationToken = generateVerificationToken();
    const verificationTokenExpiry = calculateTokenExpiry();

    // Create new user
    const newUser = new User({
      email,
      passwordHash,
      role,
      isEmailVerified: false,
      verificationToken,
      verificationTokenExpiry,
    });

    await newUser.save();

    // Send verification email
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const emailSent = await sendVerificationEmail(email, verificationToken, frontendUrl);

    let etherealPreviewUrl = null;
    
    // If primary email fails, try Ethereal as fallback
    if (!emailSent) {
      console.log('Primary email service failed, trying Ethereal as fallback...');
      const etherealResult = await sendEtherealVerificationEmail(email, verificationToken, frontendUrl);
      
      if (etherealResult.success) {
        etherealPreviewUrl = etherealResult.previewUrl;
        console.log('Ethereal email sent successfully. Preview URL:', etherealPreviewUrl);
      } else {
        console.error('Both primary and Ethereal email services failed');
      }
    }

    res.status(201).json({
      message: 'User registered successfully. Please check your email to verify your account.',
      userId: newUser._id,
      emailVerificationSent: emailSent || !!etherealPreviewUrl,
      // Include Ethereal preview URL in development environment
      ...(process.env.NODE_ENV !== 'production' && etherealPreviewUrl && { 
        etherealPreviewUrl,
        etherealNote: 'For development: Open this URL to view the verification email'
      })
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

/**
 * Verify user email with token
 * @route GET /api/auth/verify-email
 */
export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.query;

    if (!token) {
      res.status(400).json({ message: 'Verification token is required' });
      return;
    }

    // Find user with this token
    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpiry: { $gt: new Date() }, // Token must not be expired
    });

    if (!user) {
      res.status(400).json({ message: 'Invalid or expired verification token' });
      return;
    }

    // Update user as verified
    user.isEmailVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiry = undefined;
    await user.save();

    res.status(200).json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ message: 'Server error during email verification' });
  }
};

/**
 * Login user
 * @route POST /api/auth/login
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required' });
      return;
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      res.status(401).json({ 
        message: 'Email not verified. Please check your email for verification link.',
        needsVerification: true
      });
      return;
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your_strong_jwt_secret_here',
      { expiresIn: '24h' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        subscriptionPlan: user.subscriptionPlan,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

/**
 * Resend verification email
 * @route POST /api/auth/resend-verification
 */
export const resendVerification = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ message: 'Email is required' });
      return;
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      // For security reasons, don't reveal that the user doesn't exist
      res.status(200).json({ message: 'If your email exists in our system, a verification link has been sent' });
      return;
    }

    // Check if already verified
    if (user.isEmailVerified) {
      res.status(400).json({ message: 'Email is already verified' });
      return;
    }

    // Generate new verification token
    const verificationToken = generateVerificationToken();
    const verificationTokenExpiry = calculateTokenExpiry();

    // Update user with new token
    user.verificationToken = verificationToken;
    user.verificationTokenExpiry = verificationTokenExpiry;
    await user.save();

    // Send verification email
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const emailSent = await sendVerificationEmail(email, verificationToken, frontendUrl);

    let etherealPreviewUrl = null;
    
    // If primary email fails, try Ethereal as fallback
    if (!emailSent) {
      console.log('Primary email service failed, trying Ethereal as fallback...');
      const etherealResult = await sendEtherealVerificationEmail(email, verificationToken, frontendUrl);
      
      if (etherealResult.success) {
        etherealPreviewUrl = etherealResult.previewUrl;
        console.log('Ethereal email sent successfully. Preview URL:', etherealPreviewUrl);
      } else {
        console.error('Both primary and Ethereal email services failed');
        res.status(500).json({ message: 'Failed to send verification email' });
        return;
      }
    }

    res.status(200).json({
      message: 'Verification email sent successfully',
      // Include Ethereal preview URL in development environment
      ...(process.env.NODE_ENV !== 'production' && etherealPreviewUrl && { 
        etherealPreviewUrl,
        etherealNote: 'For development: Open this URL to view the verification email'
      })
    });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ message: 'Server error during resend verification' });
  }
};

/**
 * Request password reset
 * @route POST /api/auth/forgot-password
 */
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ message: 'Email is required' });
      return;
    }
    const user = await User.findOne({ email });
    if (!user) {
      // For security, always respond with success
      res.status(200).json({ message: 'If your email exists in our system, a reset link has been sent.' });
      return;
    }
    // Generate reset token and expiry (1 hour)
    const resetToken = generateVerificationToken();
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000);
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = resetExpires;
    await user.save();
    // Send reset email
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    await sendPasswordResetEmail(email, resetToken, frontendUrl);
    res.status(200).json({ message: 'If your email exists in our system, a reset link has been sent.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error during password reset request' });
  }
};

/**
 * Reset password
 * @route POST /api/auth/reset-password
 */
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      res.status(400).json({ message: 'Token and new password are required' });
      return;
    }
    // Validate password strength
    const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/;
    if (!passwordRegex.test(newPassword)) {
      res.status(400).json({ message: 'Password must be at least 8 characters with at least one number and one special character' });
      return;
    }
    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: new Date() },
    });
    if (!user) {
      res.status(400).json({ message: 'Invalid or expired reset token' });
      return;
    }
    user.passwordHash = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    res.status(200).json({ message: 'Password reset successful. You can now log in.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error during password reset' });
  }
};

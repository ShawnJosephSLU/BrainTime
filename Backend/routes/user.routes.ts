import { Router } from 'express';
import {
  signupStudent,
  signupCreator,
  signupAdmin,
  uploadProfilePic
} from '../controllers/user.controllers';

const router = Router();


// Role-specific signup routes
// @route   POST /api/users/signup/student
// @desc    Register a new student
// @access  Public
router.post('/signup/student', signupStudent);

// @route   POST /api/users/signup/creator
// @desc    Register a new creator
// @access  Public
router.post('/signup/creator', signupCreator);

// @route   POST /api/users/signup/admin
// @desc    Register a new admin
// @access  Public (IMPORTANT: Should be protected in a real application)
router.post('/signup/admin', signupAdmin);


// Profile picture upload
// @route   POST /api/users/profile-pic
// @desc    Upload user profile picture
// @access  Private (should be protected, e.g., with JWT auth middleware)
router.post('/profile-pic', uploadProfilePic);

export default router;

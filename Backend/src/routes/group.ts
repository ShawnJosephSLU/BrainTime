import express, { Request, Response, NextFunction, RequestHandler } from 'express';
import { authenticateToken, AuthenticatedRequest } from '../middleware/authMiddleware';
import { roleMiddleware } from '../middleware/roleMiddleware';
import {
  createGroup,
  getCreatorGroups,
  getGroupById,
  updateGroup,
  deleteGroup,
  enrollInGroup,
  getStudentGroups,
  assignExamToGroup,
  removeExamFromGroup,
  getPublicGroups,
  joinPublicGroup,
  testAuth,
} from '../controllers/groupController';

const router = express.Router();

// Helper function to convert AuthenticatedRequest handler to Express RequestHandler
const wrapAuthHandler = (
  handler: (req: AuthenticatedRequest, res: Response) => Promise<void>
): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    return handler(req as AuthenticatedRequest, res);
  };
};

// Debug/test routes
router.get('/test-auth', authenticateToken, wrapAuthHandler(testAuth));

// Creator routes - require creator or admin role
router.post('/create', authenticateToken, roleMiddleware(['creator', 'admin']), wrapAuthHandler(createGroup));
router.get('/creator', authenticateToken, roleMiddleware(['creator', 'admin']), wrapAuthHandler(getCreatorGroups));

// Student routes - put these BEFORE the :groupId route to avoid path collision
router.post('/enroll', authenticateToken, wrapAuthHandler(enrollInGroup));
router.get('/student', authenticateToken, wrapAuthHandler(getStudentGroups));
router.get('/public', authenticateToken, wrapAuthHandler(getPublicGroups));
router.post('/:groupId/join', authenticateToken, wrapAuthHandler(joinPublicGroup));

// Single group routes - these must come AFTER specific paths to avoid conflicts
router.get('/:groupId', authenticateToken, wrapAuthHandler(getGroupById));
router.put('/:groupId', authenticateToken, roleMiddleware(['creator', 'admin']), wrapAuthHandler(updateGroup));
router.delete('/:groupId', authenticateToken, roleMiddleware(['creator', 'admin']), wrapAuthHandler(deleteGroup));

// Exam assignment routes
router.post('/:groupId/assign-exam/:examId', authenticateToken, roleMiddleware(['creator', 'admin']), wrapAuthHandler(assignExamToGroup));
router.delete('/:groupId/remove-exam/:examId', authenticateToken, roleMiddleware(['creator', 'admin']), wrapAuthHandler(removeExamFromGroup));

export default router; 
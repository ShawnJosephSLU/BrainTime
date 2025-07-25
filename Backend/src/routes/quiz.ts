import express, { Request, Response, NextFunction, RequestHandler } from 'express';
import multer from 'multer';
import { authenticateToken, AuthenticatedRequest } from '../middleware/authMiddleware';
import { roleMiddleware } from '../middleware/roleMiddleware';
import {
  createQuiz,
  uploadQuestionMedia,
  getCreatorQuizzes,
  getQuizDetails,
  updateQuiz,
  deleteQuiz,
  toggleQuizLiveStatus,
  checkQuizAvailability,
  authenticateForQuiz,
  saveAnswer,
  submitExam,
  getQuizSubmissions,
  getSubmissionDetails,
  gradeSubmission,
  getPublicQuizzes,
  getStudentResults,
  getMyResults
} from '../controllers/quizController';

const router = express.Router();

// Helper function to convert AuthenticatedRequest handler to Express RequestHandler
const wrapAuthHandler = (
  handler: (req: AuthenticatedRequest, res: Response) => Promise<void>
): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    return handler(req as AuthenticatedRequest, res);
  };
};

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  } 
});

// Public routes - accessible to all authenticated users (must come before parameterized routes)
router.get('/public', authenticateToken, wrapAuthHandler(getPublicQuizzes));
router.get('/my-results', authenticateToken, wrapAuthHandler(getMyResults));

// Creator routes - require creator or admin role
router.post('/create', authenticateToken, roleMiddleware(['creator', 'admin']), wrapAuthHandler(createQuiz));
router.post(
  '/upload-media',
  authenticateToken,
  roleMiddleware(['creator', 'admin']),
  upload.single('file'),
  wrapAuthHandler(uploadQuestionMedia)
);
router.get('/creator', authenticateToken, roleMiddleware(['creator', 'admin']), wrapAuthHandler(getCreatorQuizzes));

// Submission and grading routes
router.get(
  '/submissions/:submissionId',
  authenticateToken,
  roleMiddleware(['creator', 'admin']),
  wrapAuthHandler(getSubmissionDetails)
);

router.post(
  '/submissions/:submissionId/grade',
  authenticateToken,
  roleMiddleware(['creator', 'admin']),
  wrapAuthHandler(gradeSubmission)
);

// Parameterized routes (must come after specific routes)
router.get('/:quizId/availability', wrapAuthHandler(checkQuizAvailability));
router.get('/:quizId/results', authenticateToken, wrapAuthHandler(getStudentResults));
router.get('/:quizId', authenticateToken, roleMiddleware(['creator', 'admin']), wrapAuthHandler(getQuizDetails));
router.put('/:quizId', authenticateToken, roleMiddleware(['creator', 'admin']), wrapAuthHandler(updateQuiz));
router.delete('/:quizId', authenticateToken, roleMiddleware(['creator', 'admin']), wrapAuthHandler(deleteQuiz));
router.patch(
  '/:quizId/toggle-live',
  authenticateToken,
  roleMiddleware(['creator', 'admin']),
  wrapAuthHandler(toggleQuizLiveStatus)
);

router.get(
  '/:quizId/submissions',
  authenticateToken,
  roleMiddleware(['creator', 'admin']),
  wrapAuthHandler(getQuizSubmissions)
);

// Student routes - require student role
router.post(
  '/:quizId/authenticate',
  authenticateToken,
  roleMiddleware(['student']),
  wrapAuthHandler(authenticateForQuiz)
);

router.post(
  '/session/:sessionId/save-answer',
  authenticateToken,
  roleMiddleware(['student']),
  wrapAuthHandler(saveAnswer)
);

router.post(
  '/session/:sessionId/submit',
  authenticateToken,
  roleMiddleware(['student']),
  wrapAuthHandler(submitExam)
);

export default router; 
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import bcrypt from 'bcryptjs';
import Quiz from '../models/Quiz';
import ExamSession from '../models/ExamSession';
import ResponseModel from '../models/Response';
import { IQuestion } from '../types/interfaces';
import { uploadToS3 } from '../utils/s3Utils';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import Group from '../models/Group';

// Create a new quiz
export const createQuiz = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Authentication required' });
      return;
    }

    const { 
      title, 
      description, 
      questions, 
      startTime, 
      endTime, 
      duration, 
      allowInternet,
      password,
      groups,
      autoSubmit,
      shuffleQuestions,
      showResults,
      isPublic
    } = req.body;

    // Basic validation
    if (!title || !description || !questions || !startTime || !endTime || !duration || !password) {
      res.status(StatusCodes.BAD_REQUEST).json({ message: 'Missing required fields' });
      return;
    }

    // Validate questions
    if (!Array.isArray(questions) || questions.length === 0) {
      res.status(StatusCodes.BAD_REQUEST).json({ message: 'At least one question is required' });
      return;
    }

    // Simple password hashing for quiz access
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const quiz = new Quiz({
      adminId: req.user.id, // Assuming the user ID is in the request from auth middleware
      title,
      description,
      questions,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      duration,
      allowInternet: allowInternet || false,
      password: hashedPassword,
      isLive: false, // Default to not live
      isPublic: isPublic || false, // Default to private for security
      groups: groups || [],
      autoSubmit: autoSubmit !== undefined ? autoSubmit : true,
      shuffleQuestions: shuffleQuestions || false,
      showResults: showResults || false,
    });

    await quiz.save();
    res.status(StatusCodes.CREATED).json({ message: 'Quiz created successfully', quizId: quiz._id });
  } catch (error) {
    console.error('Error creating quiz:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Failed to create quiz' });
  }
};

// Upload media for questions
export const uploadQuestionMedia = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Authentication required' });
      return;
    }

    if (!req.file) {
      res.status(StatusCodes.BAD_REQUEST).json({ message: 'No file uploaded' });
      return;
    }

    const { questionId, mediaType } = req.body;
    
    if (!questionId || !mediaType) {
      res.status(StatusCodes.BAD_REQUEST).json({ message: 'Missing required fields' });
      return;
    }

    // Validate media type
    if (!['image', 'audio', 'video', 'gif'].includes(mediaType)) {
      res.status(StatusCodes.BAD_REQUEST).json({ message: 'Invalid media type' });
      return;
    }

    // Upload to S3
    const s3Key = `quiz-media/${req.user.id}/${questionId}/${Date.now()}-${req.file.originalname}`;
    const s3Url = await uploadToS3(req.file.buffer, s3Key, req.file.mimetype);

    res.status(StatusCodes.OK).json({ url: s3Url });
  } catch (error) {
    console.error('Error uploading media:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Failed to upload media' });
  }
};

// Get all quizzes for a creator
export const getCreatorQuizzes = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Authentication required' });
      return;
    }

    const quizzes = await Quiz.find({ adminId: req.user.id })
      .select('title description startTime endTime duration isLive');
    
    res.status(StatusCodes.OK).json(quizzes);
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Failed to fetch quizzes' });
  }
};

// Get details of a specific quiz
export const getQuizDetails = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Authentication required' });
      return;
    }

    const { quizId } = req.params;
    
    const quiz = await Quiz.findOne({ _id: quizId, adminId: req.user.id });
    
    if (!quiz) {
      res.status(StatusCodes.NOT_FOUND).json({ message: 'Quiz not found' });
      return;
    }
    
    res.status(StatusCodes.OK).json(quiz);
  } catch (error) {
    console.error('Error fetching quiz details:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Failed to fetch quiz details' });
  }
};

// Update a quiz
export const updateQuiz = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Authentication required' });
      return;
    }

    const { quizId } = req.params;
    const updateData = req.body;
    
    // Make sure we're not updating the admin ID
    delete updateData.adminId;
    
    // If there's a password update, hash it
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }
    
    // Handle date conversions if needed
    if (updateData.startTime) {
      updateData.startTime = new Date(updateData.startTime);
    }
    
    if (updateData.endTime) {
      updateData.endTime = new Date(updateData.endTime);
    }
    
    const quiz = await Quiz.findOneAndUpdate(
      { _id: quizId, adminId: req.user.id },
      updateData,
      { new: true }
    );
    
    if (!quiz) {
      res.status(StatusCodes.NOT_FOUND).json({ message: 'Quiz not found' });
      return;
    }
    
    res.status(StatusCodes.OK).json({ message: 'Quiz updated successfully', quiz });
  } catch (error) {
    console.error('Error updating quiz:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Failed to update quiz' });
  }
};

// Delete a quiz
export const deleteQuiz = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Authentication required' });
      return;
    }

    const { quizId } = req.params;
    
    const result = await Quiz.deleteOne({ _id: quizId, adminId: req.user.id });
    
    if (result.deletedCount === 0) {
      res.status(StatusCodes.NOT_FOUND).json({ message: 'Quiz not found' });
      return;
    }
    
    res.status(StatusCodes.OK).json({ message: 'Quiz deleted successfully' });
  } catch (error) {
    console.error('Error deleting quiz:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Failed to delete quiz' });
  }
};

// Toggle quiz live status
export const toggleQuizLiveStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Authentication required' });
      return;
    }

    const { quizId } = req.params;
    const { isLive } = req.body;
    
    if (isLive === undefined) {
      res.status(StatusCodes.BAD_REQUEST).json({ message: 'isLive status is required' });
      return;
    }
    
    const quiz = await Quiz.findOne({ _id: quizId, adminId: req.user.id });
    
    if (!quiz) {
      res.status(StatusCodes.NOT_FOUND).json({ message: 'Quiz not found' });
      return;
    }
    
    // Check if we're trying to make the quiz live and if it's in the future
    if (isLive && new Date() > quiz.endTime) {
      res.status(StatusCodes.BAD_REQUEST).json({ message: 'Cannot make a quiz live after its end date' });
      return;
    }
    
    quiz.isLive = isLive;
    await quiz.save();
    
    res.status(StatusCodes.OK).json({ message: `Quiz is now ${isLive ? 'live' : 'offline'}`, quiz });
  } catch (error) {
    console.error('Error toggling quiz status:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Failed to update quiz status' });
  }
};

// STUDENT EXAM ACCESS AND FUNCTIONALITY

// Check if a quiz is available for a student
export const checkQuizAvailability = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { quizId } = req.params;
    
    const quiz = await Quiz.findById(quizId)
      .select('title description startTime endTime duration isLive password');
    
    if (!quiz) {
      res.status(StatusCodes.NOT_FOUND).json({ message: 'Quiz not found' });
      return;
    }
    
    const now = new Date();
    const isAvailable = quiz.isLive && 
                        now >= quiz.startTime && 
                        now <= quiz.endTime;
    
    // Don't send the password hash
    const { password, ...quizWithoutPassword } = quiz.toObject();
    
    res.status(StatusCodes.OK).json({ 
      ...quizWithoutPassword,
      isAvailable,
      requiresPassword: true
    });
  } catch (error) {
    console.error('Error checking quiz availability:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Failed to check quiz availability' });
  }
};

// Authenticate for a quiz with password
export const authenticateForQuiz = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Authentication required' });
      return;
    }

    console.log('User trying to authenticate for quiz:', req.user.id, req.user.role);

    const { quizId } = req.params;
    const { password } = req.body;
    
    if (!password) {
      res.status(StatusCodes.BAD_REQUEST).json({ message: 'Password is required' });
      return;
    }
    
    const quiz = await Quiz.findById(quizId);
    
    if (!quiz) {
      res.status(StatusCodes.NOT_FOUND).json({ message: 'Quiz not found' });
      return;
    }
    
    // Verify student is in a group that has access to this quiz
    const hasAccess = await Group.exists({
      students: req.user.id,
      exams: quizId
    });
    
    if (!hasAccess) {
      console.log(`User ${req.user.id} doesn't have access to quiz ${quizId}`);
      res.status(StatusCodes.FORBIDDEN).json({ message: 'You do not have access to this exam' });
      return;
    }
    
    const now = new Date();
    if (!quiz.isLive || now < quiz.startTime || now > quiz.endTime) {
      res.status(StatusCodes.FORBIDDEN).json({ message: 'Quiz is not available at this time' });
      return;
    }
    
    // Check password
    const passwordMatch = await bcrypt.compare(password, quiz.password);
    
    if (!passwordMatch) {
      res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Incorrect password' });
      return;
    }
    
    // Check if student already has an active session
    let examSession = await ExamSession.findOne({
      quizId,
      studentId: req.user.id,
      isCompleted: false
    });
    
    if (!examSession) {
      // Create a new exam session
      examSession = new ExamSession({
        quizId,
        studentId: req.user.id,
        startTime: new Date(),
        endTime: new Date(Date.now() + quiz.duration * 60000), // Convert minutes to milliseconds
        isCompleted: false,
        currentAnswers: []
      });
      
      await examSession.save();
    }
    
    // Return sanitized quiz data (no answers)
    const sanitizedQuestions = quiz.questions.map((q: any) => {
      const { correctAnswer, ...questionWithoutAnswer } = typeof q.toObject === 'function' ? q.toObject() : q;
      return questionWithoutAnswer;
    });
    
    console.log(`Sending ${sanitizedQuestions.length} questions to client`);
    console.log('First question sample:', sanitizedQuestions.length > 0 ? JSON.stringify(sanitizedQuestions[0]) : 'No questions');
    
    res.status(StatusCodes.OK).json({
      message: 'Successfully authenticated',
      sessionId: examSession._id,
      endTime: examSession.endTime,
      quiz: {
        ...quiz.toObject(),
        questions: sanitizedQuestions,
        password: undefined
      }
    });
  } catch (error) {
    console.error('Error authenticating for quiz:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Failed to authenticate for quiz' });
  }
};

// Save a student's answer during an exam
export const saveAnswer = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Authentication required' });
      return;
    }

    const { sessionId } = req.params;
    const { questionId, answer } = req.body;
    
    if (!questionId || answer === undefined) {
      res.status(StatusCodes.BAD_REQUEST).json({ message: 'Question ID and answer are required' });
      return;
    }
    
    const session = await ExamSession.findOne({
      _id: sessionId,
      studentId: req.user.id,
      isCompleted: false
    });
    
    if (!session) {
      res.status(StatusCodes.NOT_FOUND).json({ message: 'Active exam session not found' });
      return;
    }
    
    // Check if session is expired
    if (session.endTime && new Date() > session.endTime) {
      session.isCompleted = true;
      await session.save();
      res.status(StatusCodes.FORBIDDEN).json({ message: 'Exam session has expired' });
      return;
    }
    
    // Update the last activity time
    session.lastActivity = new Date();
    
    // Check if this question is already answered
    const existingAnswerIndex = session.currentAnswers.findIndex(
      a => a.questionId.toString() === questionId
    );
    
    if (existingAnswerIndex >= 0) {
      // Update the existing answer
      session.currentAnswers[existingAnswerIndex].answer = answer;
    } else {
      // Add a new answer
      session.currentAnswers.push({ questionId, answer });
    }
    
    await session.save();
    
    res.status(StatusCodes.OK).json({ message: 'Answer saved successfully' });
  } catch (error) {
    console.error('Error saving answer:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Failed to save answer' });
  }
};

// Submit the entire exam
export const submitExam = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Authentication required' });
      return;
    }

    const { sessionId } = req.params;
    
    const session = await ExamSession.findOne({
      _id: sessionId,
      studentId: req.user.id,
      isCompleted: false
    });
    
    if (!session) {
      res.status(StatusCodes.NOT_FOUND).json({ message: 'Active exam session not found' });
      return;
    }
    
    // Mark the session as completed
    session.isCompleted = true;
    session.endTime = new Date();
    await session.save();
    
    // Convert the session answers to a formal submission
    const answers = session.currentAnswers.map(({ questionId, answer }) => ({
      questionId,
      studentAnswer: answer
    }));
    
    // Check if a response already exists for this student and quiz
    let response = await ResponseModel.findOne({
      quizId: session.quizId,
      studentId: req.user.id
    });
    
    if (response) {
      // Update existing response
      response.answers = answers;
      response.submittedAt = new Date();
      await response.save();
    } else {
      // Create a new response record with the student's answers
      response = new ResponseModel({
        quizId: session.quizId,
        studentId: req.user.id,
        answers,
        submittedAt: new Date()
      });
      
      await response.save();
    }
    
    res.status(StatusCodes.OK).json({ message: 'Exam submitted successfully', responseId: response._id });
  } catch (error) {
    console.error('Error submitting exam:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Failed to submit exam' });
  }
};

// Get all student submissions for a specific quiz
export const getQuizSubmissions = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // Check if user is authenticated as creator
    if (!req.user) {
      res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Authentication required' });
      return;
    }

    const { quizId } = req.params;
    
    // Verify user is the quiz creator
    const quiz = await Quiz.findOne({ _id: quizId, adminId: req.user.id });
    
    if (!quiz) {
      res.status(StatusCodes.NOT_FOUND).json({ message: 'Quiz not found or you are not authorized' });
      return;
    }
    
    // Get all submissions for this quiz with student info
    const submissions = await ResponseModel.find({ quizId })
      .populate('studentId', 'email firstName lastName')
      .select('studentId submittedAt isGraded totalScore')
      .sort({ submittedAt: -1 });
    
    res.status(StatusCodes.OK).json(submissions);
  } catch (error) {
    console.error('Error fetching quiz submissions:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Failed to fetch quiz submissions' });
  }
};

// Get a specific student submission details
export const getSubmissionDetails = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Authentication required' });
      return;
    }

    const { submissionId } = req.params;
    
    const submission = await ResponseModel.findById(submissionId)
      .populate('studentId', 'email firstName lastName')
      .populate('quizId');
    
    if (!submission) {
      res.status(StatusCodes.NOT_FOUND).json({ message: 'Submission not found' });
      return;
    }
    
    // Verify user is the quiz creator
    const quiz = await Quiz.findOne({ 
      _id: submission.quizId, 
      adminId: req.user.id 
    });
    
    if (!quiz) {
      res.status(StatusCodes.FORBIDDEN).json({ message: 'You are not authorized to view this submission' });
      return;
    }
    
    res.status(StatusCodes.OK).json(submission);
  } catch (error) {
    console.error('Error fetching submission details:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Failed to fetch submission details' });
  }
};

// Grade a student submission
export const gradeSubmission = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Authentication required' });
      return;
    }

    const { submissionId } = req.params;
    const { gradedAnswers, feedback, totalScore } = req.body;
    
    if (!Array.isArray(gradedAnswers)) {
      res.status(StatusCodes.BAD_REQUEST).json({ message: 'Graded answers must be an array' });
      return;
    }
    
    const submission = await ResponseModel.findById(submissionId);
    
    if (!submission) {
      res.status(StatusCodes.NOT_FOUND).json({ message: 'Submission not found' });
      return;
    }
    
    // Verify user is the quiz creator
    const quiz = await Quiz.findOne({ 
      _id: submission.quizId, 
      adminId: req.user.id 
    });
    
    if (!quiz) {
      res.status(StatusCodes.FORBIDDEN).json({ message: 'You are not authorized to grade this submission' });
      return;
    }
    
    // Update each answer with its score and feedback
    submission.answers = submission.answers.map(existingAnswer => {
      const gradedAnswer = gradedAnswers.find(
        g => g.questionId.toString() === existingAnswer.questionId.toString()
      );
      
      if (gradedAnswer) {
        return {
          ...existingAnswer,
          score: gradedAnswer.score,
          feedback: gradedAnswer.feedback
        };
      }
      
      return existingAnswer;
    });
    
    // Update submission status
    submission.isGraded = true;
    submission.gradedAt = new Date();
    submission.feedback = feedback || '';
    submission.totalScore = totalScore;
    
    await submission.save();
    
    res.status(StatusCodes.OK).json({ 
      message: 'Submission graded successfully',
      submission
    });
  } catch (error) {
    console.error('Error grading submission:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Failed to grade submission' });
  }
}; 
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../config/api';
import { useAuth } from '../../contexts/AuthContext';
import MarkdownPreview from '../creator/exams/MarkdownPreview';

interface IQuestion {
  _id: string;
  type: 'MCQ' | 'multipleSelect' | 'shortAnswer' | 'longAnswer' | 'trueFalse' | 'fillInTheBlank' | 'matching' | 'ordering';
  text: string;
  audioUrl?: string;
  imageUrl?: string;
  gifUrl?: string;
  videoUrl?: string;
  options?: string[];
  points: number;
  timeLimit?: number | null;
  explanation?: string;
}

interface IQuiz {
  _id: string;
  title: string;
  description: string;
  questions: IQuestion[];
  duration: number;
  allowInternet: boolean;
  autoSubmit: boolean;
  shuffleQuestions: boolean;
}

interface IAnswer {
  questionId: string;
  answer: string | string[];
}

const EnhancedExamSession: React.FC = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const { } = useAuth();
  
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [password, setPassword] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);
  
  // Quiz state
  const [quiz, setQuiz] = useState<IQuiz | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  
  // Question navigation state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<IAnswer[]>([]);
  const [isAutosaving, setIsAutosaving] = useState<boolean>(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  // Timer state
  const [remainingTime, setRemainingTime] = useState<number>(0);
  const [questionStartTime, setQuestionStartTime] = useState<Date>(new Date());
  const [questionTimeSpent, setQuestionTimeSpent] = useState<{ [key: string]: number }>({});
  const [isTimeWarning, setIsTimeWarning] = useState<boolean>(false);
  const [isTimeCritical, setIsTimeCritical] = useState<boolean>(false);
  
  // Submission state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);
  
  // Progress tracking
  const [progressData, setProgressData] = useState<{
    totalQuestions: number;
    answeredQuestions: number;
    timeSpentPerQuestion: { [key: string]: number };
    completionPercentage: number;
  }>({
    totalQuestions: 0,
    answeredQuestions: 0,
    timeSpentPerQuestion: {},
    completionPercentage: 0
  });

  // Refs for cleanup
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const autosaveRef = useRef<NodeJS.Timeout | null>(null);

  // Initial loading check
  useEffect(() => {
    if (!quizId) {
      setError('Quiz ID not found');
      setLoading(false);
      return;
    }
    
    // Check quiz availability
    const checkAvailability = async () => {
      try {
        await axios.get(`${API_URL}/api/quizzes/${quizId}/availability`);
        setLoading(false);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Quiz not available');
        setLoading(false);
      }
    };
    
    checkAvailability();
  }, [quizId]);

  // Autosave functionality
  const autosave = useCallback(async () => {
    if (!sessionId || !quiz || answers.length === 0) return;

    try {
      setIsAutosaving(true);
      
      const currentQuestion = quiz.questions[currentQuestionIndex];
      const currentAnswer = answers.find(a => a.questionId === currentQuestion._id);
      
      if (currentAnswer && currentAnswer.answer) {
        await axios.post(`${API_URL}/api/quizzes/session/${sessionId}/save-answer`, {
          questionId: currentQuestion._id,
          answer: currentAnswer.answer,
          timeSpent: questionTimeSpent[currentQuestion._id] || 0
        });
        
        setLastSaved(new Date());
      }
    } catch (error) {
      console.error('Autosave failed:', error);
    } finally {
      setIsAutosaving(false);
    }
  }, [sessionId, quiz, currentQuestionIndex, answers, questionTimeSpent]);

  // Set up autosave interval
  useEffect(() => {
    if (isAuthenticated && sessionId) {
      autosaveRef.current = setInterval(autosave, 10000); // Autosave every 10 seconds
      return () => {
        if (autosaveRef.current) {
          clearInterval(autosaveRef.current);
        }
      };
    }
  }, [isAuthenticated, sessionId, autosave]);

  // Timer functionality
  useEffect(() => {
    if (!endTime || !isAuthenticated) return;

    const updateTimer = () => {
      const now = new Date();
      const secondsRemaining = Math.max(0, Math.floor((endTime.getTime() - now.getTime()) / 1000));
      
      setRemainingTime(secondsRemaining);
      
      // Set warning states
      if (secondsRemaining <= 300 && secondsRemaining > 60) { // 5 minutes warning
        setIsTimeWarning(true);
        setIsTimeCritical(false);
      } else if (secondsRemaining <= 60 && secondsRemaining > 0) { // 1 minute critical
        setIsTimeWarning(true);
        setIsTimeCritical(true);
      } else {
        setIsTimeWarning(false);
        setIsTimeCritical(false);
      }
      
      // Auto-submit when time is up
      if (secondsRemaining <= 0 && quiz?.autoSubmit && !submitted) {
        handleAutoSubmit();
      }
    };

    updateTimer();
    timerRef.current = setInterval(updateTimer, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [endTime, isAuthenticated, quiz?.autoSubmit, submitted]);

  // Track time spent on current question
  useEffect(() => {
    if (!quiz || !isAuthenticated) return;

    const currentQuestion = quiz.questions[currentQuestionIndex];
    if (!currentQuestion) return;

    setQuestionStartTime(new Date());

    return () => {
      const timeSpent = Math.floor((new Date().getTime() - questionStartTime.getTime()) / 1000);
      setQuestionTimeSpent(prev => ({
        ...prev,
        [currentQuestion._id]: (prev[currentQuestion._id] || 0) + timeSpent
      }));
    };
  }, [currentQuestionIndex, quiz, isAuthenticated]);

  // Update progress data
  useEffect(() => {
    if (!quiz) return;

    const answeredCount = answers.filter(a => a.answer && a.answer !== '').length;
    const completionPercentage = (answeredCount / quiz.questions.length) * 100;

    setProgressData({
      totalQuestions: quiz.questions.length,
      answeredQuestions: answeredCount,
      timeSpentPerQuestion: questionTimeSpent,
      completionPercentage
    });
  }, [answers, quiz, questionTimeSpent]);

  // Format time display
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // Authentication
  const handleAuthenticate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password.trim()) {
      setPasswordError('Password is required');
      return;
    }
    
    setIsAuthenticating(true);
    setPasswordError(null);
    
    try {
      const response = await axios.post(`${API_URL}/api/quizzes/${quizId}/authenticate`, {
        password
      });
      
      const { sessionId, quiz: quizData, endTime: examEndTime } = response.data;
      
      setSessionId(sessionId);
      setQuiz(quizData);
      setEndTime(new Date(examEndTime));
      setIsAuthenticated(true);
      
      // Initialize answers
      const initialAnswers = quizData.questions.map((q: IQuestion) => ({
        questionId: q._id,
        answer: ''
      }));
      setAnswers(initialAnswers);
      
    } catch (err: any) {
      setPasswordError(err.response?.data?.message || 'Failed to authenticate');
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Answer handling
  const handleAnswerChange = (value: string | string[]) => {
    if (!quiz) return;
    
    const currentQuestion = quiz.questions[currentQuestionIndex];
    const updatedAnswers = [...answers];
    const answerIndex = updatedAnswers.findIndex(a => a.questionId === currentQuestion._id);
    
    if (answerIndex >= 0) {
      updatedAnswers[answerIndex].answer = value;
    } else {
      updatedAnswers.push({ questionId: currentQuestion._id, answer: value });
    }
    
    setAnswers(updatedAnswers);
  };

  // Navigation
  const goToQuestion = (index: number) => {
    if (!quiz || index < 0 || index >= quiz.questions.length) return;
    setCurrentQuestionIndex(index);
  };

  const handleNext = () => {
    if (!quiz || currentQuestionIndex >= quiz.questions.length - 1) return;
    setCurrentQuestionIndex(currentQuestionIndex + 1);
  };

  const handlePrevious = () => {
    if (currentQuestionIndex <= 0) return;
    setCurrentQuestionIndex(currentQuestionIndex - 1);
  };

  // Submission
  const handleAutoSubmit = async () => {
    if (!sessionId) return;
    
    try {
      await axios.post(`${API_URL}/api/quizzes/session/${sessionId}/submit`);
      setSubmitted(true);
    } catch (error) {
      console.error('Auto-submit failed:', error);
    }
  };

  const handleManualSubmit = async () => {
    if (!sessionId) return;
    
    setIsSubmitting(true);
    try {
      await axios.post(`${API_URL}/api/quizzes/session/${sessionId}/submit`);
      setSubmitted(true);
      setShowSubmitDialog(false);
    } catch (error) {
      console.error('Manual submit failed:', error);
      setError('Failed to submit exam. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render question
  const renderQuestion = () => {
    if (!quiz || !quiz.questions[currentQuestionIndex]) return null;
    
    const question = quiz.questions[currentQuestionIndex];
    const currentAnswer = answers.find(a => a.questionId === question._id);
    
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Question {currentQuestionIndex + 1} of {quiz.questions.length}
            </h3>
            <div className="text-sm text-gray-600">
              Points: {question.points}
              {question.timeLimit && (
                <span className="ml-4">Time Limit: {formatTime(question.timeLimit)}</span>
              )}
            </div>
          </div>
          <div className="text-sm text-gray-500">
            {currentQuestionIndex + 1} / {quiz.questions.length}
          </div>
        </div>

        {/* Question Text */}
        <div className="mb-6">
          <MarkdownPreview content={question.text} className="text-gray-900" />
        </div>

        {/* Media Display */}
        {(question.imageUrl || question.audioUrl || question.videoUrl || question.gifUrl) && (
          <div className="mb-6 space-y-3">
            {question.imageUrl && (
              <img 
                src={question.imageUrl} 
                alt="Question media"
                className="max-w-full h-auto rounded-md"
              />
            )}
            {question.audioUrl && (
              <audio controls className="w-full">
                <source src={question.audioUrl} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
            )}
            {question.videoUrl && (
              <video controls className="w-full max-h-96 rounded-md">
                <source src={question.videoUrl} type="video/mp4" />
                Your browser does not support the video element.
              </video>
            )}
            {question.gifUrl && (
              <img 
                src={question.gifUrl} 
                alt="Question GIF"
                className="max-w-full h-auto rounded-md"
              />
            )}
          </div>
        )}

        {/* Answer Options */}
        <div className="space-y-3">
          {question.type === 'MCQ' && question.options && (
            <div className="space-y-2">
              {question.options.map((option, optIndex) => (
                <label 
                  key={optIndex}
                  className="flex items-center space-x-3 p-3 border border-gray-200 rounded-md cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <input
                    type="radio"
                    name={`question-${currentQuestionIndex}`}
                    value={option}
                    checked={currentAnswer?.answer === option}
                    onChange={(e) => handleAnswerChange(e.target.value)}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-gray-900">{option}</span>
                </label>
              ))}
            </div>
          )}

          {question.type === 'multipleSelect' && question.options && (
            <div className="space-y-2">
              {question.options.map((option, optIndex) => (
                <label 
                  key={optIndex}
                  className="flex items-center space-x-3 p-3 border border-gray-200 rounded-md cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <input
                    type="checkbox"
                    value={option}
                    checked={Array.isArray(currentAnswer?.answer) && currentAnswer.answer.includes(option)}
                    onChange={(e) => {
                      const currentAnswers = Array.isArray(currentAnswer?.answer) ? currentAnswer.answer : [];
                      if (e.target.checked) {
                        handleAnswerChange([...currentAnswers, option]);
                      } else {
                        handleAnswerChange(currentAnswers.filter(a => a !== option));
                      }
                    }}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-gray-900">{option}</span>
                </label>
              ))}
            </div>
          )}

          {question.type === 'trueFalse' && (
            <div className="space-y-2">
              {['True', 'False'].map((option) => (
                <label 
                  key={option}
                  className="flex items-center space-x-3 p-3 border border-gray-200 rounded-md cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <input
                    type="radio"
                    name={`question-${currentQuestionIndex}`}
                    value={option}
                    checked={currentAnswer?.answer === option}
                    onChange={(e) => handleAnswerChange(e.target.value)}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-gray-900">{option}</span>
                </label>
              ))}
            </div>
          )}

          {question.type === 'shortAnswer' && (
            <input
              type="text"
              placeholder="Enter your answer..."
              value={currentAnswer?.answer as string || ''}
              onChange={(e) => handleAnswerChange(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          )}

          {question.type === 'longAnswer' && (
            <textarea
              placeholder="Enter your detailed answer..."
              rows={5}
              value={currentAnswer?.answer as string || ''}
              onChange={(e) => handleAnswerChange(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          <div className="text-sm text-gray-500">
            Question {currentQuestionIndex + 1} of {quiz.questions.length}
          </div>
          
          {currentQuestionIndex < quiz.questions.length - 1 ? (
            <button
              onClick={handleNext}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Next
            </button>
          ) : (
            <button
              onClick={() => setShowSubmitDialog(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Review & Submit
            </button>
          )}
        </div>
      </div>
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading exam...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
          <div className="text-red-600 text-center mb-4">
            <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h3 className="text-lg font-semibold">Error</h3>
          </div>
          <p className="text-gray-600 text-center mb-4">{error}</p>
          <button
            onClick={() => navigate('/student/dashboard')}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Submitted state
  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full text-center">
          <div className="text-green-600 mb-4">
            <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-xl font-bold">Exam Submitted Successfully!</h3>
          </div>
          <p className="text-gray-600 mb-4">
            Your answers have been recorded. Thank you for completing the exam.
          </p>
          <button
            onClick={() => navigate('/student/dashboard')}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Authentication form
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Enter Exam Password</h2>
          <p className="text-gray-600 mb-4">
            This exam is password protected. Please enter the password provided by your instructor.
          </p>
          
          <form onSubmit={handleAuthenticate}>
            <div className="mb-4">
              <input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  passwordError ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {passwordError && (
                <p className="text-red-600 text-sm mt-1">{passwordError}</p>
              )}
            </div>
            
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => navigate('/student/dashboard')}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isAuthenticating}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {isAuthenticating ? 'Verifying...' : 'Begin Exam'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Main exam interface
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header with timer and progress */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold text-gray-900">{quiz?.title}</h1>
              <p className="text-sm text-gray-600">{quiz?.description}</p>
            </div>
            
            {/* Timer */}
            <div className={`flex items-center space-x-4 px-4 py-2 rounded-lg ${
              isTimeCritical 
                ? 'bg-red-100 border border-red-300 text-red-800' 
                : isTimeWarning 
                ? 'bg-yellow-100 border border-yellow-300 text-yellow-800'
                : 'bg-blue-100 border border-blue-300 text-blue-800'
            }`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-mono text-lg font-bold">
                {formatTime(remainingTime)}
              </span>
            </div>
            
            <button
              onClick={() => setShowSubmitDialog(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Submit Exam
            </button>
          </div>
          
          {/* Progress bar */}
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Progress: {progressData.answeredQuestions} of {progressData.totalQuestions} questions</span>
              <span>{Math.round(progressData.completionPercentage)}% complete</span>
              {isAutosaving && (
                <span className="text-blue-600">
                  <svg className="w-4 h-4 inline animate-spin mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Saving...
                </span>
              )}
              {lastSaved && !isAutosaving && (
                <span className="text-green-600">
                  Saved {lastSaved.toLocaleTimeString()}
                </span>
              )}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressData.completionPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Question Navigator Sidebar */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-lg p-4 sticky top-6">
              <h3 className="font-semibold text-gray-900 mb-4">Question Navigator</h3>
              <div className="grid grid-cols-5 gap-2">
                {quiz?.questions.map((_, index) => {
                  const isAnswered = answers.some(a => a.questionId === quiz.questions[index]._id && a.answer !== '');
                  const isCurrent = currentQuestionIndex === index;
                  
                  return (
                    <button
                      key={index}
                      onClick={() => goToQuestion(index)}
                      className={`w-10 h-10 rounded-md text-sm font-medium transition-colors ${
                        isCurrent
                          ? 'bg-blue-600 text-white'
                          : isAnswered
                          ? 'bg-green-100 text-green-800 border border-green-300'
                          : 'bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200'
                      }`}
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div>
              
              <div className="mt-4 text-xs text-gray-600">
                <div className="flex items-center mb-1">
                  <div className="w-3 h-3 bg-blue-600 rounded mr-2"></div>
                  Current
                </div>
                <div className="flex items-center mb-1">
                  <div className="w-3 h-3 bg-green-100 border border-green-300 rounded mr-2"></div>
                  Answered
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-gray-100 border border-gray-300 rounded mr-2"></div>
                  Not answered
                </div>
              </div>
            </div>
          </div>

          {/* Main Question Area */}
          <div className="flex-1">
            {renderQuestion()}
          </div>
        </div>
      </div>

      {/* Submit Dialog */}
      {showSubmitDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Submit Exam</h3>
              <p className="text-gray-600 mb-4">
                Are you sure you want to submit your exam? Once submitted, you cannot make any changes.
              </p>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h4 className="font-medium text-gray-900 mb-2">Exam Summary:</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>Total Questions: {progressData.totalQuestions}</div>
                  <div>Answered Questions: {progressData.answeredQuestions}</div>
                  <div>Unanswered Questions: {progressData.totalQuestions - progressData.answeredQuestions}</div>
                </div>
              </div>
              
              {progressData.answeredQuestions < progressData.totalQuestions && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                  <p className="text-yellow-800 text-sm">
                    You have {progressData.totalQuestions - progressData.answeredQuestions} unanswered questions. 
                    Are you sure you want to submit?
                  </p>
                </div>
              )}
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowSubmitDialog(false)}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Continue Exam
                </button>
                <button
                  onClick={handleManualSubmit}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Exam'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedExamSession; 
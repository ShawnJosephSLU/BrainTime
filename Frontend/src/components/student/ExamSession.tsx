import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../config/api';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  TextField, 
  CircularProgress, 
  Alert, 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  RadioGroup,
  Radio,
  FormControlLabel,
  Divider,
  LinearProgress,
  Container,
  AppBar,
  Toolbar,
  Chip,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TimerIcon from '@mui/icons-material/Timer';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import { differenceInSeconds, intervalToDuration, formatDuration } from 'date-fns';

interface IQuestion {
  _id: string;
  type: 'MCQ' | 'shortAnswer' | 'longAnswer' | 'trueFalse';
  text: string;
  audioUrl?: string;
  imageUrl?: string;
  gifUrl?: string;
  videoUrl?: string;
  options?: string[];
  points: number;
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

const ExamSession: React.FC = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const { setAuthHeaders, refreshAuth } = useAuth();
  
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
  const [savedStatus, setSavedStatus] = useState<Record<string, boolean>>({});
  const [isSaving, setIsSaving] = useState<boolean>(false);
  
  // Timer state
  const [remainingTime, setRemainingTime] = useState<number>(0);
  const [isTimeWarning, setIsTimeWarning] = useState<boolean>(false);
  
  // Submission state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);

  // Set auth headers on component mount
  useEffect(() => {
    refreshAuth();
    setAuthHeaders();
  }, []);

  // Check if the quiz is available
  useEffect(() => {
    if (!quizId) return;
    
    const checkQuizAvailability = async () => {
      try {
        setLoading(true);
        
        // Ensure auth headers are set
        if (!setAuthHeaders()) {
          if (!refreshAuth()) {
            setError('Authentication failed. Please log in again.');
            setTimeout(() => navigate('/signin'), 2000);
            return;
          }
        }
        
        const response = await axios.get(`${API_URL}/api/quizzes/${quizId}/availability`);
        
        if (!response.data.isAvailable) {
          setError('This exam is not available at this time.');
          setLoading(false);
          return;
        }
        
        setLoading(false);
      } catch (err: any) {
        console.error('Error checking quiz availability:', err);
        setError(err.response?.data?.message || 'Failed to check quiz availability');
        setLoading(false);
        
        // If unauthorized, redirect to login
        if (err.response?.status === 401) {
          setTimeout(() => navigate('/signin'), 2000);
        }
      }
    };
    
    checkQuizAvailability();
  }, [quizId, navigate]);

  // Authenticate with password
  const handleAuthenticate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!password.trim()) {
      setPasswordError('Password is required');
      return;
    }
    
    setIsAuthenticating(true);
    setPasswordError(null);
    
    try {
      // Ensure auth headers are set
      if (!setAuthHeaders()) {
        if (!refreshAuth()) {
          setPasswordError('Authentication failed. Please log in again.');
          setTimeout(() => navigate('/signin'), 2000);
          return;
        }
      }
      
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      console.log('Using token:', token ? 'Token exists' : 'No token');
      
      console.log('Authenticating for quiz:', quizId);
      const response = await axios.post(
        `${API_URL}/api/quizzes/${quizId}/authenticate`, 
        { password },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('Authentication response:', response.data);
      const { sessionId, quiz: quizData, endTime: examEndTime } = response.data;
      
      console.log('Quiz data structure:', JSON.stringify(quizData, null, 2));
      
      if (!quizData || !quizData.questions || quizData.questions.length === 0) {
        console.error('Quiz data is missing or has no questions');
        setPasswordError('Error loading exam questions. Please try again or contact support.');
        setIsAuthenticating(false);
        return;
      }
      
      // Check if the questions array is valid
      if (!Array.isArray(quizData.questions)) {
        console.error('Quiz questions is not an array', quizData.questions);
        setPasswordError('Error loading exam questions. Please try again or contact support.');
        setIsAuthenticating(false);
        return;
      }
      
      console.log('Setting quiz data with', quizData.questions.length, 'questions');
      
      setSessionId(sessionId);
      setQuiz(quizData);
      setEndTime(new Date(examEndTime));
      setIsAuthenticated(true);
      
      // Initialize answers array with empty answers for each question
      const initialAnswers = quizData.questions.map((q: IQuestion) => ({
        questionId: q._id,
        answer: q.type === 'MCQ' ? '' : '',
      }));
      
      setAnswers(initialAnswers);
      
    } catch (err: any) {
      console.error('Error authenticating:', err);
      console.error('Error response:', err.response?.data);
      setPasswordError(err.response?.data?.message || 'Failed to authenticate');
      
      // If unauthorized, redirect to login
      if (err.response?.status === 401) {
        setPasswordError('Your session has expired. Redirecting to login...');
        setTimeout(() => navigate('/signin'), 2000);
      }
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Timer functions
  useEffect(() => {
    if (!endTime || !isAuthenticated) return;
    
    const updateTimer = () => {
      const now = new Date();
      const secondsRemaining = Math.max(0, differenceInSeconds(endTime, now));
      
      setRemainingTime(secondsRemaining);
      
      // Set warning when less than 5 minutes remaining
      if (secondsRemaining <= 300 && secondsRemaining > 0) {
        setIsTimeWarning(true);
      }
      
      // Auto-submit when time is up
      if (secondsRemaining <= 0 && quiz?.autoSubmit && !submitted) {
        handleSubmitExam();
      }
    };
    
    // Initial update
    updateTimer();
    
    // Update every second
    const timerId = setInterval(updateTimer, 1000);
    
    return () => clearInterval(timerId);
  }, [endTime, isAuthenticated, quiz, submitted]);

  // Format remaining time for display
  const formatRemainingTime = () => {
    if (remainingTime <= 0) return '00:00:00';
    
    const duration = intervalToDuration({ start: 0, end: remainingTime * 1000 });
    
    const formatted = formatDuration(duration, {
      format: ['hours', 'minutes', 'seconds'],
      zero: true,
      delimiter: ':',
    });
    
    return formatted || '00:00:00';
  };

  // Answer handling
  const handleAnswerChange = (value: string | string[]) => {
    const updatedAnswers = [...answers];
    const currentQuestion = quiz?.questions[currentQuestionIndex];
    
    if (!currentQuestion) return;
    
    const answerIndex = updatedAnswers.findIndex(
      a => a.questionId === currentQuestion._id
    );
    
    if (answerIndex >= 0) {
      updatedAnswers[answerIndex].answer = value;
    } else {
      updatedAnswers.push({ questionId: currentQuestion._id, answer: value });
    }
    
    setAnswers(updatedAnswers);
    setSavedStatus({ ...savedStatus, [currentQuestion._id]: false });
  };

  // Save current answer
  const saveCurrentAnswer = async () => {
    if (!sessionId || !quiz) return;
    
    const currentQuestion = quiz.questions[currentQuestionIndex];
    const currentAnswer = answers.find(a => a.questionId === currentQuestion._id);
    
    if (!currentAnswer) return;
    
    setIsSaving(true);
    
    try {
      // Ensure auth headers are set
      setAuthHeaders();
      
      await axios.post(`${API_URL}/api/quizzes/session/${sessionId}/save-answer`, {
        questionId: currentQuestion._id,
        answer: currentAnswer.answer
      });
      
      setSavedStatus({ ...savedStatus, [currentQuestion._id]: true });
    } catch (err) {
      console.error('Error saving answer:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Auto-save answers when changing questions
  useEffect(() => {
    if (!quiz || !sessionId) return;
    
    const currentQuestion = quiz.questions[currentQuestionIndex];
    const currentAnswer = answers.find(a => a.questionId === currentQuestion._id);
    
    if (currentAnswer && !savedStatus[currentQuestion._id]) {
      saveCurrentAnswer();
    }
  }, [currentQuestionIndex]);

  // Navigation between questions
  const handleNextQuestion = () => {
    if (!quiz) return;
    
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const goToQuestion = (index: number) => {
    if (!quiz) return;
    
    if (index >= 0 && index < quiz.questions.length) {
      setCurrentQuestionIndex(index);
    }
  };

  // Submission handling
  const handleOpenSubmitDialog = () => {
    setIsSubmitDialogOpen(true);
  };

  const handleCloseSubmitDialog = () => {
    setIsSubmitDialogOpen(false);
  };

  const handleSubmitExam = async () => {
    if (!sessionId) return;
    
    setIsSubmitting(true);
    
    try {
      // Ensure auth headers are set
      setAuthHeaders();
      
      await axios.post(`${API_URL}/api/quizzes/session/${sessionId}/submit`);
      setSubmitted(true);
      handleCloseSubmitDialog();
    } catch (err: any) {
      console.error('Error submitting exam:', err);
      setError(err.response?.data?.message || 'Failed to submit exam');
      
      // If unauthorized, redirect to login
      if (err.response?.status === 401) {
        setError('Your session has expired. Redirecting to login...');
        setTimeout(() => navigate('/signin'), 2000);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render the current question
  const renderQuestion = () => {
    if (!quiz) {
      console.log('No quiz data available');
      return null;
    }
    
    console.log('Quiz data in renderQuestion:', quiz);
    console.log('Quiz questions in renderQuestion:', quiz.questions);
    
    // Ensure questions is an array
    if (!Array.isArray(quiz.questions)) {
      console.error('quiz.questions is not an array:', quiz.questions);
      return (
        <Box sx={{ p: 3 }}>
          <Alert severity="error">
            Error loading exam questions. Please try again or contact support.
          </Alert>
        </Box>
      );
    }
    
    // Check if we have questions
    if (quiz.questions.length === 0) {
      console.error('No questions found in the quiz');
      return (
        <Box sx={{ p: 3 }}>
          <Alert severity="warning">
            This exam has no questions. Please contact your instructor.
          </Alert>
        </Box>
      );
    }
    
    console.log('Current question index:', currentQuestionIndex);
    
    const question = quiz.questions[currentQuestionIndex];
    if (!question) {
      console.log('No question found at index', currentQuestionIndex);
      return null;
    }
    
    console.log('Current question:', question);
    
    const currentAnswer = answers.find(a => a.questionId === question._id);
    const answerValue = currentAnswer?.answer || '';
    
    return (
      <Box sx={{ 
        bgcolor: '#f5f5f5', 
        minHeight: '100vh',
        pb: 4 
      }}>
        <AppBar position="static" color="default" elevation={2} sx={{ bgcolor: 'white' }}>
          <Toolbar>
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
              <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                {quiz?.title}
              </Typography>
              
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center',
                bgcolor: isTimeWarning ? 'error.100' : 'primary.50',
                px: 2,
                py: 1,
                borderRadius: 2,
                border: 1,
                borderColor: isTimeWarning ? 'error.main' : 'primary.main',
                animation: isTimeWarning ? 'pulse 2s infinite' : 'none',
                '@keyframes pulse': {
                  '0%': { opacity: 1 },
                  '50%': { opacity: 0.7 },
                  '100%': { opacity: 1 },
                },
              }}>
                <TimerIcon sx={{ 
                  mr: 1, 
                  color: isTimeWarning ? 'error.main' : 'primary.main'
                }} />
                <Typography variant="h6" sx={{ 
                  fontFamily: 'monospace',
                  fontWeight: 'bold',
                  color: isTimeWarning ? 'error.main' : 'primary.main'
                }}>
                  {formatRemainingTime()}
                </Typography>
              </Box>
              
              <Button
                variant="contained"
                color="primary"
                onClick={handleOpenSubmitDialog}
                disabled={isSubmitting}
                size="large"
                sx={{ fontWeight: 'bold' }}
              >
                Submit Exam
              </Button>
            </Box>
          </Toolbar>
        </AppBar>
        
        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
            <Box sx={{ width: { xs: '100%', md: '25%' } }}>
              <Paper elevation={3} sx={{ p: 3, position: 'sticky', top: '1rem' }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Progress
                </Typography>
                
                <Box sx={{ mb: 3 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={(answers.filter(a => a.answer).length / quiz!.questions.length) * 100} 
                    sx={{ 
                      height: 12, 
                      borderRadius: 6,
                      mb: 1
                    }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    {answers.filter(a => a.answer).length} of {quiz!.questions.length} questions answered
                  </Typography>
                </Box>
                
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', mt: 3 }}>
                  Question Navigator
                </Typography>
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {quiz!.questions.map((q, index) => {
                    const isAnswered = answers.some(a => a.questionId === q._id && a.answer);
                    const isCurrent = currentQuestionIndex === index;
                    
                    return (
                      <Button
                        key={q._id}
                        variant={isCurrent ? "contained" : "outlined"}
                        color={isAnswered ? 'success' : 'primary'}
                        onClick={() => goToQuestion(index)}
                        sx={{ 
                          minWidth: '40px', 
                          height: '40px', 
                          p: 0,
                          fontWeight: 'bold',
                          border: isCurrent && !isAnswered ? 2 : 1
                        }}
                      >
                        {index + 1}
                      </Button>
                    );
                  })}
                </Box>
              </Paper>
            </Box>
            
            <Box sx={{ width: { xs: '100%', md: '75%' } }}>
              <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, mb: 3 }}>
                <Box>
                  {/* Question Header */}
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    mb: 3
                  }}>
                    <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                      Question {currentQuestionIndex + 1} of {quiz!.questions.length}
                    </Typography>
                    
                    <Chip
                      label={question.type === 'MCQ' ? 'Multiple Choice' : 
                            question.type === 'shortAnswer' ? 'Short Answer' : 
                            question.type === 'longAnswer' ? 'Long Answer' : 'True/False'}
                      color="primary"
                      variant="outlined"
                    />
                  </Box>
                  
                  {/* Question text */}
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      mb: 3, 
                      fontWeight: 500,
                      lineHeight: 1.5
                    }}
                  >
                    {question.text}
                  </Typography>
                  
                  {/* Question media */}
                  <Box sx={{ my: 3 }}>
                    {question.imageUrl && (
                      <Box sx={{ 
                        mb: 3,
                        display: 'flex',
                        justifyContent: 'center'
                      }}>
                        <img 
                          src={question.imageUrl} 
                          alt="Question" 
                          style={{ 
                            maxWidth: '100%', 
                            maxHeight: '400px',
                            borderRadius: '8px',
                            boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                          }} 
                        />
                      </Box>
                    )}
                    
                    {question.audioUrl && (
                      <Box sx={{ mb: 3 }}>
                        <audio controls style={{ width: '100%' }}>
                          <source src={question.audioUrl} />
                          Your browser does not support the audio element.
                        </audio>
                      </Box>
                    )}
                    
                    {question.videoUrl && (
                      <Box sx={{ mb: 3, textAlign: 'center' }}>
                        <video controls style={{ maxWidth: '100%', maxHeight: '400px', borderRadius: '8px' }}>
                          <source src={question.videoUrl} />
                          Your browser does not support the video element.
                        </video>
                      </Box>
                    )}
                    
                    {question.gifUrl && (
                      <Box sx={{ mb: 3, textAlign: 'center' }}>
                        <img 
                          src={question.gifUrl} 
                          alt="Question GIF" 
                          style={{ 
                            maxWidth: '100%', 
                            maxHeight: '400px',
                            borderRadius: '8px',
                            boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                          }} 
                        />
                      </Box>
                    )}
                  </Box>
                  
                  <Divider sx={{ mb: 4, mt: 2 }} />
                  
                  {/* Answer inputs */}
                  <Box sx={{ mb: 4 }}>
                    {question.type === 'MCQ' && question.options && (
                      <RadioGroup
                        value={answerValue}
                        onChange={(e) => handleAnswerChange(e.target.value)}
                      >
                        {question.options.map((option, index) => (
                          <Paper 
                            key={index} 
                            elevation={answerValue === option ? 3 : 1}
                            sx={{ 
                              mb: 2, 
                              borderRadius: 2,
                              border: answerValue === option ? 2 : 1,
                              borderColor: answerValue === option ? 'primary.main' : 'divider',
                              overflow: 'hidden'
                            }}
                          >
                            <FormControlLabel
                              value={option}
                              control={<Radio color="primary" />}
                              label={
                                <Typography variant="body1" sx={{ p: 1 }}>
                                  {option}
                                </Typography>
                              }
                              sx={{ 
                                width: '100%', 
                                m: 0,
                                p: 1,
                                '&:hover': { 
                                  bgcolor: 'action.hover',
                                }
                              }}
                            />
                          </Paper>
                        ))}
                      </RadioGroup>
                    )}
                    
                    {question.type === 'trueFalse' && (
                      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
                        <Box sx={{ width: { xs: '100%', sm: '50%' } }}>
                          <Paper 
                            elevation={answerValue === 'true' ? 3 : 1}
                            sx={{ 
                              borderRadius: 2,
                              border: answerValue === 'true' ? 2 : 1,
                              borderColor: answerValue === 'true' ? 'success.main' : 'divider',
                              overflow: 'hidden'
                            }}
                          >
                            <FormControlLabel
                              value="true"
                              control={<Radio color="success" checked={answerValue === 'true'} onChange={(e) => handleAnswerChange(e.target.value)} />}
                              label={
                                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                  True
                                </Typography>
                              }
                              sx={{ 
                                width: '100%', 
                                m: 0,
                                p: 2,
                                '&:hover': { 
                                  bgcolor: 'action.hover',
                                }
                              }}
                            />
                          </Paper>
                        </Box>
                        <Box sx={{ width: { xs: '100%', sm: '50%' } }}>
                          <Paper 
                            elevation={answerValue === 'false' ? 3 : 1}
                            sx={{ 
                              borderRadius: 2,
                              border: answerValue === 'false' ? 2 : 1,
                              borderColor: answerValue === 'false' ? 'error.main' : 'divider',
                              overflow: 'hidden'
                            }}
                          >
                            <FormControlLabel
                              value="false"
                              control={<Radio color="error" checked={answerValue === 'false'} onChange={(e) => handleAnswerChange(e.target.value)} />}
                              label={
                                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                  False
                                </Typography>
                              }
                              sx={{ 
                                width: '100%', 
                                m: 0,
                                p: 2,
                                '&:hover': { 
                                  bgcolor: 'action.hover',
                                }
                              }}
                            />
                          </Paper>
                        </Box>
                      </Box>
                    )}
                    
                    {question.type === 'shortAnswer' && (
                      <TextField
                        fullWidth
                        label="Your Answer"
                        variant="outlined"
                        value={answerValue as string}
                        onChange={(e) => handleAnswerChange(e.target.value)}
                        multiline
                        rows={2}
                        sx={{ 
                          '& .MuiOutlinedInput-root': { 
                            borderRadius: 2,
                          }
                        }}
                      />
                    )}
                    
                    {question.type === 'longAnswer' && (
                      <TextField
                        fullWidth
                        label="Your Answer"
                        variant="outlined"
                        value={answerValue as string}
                        onChange={(e) => handleAnswerChange(e.target.value)}
                        multiline
                        rows={6}
                        sx={{ 
                          '& .MuiOutlinedInput-root': { 
                            borderRadius: 2,
                          }
                        }}
                      />
                    )}
                  </Box>
                  
                  {/* Save status */}
                  <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                    {isSaving ? (
                      <Chip
                        label="Saving..."
                        color="primary"
                        icon={<CircularProgress size={16} color="inherit" />}
                        variant="outlined"
                      />
                    ) : savedStatus[question._id] ? (
                      <Chip
                        label="Saved"
                        color="success"
                        icon={<CheckCircleIcon fontSize="small" />}
                        variant="filled"
                      />
                    ) : answerValue ? (
                      <Chip
                        label="Save Answer"
                        color="primary"
                        variant="outlined"
                        onClick={saveCurrentAnswer}
                        sx={{ cursor: 'pointer' }}
                      />
                    ) : null}
                  </Box>
                </Box>
              </Paper>
              
              {/* Navigation buttons */}
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                mt: 2
              }}>
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<NavigateBeforeIcon />}
                  onClick={handlePreviousQuestion}
                  disabled={currentQuestionIndex === 0}
                  sx={{ px: 4 }}
                >
                  Previous
                </Button>
                
                <Button
                  variant="contained"
                  size="large"
                  color="primary"
                  endIcon={<NavigateNextIcon />}
                  onClick={handleNextQuestion}
                  disabled={currentQuestionIndex === quiz!.questions.length - 1}
                  sx={{ px: 4 }}
                >
                  Next
                </Button>
              </Box>
            </Box>
          </Box>
        </Container>
        
        {/* Submit confirmation dialog */}
        <Dialog open={isSubmitDialogOpen} onClose={handleCloseSubmitDialog} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 'bold' }}>
            Submit Exam
          </DialogTitle>
          <DialogContent sx={{ pt: 3, pb: 1 }}>
            <Typography variant="body1" gutterBottom>
              Are you sure you want to submit your exam? Once submitted, you cannot make any changes.
            </Typography>
            
            <Box sx={{ mt: 3, mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                Exam Summary:
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                • Total Questions: {quiz!.questions.length}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                • Answered Questions: {answers.filter(a => a.answer).length}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                • Unanswered Questions: {quiz!.questions.length - answers.filter(a => a.answer).length}
              </Typography>
            </Box>
            
            {answers.filter(a => a.answer).length < quiz!.questions.length && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                  You have {quiz!.questions.length - answers.filter(a => a.answer).length} unanswered questions. Are you sure you want to submit?
                </Typography>
              </Alert>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button 
              onClick={handleCloseSubmitDialog} 
              disabled={isSubmitting}
              variant="outlined"
              size="large"
            >
              Continue Exam
            </Button>
            <Button
              onClick={handleSubmitExam}
              color="primary"
              variant="contained"
              disabled={isSubmitting}
              size="large"
              startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Exam'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    );
  };

  // Main render
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button variant="outlined" onClick={() => navigate('/student/dashboard')}>
          Back to Dashboard
        </Button>
      </Box>
    );
  }

  if (submitted) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Paper elevation={3} sx={{ p: 4, maxWidth: 600, mx: 'auto' }}>
          <CheckCircleIcon color="success" sx={{ fontSize: 60, mb: 2 }} />
          <Typography variant="h4" gutterBottom>
            Exam Submitted Successfully
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            Your answers have been recorded. Thank you for completing the exam.
          </Typography>
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => navigate('/student/dashboard')}
          >
            Return to Dashboard
          </Button>
        </Paper>
      </Box>
    );
  }

  if (!isAuthenticated) {
    return (
      <Box sx={{ p: 3 }}>
        <Paper elevation={3} sx={{ p: 4, maxWidth: 500, mx: 'auto' }}>
          <Typography variant="h5" component="h1" gutterBottom>
            Enter Exam Password
          </Typography>
          
          <Typography variant="body1" gutterBottom>
            This exam is password protected. Please enter the password provided by your instructor.
          </Typography>
          
          <form onSubmit={handleAuthenticate}>
            <TextField
              fullWidth
              type="password"
              label="Password"
              variant="outlined"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={!!passwordError}
              helperText={passwordError}
              margin="normal"
            />
            
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
              <Button 
                variant="outlined" 
                onClick={() => navigate('/student/dashboard')}
              >
                Cancel
              </Button>
              
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={isAuthenticating}
              >
                {isAuthenticating ? 'Verifying...' : 'Begin Exam'}
              </Button>
            </Box>
          </form>
        </Paper>
      </Box>
    );
  }

  return renderQuestion();
};

export default ExamSession;

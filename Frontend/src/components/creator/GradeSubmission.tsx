import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../config/api';
import { useAuth } from '../../contexts/AuthContext';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Divider,
  Chip,
  FormControlLabel,
  Checkbox,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Card,
  CardContent,
} from '@mui/material';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import SaveIcon from '@mui/icons-material/Save';
import { format } from 'date-fns';

interface IQuestion {
  _id: string;
  text: string;
  type: 'MCQ' | 'shortAnswer' | 'longAnswer' | 'trueFalse';
  options?: string[];
  correctAnswer: string | string[];
  points: number;
}

interface IAnswer {
  _id: string;
  questionId: string;
  studentAnswer: string | string[];
  score?: number;
  feedback?: string;
  isCorrect?: boolean;
}

interface ISubmission {
  _id: string;
  quizId: {
    _id: string;
    title: string;
    description: string;
    questions: IQuestion[];
  };
  studentId: {
    _id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  answers: IAnswer[];
  submittedAt: string;
  isGraded: boolean;
  totalScore: number;
  feedback: string;
  gradedAt?: string;
}

const GradeSubmission: React.FC = () => {
  const { submissionId } = useParams<{ submissionId: string }>();
  const navigate = useNavigate();
  const { setAuthHeaders } = useAuth();
  
  const [submission, setSubmission] = useState<ISubmission | null>(null);
  const [gradedAnswers, setGradedAnswers] = useState<IAnswer[]>([]);
  const [totalScore, setTotalScore] = useState<number>(0);
  const [feedback, setFeedback] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [activeStep, setActiveStep] = useState(0);
  
  // Fetch submission details
  useEffect(() => {
    const fetchSubmission = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Ensure auth headers are set
        if (!setAuthHeaders()) {
          setError('Authentication failed. Please log in again.');
          setTimeout(() => navigate('/signin'), 2000);
          return;
        }
        
        const response = await axios.get(`${API_URL}/api/quizzes/submissions/${submissionId}`);
        setSubmission(response.data);
        
        // Initialize graded answers
        if (response.data.isGraded) {
          setGradedAnswers(response.data.answers);
          setTotalScore(response.data.totalScore);
          setFeedback(response.data.feedback || '');
        } else {
          // Set up initial grading data
          const initialGradedAnswers = response.data.answers.map((answer: IAnswer) => {
            const question = response.data.quizId.questions.find(
              (q: IQuestion) => q._id === answer.questionId
            );
            
            // Auto-grade MCQ and trueFalse questions
            let score = 0;
            let isCorrect = false;
            
            if (question && (question.type === 'MCQ' || question.type === 'trueFalse')) {
              isCorrect = answer.studentAnswer === question.correctAnswer;
              score = isCorrect ? question.points : 0;
            }
            
            return {
              ...answer,
              score,
              feedback: '',
              isCorrect
            };
          });
          
          setGradedAnswers(initialGradedAnswers);
          
          // Calculate initial total score
          const autoScore = initialGradedAnswers.reduce((sum: number, a: IAnswer) => sum + (a.score || 0), 0);
          setTotalScore(autoScore);
        }
      } catch (err: any) {
        console.error('Error fetching submission:', err);
        setError(err.response?.data?.message || 'Failed to fetch submission');
        
        // If unauthorized, redirect to login
        if (err.response?.status === 401) {
          setTimeout(() => navigate('/signin'), 2000);
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchSubmission();
  }, [submissionId, navigate, setAuthHeaders]);
  
  // Handle score change for an answer
  const handleScoreChange = (questionId: string, score: number) => {
    const updatedAnswers = gradedAnswers.map(answer => {
      if (answer.questionId === questionId) {
        const question = submission?.quizId.questions.find(q => q._id === questionId);
        const maxPoints = question?.points || 0;
        
        // Ensure score doesn't exceed max points
        const validScore = Math.min(Math.max(0, score), maxPoints);
        
        return {
          ...answer,
          score: validScore,
          isCorrect: validScore === maxPoints
        };
      }
      return answer;
    });
    
    setGradedAnswers(updatedAnswers);
    
    // Update total score
    const newTotalScore = updatedAnswers.reduce((sum, a) => sum + (a.score || 0), 0);
    setTotalScore(newTotalScore);
  };
  
  // Handle feedback change for an answer
  const handleFeedbackChange = (questionId: string, feedback: string) => {
    const updatedAnswers = gradedAnswers.map(answer => {
      if (answer.questionId === questionId) {
        return {
          ...answer,
          feedback
        };
      }
      return answer;
    });
    
    setGradedAnswers(updatedAnswers);
  };
  
  // Submit graded exam
  const handleSubmitGrade = async () => {
    try {
      setSaving(true);
      setError(null);
      
      // Ensure auth headers are set
      if (!setAuthHeaders()) {
        setError('Authentication failed. Please log in again.');
        setTimeout(() => navigate('/signin'), 2000);
        return;
      }
      
      const response = await axios.post(`${API_URL}/api/quizzes/submissions/${submissionId}/grade`, {
        gradedAnswers,
        feedback,
        totalScore
      });
      
      setSaveSuccess(true);
      
      // Update local state with the response
      setSubmission(response.data.submission);
      
      // Redirect after 2 seconds
      setTimeout(() => {
        navigate(`/creator/quizzes/${submission?.quizId._id}/submissions`);
      }, 2000);
      
    } catch (err: any) {
      console.error('Error saving grades:', err);
      setError(err.response?.data?.message || 'Failed to save grades');
      
      // If unauthorized, redirect to login
      if (err.response?.status === 401) {
        setTimeout(() => navigate('/signin'), 2000);
      }
    } finally {
      setSaving(false);
    }
  };
  
  // Handle navigation between questions
  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
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
        <Button variant="outlined" onClick={() => navigate(-1)}>
          Back
        </Button>
      </Box>
    );
  }
  
  if (!submission) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          Submission not found
        </Alert>
        <Button variant="outlined" onClick={() => navigate(-1)}>
          Back
        </Button>
      </Box>
    );
  }
  
  // Format student answers for display
  const formatStudentAnswer = (answer: IAnswer) => {
    const question = submission.quizId.questions.find(q => q._id === answer.questionId);
    
    if (!question) return 'No answer';
    
    if (question.type === 'MCQ' && question.options) {
      return <Typography>{answer.studentAnswer as string}</Typography>;
    }
    
    if (question.type === 'trueFalse') {
      return (
        <Chip 
          label={answer.studentAnswer === 'true' ? 'True' : 'False'} 
          color={answer.studentAnswer === 'true' ? 'success' : 'error'} 
          variant="outlined" 
        />
      );
    }
    
    if (question.type === 'shortAnswer' || question.type === 'longAnswer') {
      return (
        <Paper elevation={1} sx={{ p: 2, bgcolor: 'grey.50' }}>
          <Typography>
            {answer.studentAnswer as string || 'No answer provided'}
          </Typography>
        </Paper>
      );
    }
    
    return 'Unknown answer type';
  };
  
  // Calculate max possible score
  const maxPossibleScore = submission.quizId.questions.reduce(
    (sum, q) => sum + q.points, 0
  );
  
  return (
    <Box sx={{ p: 3 }}>
      {saveSuccess && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Grades saved successfully. Redirecting...
        </Alert>
      )}
      
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
          <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 66.67%' } }}>
            <Typography variant="h4" gutterBottom>
              {submission.quizId.title}
            </Typography>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              {submission.quizId.description}
            </Typography>
          </Box>
          <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 33.33%' }, display: 'flex', flexDirection: 'column', alignItems: { xs: 'flex-start', md: 'flex-end' } }}>
            <Box sx={{ mb: 1 }}>
              <Typography variant="body2">
                <strong>Student:</strong> {submission.studentId.firstName} {submission.studentId.lastName}
              </Typography>
              <Typography variant="body2">
                <strong>Email:</strong> {submission.studentId.email}
              </Typography>
              <Typography variant="body2">
                <strong>Submitted:</strong> {format(new Date(submission.submittedAt), 'MMM d, yyyy h:mm a')}
              </Typography>
            </Box>
            
            {submission.isGraded && (
              <Chip 
                label="Graded"
                color="success"
                icon={<AssignmentTurnedInIcon />}
                sx={{ mt: 1 }}
              />
            )}
          </Box>
        </Box>
      </Paper>
      
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 66.67%' } }}>
          <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h5" gutterBottom>
              Question Responses
            </Typography>
            
            <Stepper activeStep={activeStep} orientation="vertical">
              {submission.quizId.questions.map((question, index) => {
                const answer = gradedAnswers.find(a => a.questionId === question._id);
                if (!answer) return null;
                
                const questionPoints = question.points;
                const currentScore = answer.score || 0;
                
                return (
                  <Step key={question._id}>
                    <StepLabel>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                        <Typography variant="subtitle1">
                          Question {index + 1}
                          {answer.isCorrect ? (
                            <CheckCircleIcon color="success" fontSize="small" sx={{ ml: 1, verticalAlign: 'middle' }} />
                          ) : (
                            <CancelIcon color="error" fontSize="small" sx={{ ml: 1, verticalAlign: 'middle' }} />
                          )}
                        </Typography>
                        <Chip 
                          label={`${currentScore}/${questionPoints} pts`} 
                          color={currentScore === questionPoints ? 'success' : currentScore === 0 ? 'error' : 'warning'} 
                          size="small"
                        />
                      </Box>
                    </StepLabel>
                    <StepContent>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body1" sx={{ mb: 1, fontWeight: 'medium' }}>
                          {question.text}
                        </Typography>
                        
                        <Box sx={{ bgcolor: 'primary.50', p: 2, borderRadius: 1, mb: 2 }}>
                          <Typography variant="subtitle2" gutterBottom>
                            Correct Answer:
                          </Typography>
                          <Typography variant="body1">
                            {question.correctAnswer}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" gutterBottom>
                            Student Answer:
                          </Typography>
                          {formatStudentAnswer(answer)}
                        </Box>
                        
                        <Divider sx={{ my: 2 }} />
                        
                        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
                          <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 50%' } }}>
                            <Typography variant="subtitle2" gutterBottom>
                              Score:
                            </Typography>
                            <TextField
                              fullWidth
                              type="number"
                              InputProps={{ 
                                inputProps: { 
                                  min: 0, 
                                  max: questionPoints 
                                } 
                              }}
                              value={answer.score || 0}
                              onChange={(e) => handleScoreChange(question._id, parseInt(e.target.value) || 0)}
                              size="small"
                              label={`Out of ${questionPoints} points`}
                              variant="outlined"
                            />
                          </Box>
                          <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 50%' } }}>
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={answer.isCorrect || false}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      handleScoreChange(question._id, questionPoints);
                                    } else {
                                      handleScoreChange(question._id, 0);
                                    }
                                  }}
                                />
                              }
                              label="Mark as correct (full points)"
                            />
                          </Box>
                        </Box>
                        
                        <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                          Feedback:
                        </Typography>
                        <TextField
                          fullWidth
                          multiline
                          rows={2}
                          value={answer.feedback || ''}
                          onChange={(e) => handleFeedbackChange(question._id, e.target.value)}
                          placeholder="Provide feedback to the student"
                          variant="outlined"
                        />
                      </Box>
                      
                      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
                        <Button
                          disabled={index === 0}
                          onClick={handleBack}
                        >
                          Previous
                        </Button>
                        {index < submission.quizId.questions.length - 1 ? (
                          <Button
                            variant="contained"
                            onClick={handleNext}
                          >
                            Next
                          </Button>
                        ) : (
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={() => setActiveStep(submission.quizId.questions.length)}
                          >
                            Finish Grading
                          </Button>
                        )}
                      </Box>
                    </StepContent>
                  </Step>
                );
              })}
              
              <Step key="summary">
                <StepLabel>
                  <Typography variant="subtitle1">
                    Submit Grades
                  </Typography>
                </StepLabel>
                <StepContent>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      Grading Summary
                    </Typography>
                    
                    <Card variant="outlined" sx={{ mb: 3 }}>
                      <CardContent>
                        <Typography variant="body2" gutterBottom>
                          <strong>Total Score:</strong> {totalScore} / {maxPossibleScore} points
                        </Typography>
                        <Typography variant="body2" gutterBottom>
                          <strong>Percentage:</strong> {Math.round((totalScore / maxPossibleScore) * 100)}%
                        </Typography>
                        <Typography variant="body2">
                          <strong>Questions Graded:</strong> {gradedAnswers.filter(a => a.score !== undefined).length} / {gradedAnswers.length}
                        </Typography>
                      </CardContent>
                    </Card>
                    
                    <Typography variant="subtitle1" gutterBottom>
                      Overall Feedback:
                    </Typography>
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="Provide overall feedback for the student"
                      variant="outlined"
                      sx={{ mb: 3 }}
                    />
                  </Box>
                  
                  <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
                    <Button
                      onClick={handleBack}
                    >
                      Back to Last Question
                    </Button>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<SaveIcon />}
                      onClick={handleSubmitGrade}
                      disabled={saving}
                    >
                      {saving ? 'Saving...' : 'Submit Grades'}
                    </Button>
                  </Box>
                </StepContent>
              </Step>
            </Stepper>
          </Paper>
        </Box>
        
        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 33.33%' }, p: 3, position: 'sticky', top: '1rem' }}>
          <Typography variant="h6" gutterBottom>
            Grading Progress
          </Typography>
          
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" gutterBottom>
              <strong>Total Questions:</strong> {submission.quizId.questions.length}
            </Typography>
            <Typography variant="body2" gutterBottom>
              <strong>Questions Graded:</strong> {gradedAnswers.filter(a => a.score !== undefined).length} / {submission.quizId.questions.length}
            </Typography>
            <Typography variant="body2" gutterBottom>
              <strong>Current Score:</strong> {totalScore} / {maxPossibleScore}
            </Typography>
            <Typography variant="body2">
              <strong>Percentage:</strong> {Math.round((totalScore / maxPossibleScore) * 100)}%
            </Typography>
          </Box>
          
          <Button
            variant="contained"
            color="primary"
            fullWidth
            startIcon={<SaveIcon />}
            onClick={handleSubmitGrade}
            disabled={saving}
            sx={{ mb: 2 }}
          >
            {saving ? 'Saving...' : 'Submit Grades'}
          </Button>
          
          <Button
            variant="outlined"
            fullWidth
            onClick={() => navigate(`/creator/quizzes/${submission.quizId._id}/submissions`)}
          >
            Cancel
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default GradeSubmission; 
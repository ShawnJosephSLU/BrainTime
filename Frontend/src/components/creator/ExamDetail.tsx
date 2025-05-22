import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../config/api';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Divider,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import RefreshIcon from '@mui/icons-material/Refresh';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';

interface IExam {
  _id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  duration: number;
  questions: any[];
  isLive: boolean;
  allowInternet: boolean;
  password: string;
  autoSubmit: boolean;
  shuffleQuestions: boolean;
  showResults: boolean;
}

const ExamDetail: React.FC = () => {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const { setAuthHeaders, refreshAuth } = useAuth();
  const [exam, setExam] = useState<IExam | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isTogglingLive, setIsTogglingLive] = useState<boolean>(false);

  useEffect(() => {
    // Refresh auth and fetch data
    refreshAuth();
    setAuthHeaders();
    fetchExamDetails();
  }, [examId]);

  const fetchExamDetails = async () => {
    if (!examId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Ensure auth headers are set
      setAuthHeaders();
      
      const response = await axios.get(`${API_URL}/api/quizzes/${examId}`);
      setExam(response.data);
    } catch (err: any) {
      console.error('Error fetching exam details:', err);
      const errorMessage = err.response?.data?.message || 'Failed to fetch exam details';
      setError(errorMessage);
      
      if (err.response?.status === 401) {
        setError('Authentication error. Please try refreshing your login.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    // Try refreshing the auth state
    const didRefresh = refreshAuth();
    setAuthHeaders();
    
    if (didRefresh) {
      fetchExamDetails();
    } else {
      setError('Authentication failed. Please log in again.');
      setTimeout(() => {
        navigate(`/signin?returnUrl=/creator/exams/${examId}`);
      }, 2000);
    }
  };

  const handleToggleLiveStatus = async () => {
    if (!exam) return;
    
    setIsTogglingLive(true);
    setError(null);
    
    try {
      // Ensure auth headers are set
      setAuthHeaders();
      
      const newStatus = !exam.isLive;
      await axios.patch(`${API_URL}/api/quizzes/${exam._id}/toggle-live`, {
        isLive: newStatus
      });
      
      setSuccess(`Exam is now ${newStatus ? 'live' : 'offline'}`);
      
      // Update the local state
      setExam({
        ...exam,
        isLive: newStatus
      });
    } catch (err: any) {
      console.error('Error toggling exam status:', err);
      setError(err.response?.data?.message || 'Failed to update exam status');
    } finally {
      setIsTogglingLive(false);
    }
  };

  const handleEdit = () => {
    navigate(`/creator/exams/edit/${examId}`);
  };

  const handleBack = () => {
    navigate('/creator/exams');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={handleBack} sx={{ mb: 3 }}>
          Back to Exams
        </Button>
        
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          action={
            <Button color="inherit" size="small" onClick={handleRetry}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }

  if (!exam) {
    return (
      <Box sx={{ p: 3 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={handleBack} sx={{ mb: 3 }}>
          Back to Exams
        </Button>
        
        <Alert severity="warning">Exam not found</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={handleBack}>
          Back to Exams
        </Button>
        
        <Box>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<RefreshIcon />}
            onClick={handleRetry}
            sx={{ mr: 2 }}
          >
            Refresh
          </Button>
          
          <Button
            variant="outlined"
            color={exam.isLive ? 'error' : 'success'}
            startIcon={exam.isLive ? <LockIcon /> : <LockOpenIcon />}
            onClick={handleToggleLiveStatus}
            disabled={isTogglingLive}
            sx={{ mr: 2 }}
          >
            {isTogglingLive
              ? 'Updating...'
              : exam.isLive
              ? 'Take Offline'
              : 'Make Live'}
          </Button>
          
          <Button
            variant="contained"
            color="primary"
            startIcon={<EditIcon />}
            onClick={handleEdit}
          >
            Edit Exam
          </Button>
          
          <Button
            variant="outlined"
            color="primary"
            startIcon={<AssignmentTurnedInIcon />}
            onClick={() => navigate(`/creator/exams/${examId}/submissions`)}
            sx={{ ml: 1 }}
          >
            View Submissions
          </Button>
        </Box>
      </Box>

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}
      
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="h4" component="h1">
                {exam.title}
              </Typography>
              <Chip 
                label={exam.isLive ? 'Live' : 'Offline'} 
                color={exam.isLive ? 'success' : 'default'} 
              />
            </Box>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {exam.description}
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ width: { xs: '100%', md: '48%' } }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Start Time
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {format(new Date(exam.startTime), 'MMM dd, yyyy h:mm a')}
                </Typography>
              </Box>
              
              <Box sx={{ width: { xs: '100%', md: '48%' } }}>
                <Typography variant="subtitle2" color="text.secondary">
                  End Time
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {format(new Date(exam.endTime), 'MMM dd, yyyy h:mm a')}
                </Typography>
              </Box>
              
              <Box sx={{ width: { xs: '100%', md: '31%' } }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Duration
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {exam.duration} minutes
                </Typography>
              </Box>
              
              <Box sx={{ width: { xs: '100%', md: '31%' } }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Password
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {exam.password}
                </Typography>
              </Box>
              
              <Box sx={{ width: { xs: '100%', md: '31%' } }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Features
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  {exam.allowInternet && <Chip size="small" label="Allow Internet" />}
                  {exam.autoSubmit && <Chip size="small" label="Auto Submit" />}
                  {exam.shuffleQuestions && <Chip size="small" label="Shuffle Questions" />}
                  {exam.showResults && <Chip size="small" label="Show Results" />}
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </Paper>
      
      <Typography variant="h5" sx={{ mb: 2 }}>
        Questions ({exam.questions.length})
      </Typography>
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {exam.questions.map((question, index) => (
          <Box key={index}>
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {index + 1}. {question.text}
                </Typography>
                
                {question.imageUrl && (
                  <Box sx={{ mb: 2 }}>
                    <img 
                      src={question.imageUrl} 
                      alt={`Question ${index + 1} image`} 
                      style={{ maxWidth: '100%', maxHeight: '300px' }} 
                    />
                  </Box>
                )}
                
                {question.type === 'MCQ' && (
                  <List dense>
                    {question.options.map((option: string, optionIndex: number) => (
                      <ListItem key={optionIndex}>
                        <ListItemText 
                          primary={`${String.fromCharCode(65 + optionIndex)}. ${option}`}
                          sx={{
                            fontWeight: Array.isArray(question.correctAnswer) 
                              ? question.correctAnswer.includes(option) ? 'bold' : 'normal'
                              : question.correctAnswer === option ? 'bold' : 'normal',
                            color: Array.isArray(question.correctAnswer) 
                              ? question.correctAnswer.includes(option) ? 'success.main' : 'inherit'
                              : question.correctAnswer === option ? 'success.main' : 'inherit',
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
                
                {question.type === 'SHORT_ANSWER' && (
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Correct Answer:
                    </Typography>
                    <Typography variant="body2" color="success.main">
                      {question.correctAnswer}
                    </Typography>
                  </Box>
                )}
                
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Points: {question.points || 1}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default ExamDetail; 
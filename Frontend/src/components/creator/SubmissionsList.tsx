import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../config/api';
import { useAuth } from '../../contexts/AuthContext';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  Alert,
  CircularProgress,
} from '@mui/material';
import { format } from 'date-fns';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import GradingIcon from '@mui/icons-material/Grading';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

interface ISubmission {
  _id: string;
  studentId: {
    _id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  submittedAt: string;
  isGraded: boolean;
  totalScore: number;
}

interface IQuiz {
  _id: string;
  title: string;
  description: string;
  maxScore?: number;
}

const SubmissionsList: React.FC = () => {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const { setAuthHeaders } = useAuth();
  
  const [submissions, setSubmissions] = useState<ISubmission[]>([]);
  const [quiz, setQuiz] = useState<IQuiz | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Ensure auth headers are set
        if (!setAuthHeaders()) {
          setError('Authentication failed. Please log in again.');
          setTimeout(() => navigate('/signin'), 2000);
          return;
        }
        
        // Fetch quiz details
        const quizResponse = await axios.get(`${API_URL}/api/quizzes/${examId}`);
        setQuiz(quizResponse.data);
        
        // Fetch submissions
        const submissionsResponse = await axios.get(`${API_URL}/api/quizzes/${examId}/submissions`);
        setSubmissions(submissionsResponse.data);
        
      } catch (err: any) {
        console.error('Error fetching submissions:', err);
        setError(err.response?.data?.message || 'Failed to fetch submissions');
        
        // If unauthorized, redirect to login
        if (err.response?.status === 401) {
          setTimeout(() => navigate('/signin'), 2000);
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchSubmissions();
  }, [examId, navigate, setAuthHeaders]);
  
  const handleGradeSubmission = (submissionId: string) => {
    navigate(`/creator/exams/${examId}/submissions/${submissionId}/grade`);
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
        <Button variant="outlined" onClick={() => navigate('/creator/exams')}>
          Back to Exams
        </Button>
      </Box>
    );
  }
  
  if (submissions.length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <Paper elevation={3} sx={{ p: 4, maxWidth: 800, mx: 'auto', textAlign: 'center' }}>
          <ErrorOutlineIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            No Submissions Yet
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            No students have submitted this exam yet. Check back later.
          </Typography>
          <Button variant="outlined" onClick={() => navigate('/creator/exams')}>
            Back to Exams
          </Button>
        </Paper>
      </Box>
    );
  }
  
  return (
    <Box sx={{ p: 3 }}>
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          {quiz?.title} - Submissions
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {quiz?.description}
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2">
            <strong>Total Submissions:</strong> {submissions.length}
          </Typography>
          <Typography variant="body2">
            <strong>Graded:</strong> {submissions.filter(s => s.isGraded).length} / {submissions.length}
          </Typography>
        </Box>
      </Paper>
      
      <TableContainer component={Paper} elevation={3}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'primary.main' }}>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Student</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Submitted</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Score</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {submissions.map((submission) => (
              <TableRow key={submission._id} hover>
                <TableCell>
                  <Box>
                    <Typography variant="body1">
                      {submission.studentId.firstName} {submission.studentId.lastName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {submission.studentId.email}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  {format(new Date(submission.submittedAt), 'MMM d, yyyy h:mm a')}
                </TableCell>
                <TableCell>
                  {submission.isGraded ? (
                    <Chip 
                      label="Graded" 
                      color="success" 
                      icon={<AssignmentTurnedInIcon />} 
                      size="small" 
                    />
                  ) : (
                    <Chip 
                      label="Needs Grading" 
                      color="warning" 
                      variant="outlined" 
                      icon={<GradingIcon />} 
                      size="small" 
                    />
                  )}
                </TableCell>
                <TableCell>
                  {submission.isGraded ? (
                    <Typography variant="body1" fontWeight="bold">
                      {submission.totalScore} / {quiz?.maxScore || 100}
                    </Typography>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Not graded yet
                    </Typography>
                  )}
                </TableCell>
                <TableCell align="right">
                  <Button
                    variant="contained"
                    color={submission.isGraded ? "secondary" : "primary"}
                    onClick={() => handleGradeSubmission(submission._id)}
                    startIcon={<GradingIcon />}
                  >
                    {submission.isGraded ? "Review" : "Grade"}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      
      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <Button variant="outlined" onClick={() => navigate('/creator/exams')}>
          Back to Exams
        </Button>
      </Box>
    </Box>
  );
};

export default SubmissionsList; 
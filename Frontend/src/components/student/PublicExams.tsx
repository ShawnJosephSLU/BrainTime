import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../config/api';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  Paper,
  Card,
  CardContent,
  CardActions,
  Chip,
  Alert,
  CircularProgress,
  Grid,
  Divider,
} from '@mui/material';
import PublicIcon from '@mui/icons-material/Public';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import RefreshIcon from '@mui/icons-material/Refresh';
import QuizIcon from '@mui/icons-material/Quiz';

interface PublicExam {
  _id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  duration: number;
  isLive: boolean;
  isPublic: boolean;
  adminId: {
    email: string;
    name?: string;
  };
}

const PublicExams: React.FC = () => {
  const navigate = useNavigate();
  const [exams, setExams] = useState<PublicExam[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPublicExams();
  }, []);

  const fetchPublicExams = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      const response = await axios.get(`${API_URL}/api/quizzes/public`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setExams(response.data);
    } catch (err: any) {
      console.error('Error fetching public exams:', err);
      setError(err.response?.data?.message || 'Failed to fetch public exams');
    } finally {
      setLoading(false);
    }
  };

  const handleStartExam = async (examId: string) => {
    try {
      // Check exam availability first
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      const response = await axios.get(`${API_URL}/api/quizzes/${examId}/availability`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.isAvailable) {
        // Navigate to exam authentication page
        navigate(`/student/exam/${examId}`);
      } else {
        setError('This exam is not currently available');
      }
    } catch (err: any) {
      console.error('Error checking exam availability:', err);
      setError(err.response?.data?.message || 'Failed to start exam');
    }
  };

  const handleRefresh = () => {
    fetchPublicExams();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getTimeStatus = (startTime: string, endTime: string) => {
    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);
    
    if (now < start) {
      return { status: 'upcoming', color: 'warning' as const, text: 'Starts soon' };
    } else if (now > end) {
      return { status: 'ended', color: 'error' as const, text: 'Ended' };
    } else {
      return { status: 'active', color: 'success' as const, text: 'Active' };
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" component="h2" gutterBottom>
            Public Assessments
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Take publicly available assessments without joining a group
          </Typography>
        </Box>
        
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
        >
          Refresh
        </Button>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {exams.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <QuizIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No public assessments available
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Check back later for new public assessments
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {exams.map((exam) => {
            const timeStatus = getTimeStatus(exam.startTime, exam.endTime);
            
            return (
              <Grid size={{ xs: 12, md: 6, lg: 4 }} key={exam._id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Typography variant="h6" gutterBottom sx={{ mb: 0 }}>
                        {exam.title}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 0.5, flexDirection: 'column', alignItems: 'flex-end' }}>
                        <Chip
                          icon={<PublicIcon />}
                          label="Public"
                          color="primary"
                          size="small"
                          variant="outlined"
                        />
                        <Chip
                          label={timeStatus.text}
                          color={timeStatus.color}
                          size="small"
                        />
                      </Box>
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {exam.description}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <AccessTimeIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        Duration: {exam.duration} minutes
                      </Typography>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                      Start: {formatDate(exam.startTime)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                      End: {formatDate(exam.endTime)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Created by: {exam.adminId.name || exam.adminId.email}
                    </Typography>
                  </CardContent>
                  
                  <CardActions>
                    {timeStatus.status === 'active' ? (
                      <Button 
                        size="small" 
                        variant="contained"
                        startIcon={<PlayArrowIcon />}
                        onClick={() => handleStartExam(exam._id)}
                        fullWidth
                      >
                        Start Assessment
                      </Button>
                    ) : timeStatus.status === 'upcoming' ? (
                      <Button size="small" disabled fullWidth>
                        Not Yet Available
                      </Button>
                    ) : (
                      <Button size="small" disabled fullWidth>
                        Assessment Ended
                      </Button>
                    )}
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
};

export default PublicExams; 
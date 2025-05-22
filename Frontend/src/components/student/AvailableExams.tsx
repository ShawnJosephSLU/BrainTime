import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../config/api';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  Card, 
  CardContent, 
  CardActions,
  Chip,
  Divider,
  CircularProgress,
  Alert
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EventIcon from '@mui/icons-material/Event';
import LockIcon from '@mui/icons-material/Lock';
import { format } from 'date-fns';

interface IExam {
  _id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  duration: number;
  isAvailable?: boolean;
  requiresPassword?: boolean;
  isLive: boolean;
}

const AvailableExams: React.FC = () => {
  const navigate = useNavigate();
  const { setAuthHeaders, refreshAuth } = useAuth();
  const [exams, setExams] = useState<IExam[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // Ensure auth headers are set
    refreshAuth();
    setAuthHeaders();
    fetchAvailableExams();
  }, []);
  
  const fetchAvailableExams = async () => {
    try {
      setLoading(true);
      
      if (!setAuthHeaders()) {
        if (!refreshAuth()) {
          setError('Authentication failed. Please log in again.');
          setLoading(false);
          return;
        }
      }
      
      // Get exams from student groups endpoint
      const response = await axios.get(`${API_URL}/api/groups/student`);
      console.log('Student groups response:', response.data);
      
      // Extract exams from groups
      const allExams: IExam[] = [];
      response.data.forEach((group: any) => {
        if (group.exams && group.exams.length > 0) {
          group.exams.forEach((exam: IExam) => {
            if (!allExams.some(e => e._id === exam._id)) {
              // Add isAvailable flag
              const now = new Date();
              const startTime = new Date(exam.startTime);
              const endTime = new Date(exam.endTime);
              const isAvailable = exam.isLive && startTime <= now && now <= endTime;
              
              allExams.push({
                ...exam,
                isAvailable,
                requiresPassword: true
              });
            }
          });
        }
      });
      
      console.log('Available exams:', allExams);
      setExams(allExams);
      setLoading(false);
    } catch (err: any) {
      console.error('Error fetching exams:', err);
      setError(err.response?.data?.message || 'Failed to fetch available exams');
      setLoading(false);
    }
  };
  
  const handleStartExam = (examId: string) => {
    navigate(`/student/exams/${examId}`);
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Alert severity="error" sx={{ my: 2 }}>
        {error}
      </Alert>
    );
  }
  
  return (
    <Box sx={{ py: 3 }}>
      <Typography variant="h5" gutterBottom>
        Available Exams
      </Typography>
      
      {exams.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            No exams are currently available for you.
          </Typography>
        </Paper>
      ) : (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {exams.map((exam) => {
            const startTime = new Date(exam.startTime);
            const endTime = new Date(exam.endTime);
            const now = new Date();
            const isActive = exam.isAvailable || (startTime <= now && now <= endTime && exam.isLive);
            const isFuture = startTime > now;
            
            return (
              <Box key={exam._id} sx={{ width: { xs: '100%', md: 'calc(50% - 16px)', lg: 'calc(33.33% - 16px)' } }}>
                <Card elevation={3}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="h6" noWrap>
                        {exam.title}
                      </Typography>
                      
                      <Chip 
                        label={isActive ? 'Available Now' : isFuture ? 'Upcoming' : 'Closed'} 
                        color={isActive ? 'success' : isFuture ? 'primary' : 'default'}
                        size="small"
                      />
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, height: 60, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {exam.description}
                    </Typography>
                    
                    <Divider sx={{ my: 1 }} />
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <EventIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {format(startTime, 'MMM dd, yyyy h:mm a')} - {format(endTime, 'h:mm a')}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <AccessTimeIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        Duration: {exam.duration} minutes
                      </Typography>
                    </Box>
                    
                    {exam.requiresPassword && (
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <LockIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          Requires password
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                  
                  <CardActions>
                    <Button 
                      fullWidth
                      variant="contained" 
                      color="primary"
                      disabled={!isActive}
                      onClick={() => handleStartExam(exam._id)}
                    >
                      {isActive ? 'Start Exam' : isFuture ? 'Not Available Yet' : 'Closed'}
                    </Button>
                  </CardActions>
                </Card>
              </Box>
            );
          })}
        </Box>
      )}
    </Box>
  );
};

export default AvailableExams;

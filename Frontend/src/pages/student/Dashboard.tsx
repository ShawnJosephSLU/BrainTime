import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../config/api';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Box, 
  CircularProgress, 
  Typography, 
  Grid, 
  Paper, 
  Button, 
  Chip, 
  Card, 
  CardContent, 
  CardActions, 
  Divider,
  Alert,
  AlertTitle,
  TextField,
  InputAdornment,
  IconButton
} from '@mui/material';
import SessionInfo from '../../components/common/SessionInfo';
import SchoolIcon from '@mui/icons-material/School';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AlarmIcon from '@mui/icons-material/Alarm';
import GroupIcon from '@mui/icons-material/Group';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import EventIcon from '@mui/icons-material/Event';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import SearchIcon from '@mui/icons-material/Search';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { format } from 'date-fns';

interface Group {
  _id: string;
  name: string;
  description: string;
  creatorId: {
    email: string;
  };
  exams: Exam[];
}

interface Exam {
  _id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  duration: number;
  isLive: boolean;
}

const StudentDashboard = () => {
  const { user, setAuthHeaders, refreshAuth } = useAuth();
  const navigate = useNavigate();
  const [enrolledGroups, setEnrolledGroups] = useState<Group[]>([]);
  const [availableExams, setAvailableExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [enrollmentSuccess, setEnrollmentSuccess] = useState<string | null>(null);
  const [enrollmentCode, setEnrollmentCode] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    refreshAuth();
    setAuthHeaders();
    fetchStudentData();
  }, []);

  const fetchStudentData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (!setAuthHeaders()) {
        if (!refreshAuth()) {
          setError('Authentication failed. Please log in again.');
          setLoading(false);
          return;
        }
      }
      
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      const response = await axios.get(`${API_URL}/api/groups/student`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Student groups response:', response.data);
      setEnrolledGroups(response.data);
      
      const allExams: Exam[] = [];
      response.data.forEach((group: Group) => {
        if (group.exams && group.exams.length > 0) {
          group.exams.forEach(exam => {
            if (!allExams.some(e => e._id === exam._id)) {
              allExams.push(exam);
            }
          });
        }
      });
      
      setAvailableExams(allExams);
    } catch (err: any) {
      console.error('Error fetching student data:', err);
      if (err.response) {
        console.error('Error response:', err.response.data);
        console.error('Error status:', err.response.status);
      }
      setError(err.response?.data?.message || 'Failed to fetch your groups and exams');
    } finally {
      setLoading(false);
    }
  };

  const handleEnrollment = async () => {
    if (!enrollmentCode.trim()) return;
    
    try {
      if (!setAuthHeaders()) {
        if (!refreshAuth()) {
          setError('Authentication failed. Please log in again.');
          return;
        }
      }
      
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      const response = await axios.post(
        `${API_URL}/api/groups/enroll`, 
        { enrollmentCode },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      setEnrollmentSuccess(`Successfully enrolled in group: ${response.data.groupName}`);
      setEnrollmentCode('');
      
      setTimeout(() => {
        setEnrollmentSuccess(null);
      }, 3000);
      
      fetchStudentData();
    } catch (err: any) {
      console.error('Error enrolling in group:', err);
      if (err.response) {
        console.error('Error response:', err.response.data);
        console.error('Error status:', err.response.status);
      }
      setError(err.response?.data?.message || 'Failed to enroll in group');
      
      setTimeout(() => {
        setError(null);
      }, 3000);
    }
  };

  const handleStartExam = (examId: string) => {
    navigate(`/student/exams/${examId}`);
  };

  const viewAllExams = () => {
    navigate('/student/exams');
  };

  // Check if an exam is active (current time is between start and end time)
  const isExamActive = (exam: Exam) => {
    const now = new Date();
    const startTime = new Date(exam.startTime);
    const endTime = new Date(exam.endTime);
    return now >= startTime && now <= endTime && exam.isLive;
  };

  // Check if an exam is upcoming
  const isExamUpcoming = (exam: Exam) => {
    const now = new Date();
    const startTime = new Date(exam.startTime);
    return now < startTime && exam.isLive;
  };

  // Filter exams based on search term
  const filteredExams = availableExams.filter(exam => 
    exam.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    exam.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get upcoming exams sorted by start time
  const upcomingExams = filteredExams
    .filter(exam => isExamUpcoming(exam))
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  // Get active exams
  const activeExams = filteredExams.filter(exam => isExamActive(exam));

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ py: 3, px: 4 }}>
      {/* Page Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Student Dashboard
        </Typography>
        <TextField
          size="small"
          placeholder="Search exams..."
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ width: '250px' }}
        />
      </Box>

      {/* Alerts */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <AlertTitle>Error</AlertTitle>
          {error}
        </Alert>
      )}
      
      {enrollmentSuccess && (
        <Alert severity="success" sx={{ mb: 3 }}>
          <AlertTitle>Success</AlertTitle>
          {enrollmentSuccess}
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid component="div" item xs={12} sm={6} md={3}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 2, 
              display: 'flex', 
              flexDirection: 'column', 
              height: 120, 
              borderRadius: '10px',
              border: '1px solid',
              borderColor: 'divider'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <GroupIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="body2" color="text.secondary">
                Enrolled Groups
              </Typography>
            </Box>
            <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', mt: 'auto' }}>
              {enrolledGroups.length}
            </Typography>
          </Paper>
        </Grid>
        <Grid component="div" item xs={12} sm={6} md={3}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 2, 
              display: 'flex', 
              flexDirection: 'column', 
              height: 120, 
              borderRadius: '10px',
              border: '1px solid',
              borderColor: 'divider'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <AssignmentIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="body2" color="text.secondary">
                Total Exams
              </Typography>
            </Box>
            <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', mt: 'auto' }}>
              {availableExams.length}
            </Typography>
          </Paper>
        </Grid>
        <Grid component="div" item xs={12} sm={6} md={3}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 2, 
              display: 'flex', 
              flexDirection: 'column', 
              height: 120, 
              borderRadius: '10px',
              border: '1px solid',
              borderColor: 'divider'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <AlarmIcon color="error" sx={{ mr: 1 }} />
              <Typography variant="body2" color="text.secondary">
                Active Exams
              </Typography>
            </Box>
            <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', mt: 'auto' }}>
              {activeExams.length}
            </Typography>
          </Paper>
        </Grid>
        <Grid component="div" item xs={12} sm={6} md={3}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 2, 
              display: 'flex', 
              flexDirection: 'column', 
              height: 120, 
              borderRadius: '10px',
              border: '1px solid',
              borderColor: 'divider'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <EventIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="body2" color="text.secondary">
                Upcoming Exams
              </Typography>
            </Box>
            <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', mt: 'auto' }}>
              {upcomingExams.length}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={4}>
        {/* Main Content */}
        <Grid component="div" item xs={12} md={8}>
          {/* Active Exams Section */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" component="h2" fontWeight="bold" sx={{ mb: 2 }}>
              Active Exams
            </Typography>
            
            {activeExams.length === 0 ? (
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 3, 
                  textAlign: 'center',
                  borderRadius: '10px',
                  border: '1px solid',
                  borderColor: 'divider'
                }}
              >
                <Typography color="text.secondary">
                  No active exams at the moment.
                </Typography>
              </Paper>
            ) : (
              <Grid container spacing={2}>
                {activeExams.map(exam => (
                  <Grid component="div" item xs={12} key={exam._id}>
                    <Card 
                      elevation={0} 
                      sx={{ 
                        position: 'relative',
                        borderRadius: '10px',
                        border: '1px solid',
                        borderColor: 'primary.main',
                        overflow: 'visible'
                      }}
                    >
                      <Box 
                        sx={{ 
                          position: 'absolute', 
                          top: -10, 
                          right: 16, 
                          bgcolor: 'success.main', 
                          color: 'white',
                          px: 1,
                          py: 0.5,
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: 'bold'
                        }}
                      >
                        Active
                      </Box>
                      <CardContent>
                        <Typography variant="h6" component="div" fontWeight="bold">
                          {exam.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {exam.description}
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <AccessTimeIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                              {exam.duration} minutes
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <EventIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                              Ends: {format(new Date(exam.endTime), 'MMM d, h:mm a')}
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                      <CardActions sx={{ p: 2, pt: 0 }}>
                        <Button 
                          variant="contained" 
                          color="primary" 
                          onClick={() => handleStartExam(exam._id)}
                          startIcon={<PlayArrowIcon />}
                          fullWidth
                        >
                          Start Exam
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>

          {/* Upcoming Exams Section */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h5" component="h2" fontWeight="bold">
                Upcoming Exams
              </Typography>
              <Button 
                color="primary" 
                onClick={viewAllExams}
                sx={{ textTransform: 'none' }}
              >
                View All
              </Button>
            </Box>
            
            {upcomingExams.length === 0 ? (
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 3, 
                  textAlign: 'center',
                  borderRadius: '10px',
                  border: '1px solid',
                  borderColor: 'divider'
                }}
              >
                <Typography color="text.secondary">
                  No upcoming exams scheduled.
                </Typography>
              </Paper>
            ) : (
              <Grid container spacing={2}>
                {upcomingExams.slice(0, 3).map(exam => (
                  <Grid component="div" item xs={12} md={6} key={exam._id}>
                    <Card 
                      elevation={0} 
                      sx={{ 
                        borderRadius: '10px',
                        border: '1px solid',
                        borderColor: 'divider',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column'
                      }}
                    >
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" component="div" fontWeight="bold">
                          {exam.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, maxHeight: '3em', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {exam.description}
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <EventIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                              {format(new Date(exam.startTime), 'MMM d, h:mm a')}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <AccessTimeIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                              {exam.duration} minutes
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        </Grid>

        {/* Sidebar */}
        <Grid component="div" item xs={12} md={4}>
          {/* Enrollment Section */}
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3, 
              mb: 3,
              borderRadius: '10px',
              border: '1px solid',
              borderColor: 'divider'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <HowToRegIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6" component="h2" fontWeight="bold">
                Enroll in a Group
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Enter the enrollment code provided by your instructor to join their group.
            </Typography>
            
            <TextField
              fullWidth
              placeholder="Enter enrollment code"
              variant="outlined"
              size="small"
              value={enrollmentCode}
              onChange={(e) => setEnrollmentCode(e.target.value)}
              sx={{ mb: 2 }}
            />
            
            <Button 
              variant="contained" 
              color="primary" 
              fullWidth
              onClick={handleEnrollment}
              disabled={!enrollmentCode.trim()}
            >
              Enroll
            </Button>
          </Paper>

          {/* Enrolled Groups Section */}
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3,
              borderRadius: '10px',
              border: '1px solid',
              borderColor: 'divider'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <SchoolIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6" component="h2" fontWeight="bold">
                My Groups
              </Typography>
            </Box>
            
            {enrolledGroups.length === 0 ? (
              <Typography color="text.secondary" variant="body2" sx={{ fontStyle: 'italic' }}>
                You are not enrolled in any groups yet. Use an enrollment code to join a group.
              </Typography>
            ) : (
              <Box>
                {enrolledGroups.map((group, index) => (
                  <Box key={group._id}>
                    {index > 0 && <Divider sx={{ my: 2 }} />}
                    <Typography variant="subtitle1" fontWeight="bold">
                      {group.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {group.description || 'No description provided'}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Instructor:
                      </Typography>
                      <Typography variant="body2">
                        {group.creatorId?.email || 'Unknown'}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      <AssignmentIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {group.exams?.length || 0} {group.exams?.length === 1 ? 'exam' : 'exams'}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default StudentDashboard;
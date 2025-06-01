import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../config/api';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  Divider,
  LinearProgress,
  Avatar,
  Stack
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import AssessmentIcon from '@mui/icons-material/Assessment';
import GroupIcon from '@mui/icons-material/Group';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import BarChartIcon from '@mui/icons-material/BarChart';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import SchoolIcon from '@mui/icons-material/School';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EventIcon from '@mui/icons-material/Event';
import PeopleIcon from '@mui/icons-material/People';
import { format } from 'date-fns';

interface DashboardStats {
  activeExams: number;
  studentEnrollments: number;
  completedExams: number;
}

interface ExamSummary {
  _id: string;
  title: string;
  isLive: boolean;
  studentCount: number;
  createdAt?: string;
  updatedAt?: string;
}

const StatCard: React.FC<{ 
  title: string; 
  value: string | number; 
  icon: React.ReactNode;
  color?: string;
  change?: number;
}> = ({ title, value, icon, color = 'primary.main', change }) => (
  <Paper 
    elevation={0} 
    sx={{ 
      p: 3, 
      borderRadius: '10px',
      border: '1px solid',
      borderColor: 'divider',
      height: '100%'
    }}
  >
    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
      <Typography variant="body2" color="text.secondary">
        {title}
      </Typography>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        width: 36, 
        height: 36, 
        borderRadius: '50%', 
        bgcolor: `${color}15` 
      }}>
        <Box sx={{ color }}>{icon}</Box>
      </Box>
    </Box>
    <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', mb: 0.5 }}>
      {value}
    </Typography>
    {change !== undefined && (
      <Box sx={{ 
        display: 'inline-flex', 
        alignItems: 'center',
        color: change >= 0 ? 'success.main' : 'error.main',
        fontSize: '0.875rem',
        fontWeight: 500
      }}>
        {change >= 0 ? '+' : ''}{change}%
      </Box>
    )}
  </Paper>
);

const CreatorDashboard = () => {
  const { setAuthHeaders, refreshAuth, user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    activeExams: 0,
    studentEnrollments: 0,
    completedExams: 0
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [recentExams, setRecentExams] = useState<ExamSummary[]>([]);

  useEffect(() => {
    refreshAuth();
    setAuthHeaders();
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      setAuthHeaders();
      const examResponse = await axios.get(`${API_URL}/api/quizzes/creator`);
      const examsData = examResponse.data;

      const activeExams = examsData.filter((exam: any) => exam.isLive).length;
      // TODO: Fetch real student enrollment and completed exam stats
      setStats({
        activeExams,
        studentEnrollments: examsData.reduce((sum: number, exam: any) => sum + (exam.studentCount || 0), 0), // Placeholder, assuming studentCount per exam
        completedExams: Math.floor(examsData.length * 0.8) // Placeholder
      });
      
      // Add some dummy timestamps for demonstration purposes
      const mappedExams = examsData.slice(0, 5).map((exam: any, index: number) => {
        const date = new Date();
        date.setDate(date.getDate() - index * 2); // Every exam is 2 days apart
        
        return { 
          _id: exam._id, 
          title: exam.title, 
          isLive: exam.isLive, 
          studentCount: exam.studentCount || 0,
          createdAt: date.toISOString()
        };
      });
      
      setRecentExams(mappedExams);
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      const errorMessage = err.response?.data?.message || 'Failed to fetch dashboard data';
      setError(errorMessage);
      if (err.response?.status === 401) {
        setError('Authentication error. Please try refreshing your login.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    const didRefresh = refreshAuth();
    if (didRefresh) {
      fetchDashboardData();
    } else {
      setError('Authentication failed. Please log in again.');
      setTimeout(() => {
        navigate('/signin?returnUrl=/creator/dashboard');
      }, 2000);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 120px)' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Calculate subscription usage
  const examLimit = 10; // This would come from the subscription plan
  const usagePercentage = Math.min(100, (stats.activeExams / examLimit) * 100);
  
  // Name initials for avatar
  const getInitials = (name: string) => {
    return name
      ?.split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2) || '?';
  };

  return (
    <Box sx={{ 
      py: 3, 
      px: 4, 
      width: '100%',
      maxWidth: '100%',
      minHeight: 'calc(100vh - 64px)', // Account for header height
      display: 'flex',
      flexDirection: 'column'
    }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
          Creator Dashboard
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => navigate('/creator/exams/create')}
          sx={{ borderRadius: '8px', textTransform: 'none' }}
        >
          Create New Exam
        </Button>
      </Box>

      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 4 }}
          action={<Button color="inherit" size="small" onClick={handleRetry}>Retry</Button>}
        >
          {error}
        </Alert>
      )}

      {/* Creator Summary Section */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          mb: 4, 
          borderRadius: '10px',
          border: '1px solid',
          borderColor: 'divider',
          width: '100%'
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { xs: 'flex-start', md: 'center' }, gap: 3 }}>
          <Avatar 
            sx={{ 
              width: 64, 
              height: 64, 
              bgcolor: 'primary.main',
              fontSize: '1.5rem',
              fontWeight: 'bold'
            }}
          >
            {getInitials(user?.name || user?.email || '')}
          </Avatar>
          
          <Box sx={{ flex: 1 }}>
            <Typography variant="h5" component="h2" sx={{ fontWeight: 600, mb: 0.5 }}>
              Welcome back, {user?.name || user?.email?.split('@')[0] || 'Creator'}!
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Here's an overview of your exam performance and activity
            </Typography>
          </Box>
          
          <Box sx={{ 
            px: 3, 
            py: 2, 
            bgcolor: 'primary.main', 
            color: 'primary.contrastText',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: 2
          }}>
            <Box>
              <Typography variant="body2" fontWeight="medium">
                Active Subscription
              </Typography>
              <Typography variant="body1" fontWeight="bold">
                Free Plan
              </Typography>
            </Box>
            <Button 
              variant="outlined" 
              size="small" 
              sx={{ 
                color: 'white', 
                borderColor: 'white',
                '&:hover': {
                  borderColor: 'white',
                  bgcolor: 'rgba(255,255,255,0.1)'
                }
              }}
              onClick={() => navigate('/creator/subscription/plans')}
            >
              Upgrade
            </Button>
          </Box>
        </Box>
        
        <Divider sx={{ my: 3 }} />
        
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Exam Usage ({stats.activeExams}/{examLimit} active exams)
            </Typography>
            <Typography variant="body2" fontWeight="medium">
              {usagePercentage.toFixed(0)}%
            </Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={usagePercentage} 
            sx={{ 
              height: 8, 
              borderRadius: 4,
              bgcolor: 'divider',
              '& .MuiLinearProgress-bar': {
                bgcolor: usagePercentage > 80 ? 'error.main' : 'success.main'
              }
            }} 
          />
        </Box>
      </Paper>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4, width: '100%' }}>
        <Grid component="div" size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard 
            title="Active Exams" 
            value={stats.activeExams} 
            icon={<AssessmentIcon />} 
            color="primary.main"
            change={8}
          />
        </Grid>
        <Grid component="div" size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard 
            title="Student Enrollments" 
            value={stats.studentEnrollments} 
            icon={<GroupIcon />} 
            color="success.main"
            change={15}
          />
        </Grid>
        <Grid component="div" size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard 
            title="Completed Exams" 
            value={stats.completedExams} 
            icon={<CheckCircleOutlineIcon />} 
            color="info.main"
            change={5}
          />
        </Grid>
        <Grid component="div" size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard 
            title="Total Groups" 
            value={3} 
            icon={<SchoolIcon />} 
            color="warning.main"
            change={0}
          />
        </Grid>
      </Grid>

      {/* Recent Exams */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          borderRadius: '10px',
          border: '1px solid',
          borderColor: 'divider',
          width: '100%'
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
            Recent Exams
          </Typography>
          <Button 
            variant="outlined"
            size="small"
            onClick={() => navigate('/creator/exams')}
            endIcon={<BarChartIcon />}
            sx={{ borderRadius: '8px', textTransform: 'none' }}
          >
            View All Exams
          </Button>
        </Box>
        
        {recentExams.length === 0 && !loading && (
          <Box sx={{ textAlign: 'center', py: 5 }}>
            <MenuBookIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
              No exams created yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Start by creating your first exam to engage your students
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => navigate('/creator/exams/create')}
              sx={{ borderRadius: '8px', textTransform: 'none' }}
            >
              Create New Exam
            </Button>
          </Box>
        )}

        {recentExams.length > 0 && (
          <Grid container spacing={3} sx={{ width: '100%' }}>
            {recentExams.map((exam) => (
              <Grid component="div" size={{ xs: 12 }} key={exam._id}>
                <Card 
                  elevation={0} 
                  sx={{ 
                    borderRadius: '10px',
                    border: '1px solid',
                    borderColor: 'divider',
                    '&:hover': { 
                      borderColor: 'primary.main',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                    },
                    transition: 'all 0.2s ease-in-out'
                  }}
                >
                  <CardContent sx={{ p: 0 }}>
                    <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Typography variant="h6" component="div" fontWeight="bold">
                            {exam.title}
                          </Typography>
                          <Chip 
                            label={exam.isLive ? 'Live' : 'Draft'} 
                            color={exam.isLive ? 'success' : 'default'} 
                            size="small"
                            sx={{ fontWeight: 500 }}
                          />
                        </Box>
                        
                        <Stack direction="row" spacing={3}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <PeopleIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                              {exam.studentCount} students
                            </Typography>
                          </Box>
                          
                          {exam.createdAt && (
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <EventIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                              <Typography variant="body2" color="text.secondary">
                                Created {format(new Date(exam.createdAt), 'MMM d, yyyy')}
                              </Typography>
                            </Box>
                          )}
                        </Stack>
                      </Box>
                      
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<VisibilityIcon />}
                          onClick={() => navigate(`/creator/exams/${exam._id}`)}
                          sx={{ borderRadius: '8px', textTransform: 'none' }}
                        >
                          View
                        </Button>
                        
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<EditIcon />}
                          onClick={() => navigate(`/creator/exams/edit/${exam._id}`)}
                          sx={{ borderRadius: '8px', textTransform: 'none' }}
                        >
                          Edit
                        </Button>
                      </Box>
                    </Box>
                    
                    {exam.isLive && (
                      <Box sx={{ 
                        borderTop: '1px solid',
                        borderColor: 'divider',
                        p: 1.5,
                        bgcolor: 'success.main',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <AccessTimeIcon fontSize="small" sx={{ mr: 1 }} />
                          <Typography variant="body2" fontWeight="medium">
                            Exam is live and available to students
                          </Typography>
                        </Box>
                        
                        <Button
                          variant="contained"
                          size="small"
                          color="inherit"
                          sx={{ 
                            bgcolor: 'white', 
                            color: 'success.main',
                            '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' },
                            borderRadius: '8px',
                            textTransform: 'none'
                          }}
                          onClick={() => navigate(`/creator/exams/${exam._id}/submissions`)}
                        >
                          View Submissions
                        </Button>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>
    </Box>
  );
};

export default CreatorDashboard; 
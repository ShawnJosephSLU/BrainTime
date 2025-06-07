import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../config/api';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,

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
  Stack,
  Container,
  Fade,
  Grow
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
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
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
  color?: 'primary' | 'success' | 'warning' | 'error' | 'info';
  change?: number;
  delay?: number;
}> = ({ title, value, icon, color = 'primary', change, delay = 0 }) => (
  <Grow in={true} timeout={800} style={{ transitionDelay: `${delay}ms` }}>
    <Card 
      elevation={0}
      sx={{ 
        height: '100%',
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 3,
          borderColor: `${color}.main`,
        }
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ 
            p: 1.5,
            borderRadius: 2,
            bgcolor: `${color}.50`,
            color: `${color}.600`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {icon}
          </Box>
          {change !== undefined && (
            <Chip
              icon={change >= 0 ? <TrendingUpIcon fontSize="small" /> : <TrendingDownIcon fontSize="small" />}
              label={`${change >= 0 ? '+' : ''}${change}%`}
              size="small"
              color={change >= 0 ? 'success' : 'error'}
              variant="filled"
            />
          )}
        </Box>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
          {title}
        </Typography>
        
        <Typography variant="h3" component="div" sx={{ fontWeight: 700, color: 'text.primary' }}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  </Grow>
);

const WelcomeCard: React.FC<{ user: any; stats: DashboardStats }> = ({ user, stats }) => {
  const navigate = useNavigate();
  const examLimit = 10;
  const usagePercentage = Math.min(100, (stats.activeExams / examLimit) * 100);
  
  const getInitials = (name: string) => {
    return name
      ?.split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2) || '?';
  };

  return (
    <Fade in={true} timeout={600}>
      <Card 
        elevation={0}
        sx={{ 
          mb: 3,
          borderRadius: 3,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        <Box sx={{ 
          position: 'absolute',
          top: 0,
          right: 0,
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.1)',
          transform: 'translate(50%, -50%)'
        }} />
        
        <CardContent sx={{ p: 4, position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { xs: 'flex-start', md: 'center' }, gap: 3 }}>
            <Avatar 
              sx={{ 
                width: 72, 
                height: 72, 
                bgcolor: 'rgba(255,255,255,0.2)',
                fontSize: '1.75rem',
                fontWeight: 'bold',
                border: '3px solid rgba(255,255,255,0.3)'
              }}
            >
              {getInitials(user?.name || user?.email || '')}
            </Avatar>
            
            <Box sx={{ flex: 1 }}>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
                Welcome back, {user?.name || user?.email?.split('@')[0] || 'Creator'}!
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9, mb: 2 }}>
                Here's an overview of your exam performance and activity
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
                <Chip 
                  label="Free Plan" 
                  sx={{ 
                    bgcolor: 'rgba(255,255,255,0.2)', 
                    color: 'white',
                    fontWeight: 600
                  }} 
                />
                <Button 
                  variant="contained" 
                  size="small"
                  sx={{ 
                    bgcolor: 'rgba(255,255,255,0.2)', 
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
                    borderRadius: 2
                  }}
                  onClick={() => navigate('/creator/subscription/plans')}
                >
                  Upgrade
                </Button>
              </Box>
            </Box>
          </Box>
          
          <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.2)' }} />
          
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                Exam Usage ({stats.activeExams}/{examLimit} active exams)
              </Typography>
              <Typography variant="h6" fontWeight="bold">
                {usagePercentage.toFixed(0)}%
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={usagePercentage} 
              sx={{ 
                height: 8, 
                borderRadius: 4,
                bgcolor: 'rgba(255,255,255,0.2)',
                '& .MuiLinearProgress-bar': {
                  bgcolor: usagePercentage > 80 ? '#f87171' : '#4ade80',
                  borderRadius: 4
                }
              }} 
            />
          </Box>
        </CardContent>
      </Card>
    </Fade>
  );
};

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
      setStats({
        activeExams,
        studentEnrollments: examsData.reduce((sum: number, exam: any) => sum + (exam.studentCount || 0), 0),
        completedExams: Math.floor(examsData.length * 0.8)
      });
      
      const mappedExams = examsData.slice(0, 5).map((exam: any, index: number) => {
        const date = new Date();
        date.setDate(date.getDate() - index * 2);
        
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
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={48} />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h3" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
            Creator Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Track your exam performance and manage your assessments
          </Typography>
        </Box>
        <Button
          variant="contained"
          size="large"
          startIcon={<AddIcon />}
          onClick={() => navigate('/creator/exams/create')}
          sx={{ 
            borderRadius: 3,
            px: 3,
            py: 1.5,
            boxShadow: 2,
            '&:hover': { boxShadow: 4 }
          }}
        >
          Create New Exam
        </Button>
      </Box>

      {error && (
        <Fade in={true}>
          <Alert 
            severity="error" 
            sx={{ mb: 3, borderRadius: 3 }}
            action={<Button color="inherit" size="small" onClick={handleRetry}>Retry</Button>}
          >
            {error}
          </Alert>
        </Fade>
      )}

      {/* Welcome Card */}
      <WelcomeCard user={user} stats={stats} />

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard 
            title="Active Exams" 
            value={stats.activeExams} 
            icon={<AssessmentIcon />} 
            color="primary"
            change={8}
            delay={0}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard 
            title="Student Enrollments" 
            value={stats.studentEnrollments} 
            icon={<GroupIcon />} 
            color="success"
            change={15}
            delay={100}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard 
            title="Completed Exams" 
            value={stats.completedExams} 
            icon={<CheckCircleOutlineIcon />} 
            color="info"
            change={5}
            delay={200}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard 
            title="Total Groups" 
            value={3} 
            icon={<SchoolIcon />} 
            color="warning"
            change={0}
            delay={300}
          />
        </Grid>
      </Grid>

      {/* Recent Exams */}
      <Fade in={true} timeout={800} style={{ transitionDelay: '400ms' }}>
        <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
                Recent Exams
              </Typography>
              <Button 
                variant="outlined"
                endIcon={<BarChartIcon />}
                onClick={() => navigate('/creator/exams')}
                sx={{ borderRadius: 2 }}
              >
                View All Exams
              </Button>
            </Box>
            
            {recentExams.length === 0 && !loading && (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <MenuBookIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                  No exams created yet
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 400, mx: 'auto' }}>
                  Start by creating your first exam to engage your students and track their progress
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<AddIcon />}
                  onClick={() => navigate('/creator/exams/create')}
                  sx={{ borderRadius: 3, px: 4 }}
                >
                  Create Your First Exam
                </Button>
              </Box>
            )}

            {recentExams.length > 0 && (
              <Stack spacing={2}>
                {recentExams.map((exam, index) => (
                  <Grow key={exam._id} in={true} timeout={600} style={{ transitionDelay: `${500 + index * 100}ms` }}>
                    <Card 
                      elevation={0} 
                      sx={{ 
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 2,
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': { 
                          borderColor: 'primary.main',
                          boxShadow: 2,
                          transform: 'translateX(4px)'
                        }
                      }}
                    >
                      <CardContent sx={{ p: 0 }}>
                        <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Box sx={{ flex: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                              <Typography variant="h6" component="div" fontWeight="bold">
                                {exam.title}
                              </Typography>
                              <Chip 
                                label={exam.isLive ? 'Live' : 'Draft'} 
                                color={exam.isLive ? 'success' : 'default'} 
                                size="small"
                                variant={exam.isLive ? 'filled' : 'outlined'}
                              />
                            </Box>
                            
                            <Stack direction="row" spacing={4} sx={{ color: 'text.secondary' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <PeopleIcon fontSize="small" />
                                <Typography variant="body2">
                                  {exam.studentCount} students
                                </Typography>
                              </Box>
                              
                              {exam.createdAt && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <EventIcon fontSize="small" />
                                  <Typography variant="body2">
                                    Created {format(new Date(exam.createdAt), 'MMM d, yyyy')}
                                  </Typography>
                                </Box>
                              )}
                            </Stack>
                          </Box>
                          
                          <Stack direction="row" spacing={1}>
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<VisibilityIcon />}
                              onClick={() => navigate(`/creator/exams/${exam._id}`)}
                              sx={{ borderRadius: 2 }}
                            >
                              View
                            </Button>
                            
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<EditIcon />}
                              onClick={() => navigate(`/creator/exams/edit/${exam._id}`)}
                              sx={{ borderRadius: 2 }}
                            >
                              Edit
                            </Button>
                          </Stack>
                        </Box>
                        
                        {exam.isLive && (
                          <Box sx={{ 
                            borderTop: '1px solid',
                            borderColor: 'divider',
                            p: 2,
                            bgcolor: 'success.50',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                          }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'success.700' }}>
                              <AccessTimeIcon fontSize="small" />
                              <Typography variant="body2" fontWeight="medium">
                                Exam is live and available to students
                              </Typography>
                            </Box>
                            
                            <Button
                              variant="contained"
                              size="small"
                              color="success"
                              sx={{ borderRadius: 2 }}
                              onClick={() => navigate(`/creator/exams/${exam._id}/submissions`)}
                            >
                              View Submissions
                            </Button>
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  </Grow>
                ))}
              </Stack>
            )}
          </CardContent>
        </Card>
      </Fade>
    </Container>
  );
};

export default CreatorDashboard; 
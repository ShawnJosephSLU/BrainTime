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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import AssessmentIcon from '@mui/icons-material/Assessment';
import GroupIcon from '@mui/icons-material/Group';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import BarChartIcon from '@mui/icons-material/BarChart';

interface DashboardStats {
  activeExams: number;
  studentEnrollments: number;
  completedExams: number;
}

interface ExamSummary {
  _id: string;
  title: string;
  isLive: boolean;
  studentCount: number; // Assuming this will be available
}

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode }> = ({ title, value, icon }) => (
  <Card sx={{ display: 'flex', alignItems: 'center', p: 2, height: '100%' }}>
    <Box sx={{ mr: 2, color: 'var(--primary-color)' }}>{icon}</Box>
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{value}</Typography>
      <Typography variant="body2" color="text.secondary">{title}</Typography>
    </Box>
  </Card>
);

const CreatorDashboard = () => {
  const { setAuthHeaders, refreshAuth } = useAuth();
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
      setRecentExams(examsData.slice(0, 5).map((exam: any) => ({ 
        _id: exam._id, 
        title: exam.title, 
        isLive: exam.isLive, 
        studentCount: exam.studentCount || 0 // Placeholder
      })));
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

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
          Creator Dashboard
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => navigate('/creator/exams/create')}
        >
          Create New Exam
        </Button>
      </Box>

      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          action={<Button color="inherit" size="small" onClick={handleRetry}>Retry</Button>}
        >
          {error}
        </Alert>
      )}

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard title="Active Exams" value={stats.activeExams} icon={<AssessmentIcon fontSize="large" />} />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard title="Student Enrollments" value={stats.studentEnrollments} icon={<GroupIcon fontSize="large" />} />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard title="Completed Exams" value={stats.completedExams} icon={<CheckCircleOutlineIcon fontSize="large" />} />
        </Grid>
      </Grid>

      <Paper elevation={0} sx={{ p: 3, border: '1px solid var(--border-color)', borderRadius: '0.5rem' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
            Recent Exams
          </Typography>
          <Button 
            variant="text"
            size="small"
            onClick={() => navigate('/creator/exams')}
            endIcon={<BarChartIcon />}
          >
            View All Exams
          </Button>
        </Box>
        
        {recentExams.length === 0 && !loading && (
          <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
            No exams created yet. Click "Create New Exam" to get started.
          </Typography>
        )}

        {recentExams.length > 0 && (
          <TableContainer>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
              <TableHead sx={{ backgroundColor: 'var(--surface-color)' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Title</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>Students</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recentExams.map((exam) => (
                  <TableRow
                    key={exam._id}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 }, '&:hover': { backgroundColor: 'var(--surface-color)' } }}
                  >
                    <TableCell component="th" scope="row">
                      {exam.title}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={exam.isLive ? 'Live' : 'Draft'} 
                        color={exam.isLive ? 'success' : 'default'} 
                        size="small"
                        sx={{ fontWeight: 500 }}
                      />
                    </TableCell>
                    <TableCell align="right">{exam.studentCount}</TableCell>
                    <TableCell align="right">
                      <Tooltip title="View Exam">
                        <IconButton size="small" onClick={() => navigate(`/creator/exams/${exam._id}`)}>
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit Exam">
                        <IconButton size="small" onClick={() => navigate(`/creator/exams/edit/${exam._id}`)} sx={{ ml: 1 }}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="View Submissions">
                        <IconButton size="small" onClick={() => navigate(`/creator/exams/${exam._id}/submissions`)} sx={{ ml: 1 }}>
                          <AssessmentIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Box>
  );
};

export default CreatorDashboard; 
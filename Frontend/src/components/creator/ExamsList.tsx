import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../config/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Box, 
  Button, 
  Typography, 
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  CardActions,

  Divider,
  Stack,
  Avatar,
  Tooltip,
  Container,
  Fade,
  Zoom
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import RefreshIcon from '@mui/icons-material/Refresh';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import { format, isAfter, isBefore } from 'date-fns';

interface IExam {
  _id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  duration: number;
  isLive: boolean;
}

const ExamsList: React.FC = () => {
  const navigate = useNavigate();
  const { setAuthHeaders, refreshAuth } = useAuth();
  const [exams, setExams] = useState<IExam[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [examToDelete, setExamToDelete] = useState<string | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState<string>('');
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  
  // Toggle live status dialog state
  const [toggleLiveDialogOpen, setToggleLiveDialogOpen] = useState<boolean>(false);
  const [examToToggle, setExamToToggle] = useState<IExam | null>(null);
  const [isTogglingLive, setIsTogglingLive] = useState<boolean>(false);

  useEffect(() => {
    // Ensure auth headers are set before fetching data
    refreshAuth();
    setAuthHeaders();
    fetchExams();
  }, []);

  const fetchExams = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Ensure auth headers are set
      setAuthHeaders();
      
      const response = await axios.get(`${API_URL}/api/quizzes/creator`);
      setExams(response.data);
    } catch (err: any) {
      console.error('Error fetching exams:', err);
      const errorMessage = err.response?.data?.message || 'Failed to fetch exams';
      setError(errorMessage);
      
      // If error mentions authentication, trigger a refresh
      if (
        errorMessage.includes('token') || 
        errorMessage.includes('auth') || 
        errorMessage.includes('access') ||
        err.response?.status === 401
      ) {
        setError(`${errorMessage} - Try refreshing your login.`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    // Try refreshing the auth state and fetch again
    const didRefresh = refreshAuth();
    setAuthHeaders();
    
    if (didRefresh) {
      fetchExams();
    } else {
      setError('Authentication failed. Please log in again.');
      setTimeout(() => {
        navigate('/signin?returnUrl=/creator/exams');
      }, 2000);
    }
  };

  const handleCreateExam = () => {
    navigate('/creator/exams/create');
  };

  const handleEditExam = (examId: string) => {
    navigate(`/creator/exams/edit/${examId}`);
  };

  const handleViewExam = (examId: string) => {
    // Ensure auth headers are set before navigation
    setAuthHeaders();
    navigate(`/creator/exams/${examId}`);
  };

  const openDeleteDialog = (examId: string) => {
    setExamToDelete(examId);
    setDeleteConfirmText('');
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setExamToDelete(null);
  };

  const confirmDelete = async () => {
    if (!examToDelete) return;
    
    setIsDeleting(true);
    setError(null);
    
    try {
      // Ensure auth headers are set
      setAuthHeaders();
      
      await axios.delete(`${API_URL}/api/quizzes/${examToDelete}`);
      setSuccess('Exam deleted successfully');
      fetchExams();
      closeDeleteDialog();
    } catch (err: any) {
      console.error('Error deleting exam:', err);
      setError(err.response?.data?.message || 'Failed to delete exam');
    } finally {
      setIsDeleting(false);
    }
  };

  const openToggleLiveDialog = (exam: IExam) => {
    setExamToToggle(exam);
    setToggleLiveDialogOpen(true);
  };

  const closeToggleLiveDialog = () => {
    setToggleLiveDialogOpen(false);
    setExamToToggle(null);
  };

  const confirmToggleLive = async () => {
    if (!examToToggle) return;
    
    setIsTogglingLive(true);
    setError(null);
    
    try {
      // Ensure auth headers are set
      setAuthHeaders();
      
      const newStatus = !examToToggle.isLive;
      await axios.patch(`${API_URL}/api/quizzes/${examToToggle._id}/toggle-live`, {
        isLive: newStatus
      });
      
      setSuccess(`Exam is now ${newStatus ? 'live' : 'offline'}`);
      fetchExams();
      closeToggleLiveDialog();
    } catch (err: any) {
      console.error('Error toggling exam status:', err);
      setError(err.response?.data?.message || 'Failed to update exam status');
    } finally {
      setIsTogglingLive(false);
    }
  };

  const getExamStatus = (exam: IExam) => {
    const now = new Date();
    const startTime = new Date(exam.startTime);
    const endTime = new Date(exam.endTime);

    if (!exam.isLive) {
      return { label: 'Offline', color: 'default' as const, icon: <StopIcon /> };
    }
    
    if (isBefore(now, startTime)) {
      return { label: 'Scheduled', color: 'info' as const, icon: <CalendarTodayIcon /> };
    }
    
    if (isAfter(now, endTime)) {
      return { label: 'Ended', color: 'error' as const, icon: <StopIcon /> };
    }
    
    return { label: 'Live', color: 'success' as const, icon: <PlayArrowIcon /> };
  };

  const EmptyState = () => (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 8,
        px: 3,
        textAlign: 'center'
      }}
    >
      <Box
        sx={{
          width: 120,
          height: 120,
          borderRadius: '50%',
          backgroundColor: 'primary.50',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 3
        }}
      >
        <AddIcon sx={{ fontSize: 48, color: 'primary.main' }} />
      </Box>
      
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Create Your First Exam
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 400 }}>
        Start building engaging exams for your students. Add questions, set schedules, and track performance all in one place.
      </Typography>
      
      <Button
        variant="contained"
        size="large"
        startIcon={<AddIcon />}
        onClick={handleCreateExam}
        sx={{ 
          borderRadius: 3,
          px: 4,
          py: 1.5,
          fontWeight: 600,
          boxShadow: 2,
          '&:hover': { boxShadow: 4 }
        }}
      >
        Create Your First Exam
      </Button>
    </Box>
  );

  const ExamCard = ({ exam, index }: { exam: IExam; index: number }) => {
    const status = getExamStatus(exam);

    return (
      <Zoom in={true} style={{ transitionDelay: `${index * 100}ms` }}>
        <Card
          sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: 4,
              borderColor: 'primary.300'
            }
          }}
        >
          <CardContent sx={{ flexGrow: 1, p: 3 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Box sx={{ flexGrow: 1, mr: 2 }}>
                <Typography 
                  variant="h6" 
                  fontWeight="bold" 
                  gutterBottom
                  sx={{ 
                    lineHeight: 1.3,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical'
                  }}
                >
                  {exam.title}
                </Typography>
                
                <Chip
                  icon={status.icon}
                  label={status.label}
                  color={status.color}
                  size="small"
                  sx={{ fontWeight: 500 }}
                />
              </Box>
              
              <Avatar
                sx={{
                  width: 48,
                  height: 48,
                  bgcolor: status.color === 'success' ? 'success.100' : 'grey.100',
                  color: status.color === 'success' ? 'success.600' : 'grey.600'
                }}
              >
                {status.icon}
              </Avatar>
            </Box>

            {/* Description */}
            {exam.description && (
              <Typography 
                variant="body2" 
                color="text.secondary" 
                sx={{ 
                  mb: 3,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical'
                }}
              >
                {exam.description}
              </Typography>
            )}

            <Divider sx={{ my: 2 }} />

            {/* Details */}
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CalendarTodayIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  <strong>Start:</strong> {format(new Date(exam.startTime), 'MMM dd, yyyy')}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CalendarTodayIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  <strong>End:</strong> {format(new Date(exam.endTime), 'MMM dd, yyyy')}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AccessTimeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  <strong>Duration:</strong> {exam.duration} minutes
                </Typography>
              </Box>
            </Stack>
          </CardContent>

          <Divider />

          <CardActions sx={{ p: 2, pt: 1.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
              <Stack direction="row" spacing={0.5}>
                <Tooltip title="View Details">
                  <IconButton
                    size="small"
                    onClick={() => handleViewExam(exam._id)}
                    sx={{ 
                      color: 'primary.main',
                      '&:hover': { bgcolor: 'primary.50' }
                    }}
                  >
                    <VisibilityIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="Edit Exam">
                  <IconButton
                    size="small"
                    onClick={() => handleEditExam(exam._id)}
                    sx={{ 
                      color: 'text.secondary',
                      '&:hover': { bgcolor: 'action.hover' }
                    }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                
                <Tooltip title={exam.isLive ? 'Take Offline' : 'Make Live'}>
                  <IconButton
                    size="small"
                    onClick={() => openToggleLiveDialog(exam)}
                    sx={{ 
                      color: exam.isLive ? 'error.main' : 'success.main',
                      '&:hover': { 
                        bgcolor: exam.isLive ? 'error.50' : 'success.50'
                      }
                    }}
                  >
                    {exam.isLive ? <LockIcon fontSize="small" /> : <LockOpenIcon fontSize="small" />}
                  </IconButton>
                </Tooltip>
              </Stack>
              
              <Tooltip title="Delete Exam">
                <IconButton
                  size="small"
                  onClick={() => openDeleteDialog(exam._id)}
                  sx={{ 
                    color: 'error.main',
                    '&:hover': { bgcolor: 'error.50' }
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </CardActions>
        </Card>
      </Zoom>
    );
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h3" fontWeight="bold" gutterBottom>
            My Exams
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage and monitor your exam collection
          </Typography>
        </Box>
        
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRetry}
            sx={{ 
              borderRadius: 2,
              px: 3,
              fontWeight: 500
            }}
          >
            Refresh
          </Button>
          
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateExam}
            sx={{ 
              borderRadius: 2,
              px: 3,
              fontWeight: 600,
              boxShadow: 2,
              '&:hover': { boxShadow: 4 }
            }}
          >
            Create New Exam
          </Button>
        </Stack>
      </Box>
      
      {/* Alerts */}
      <Fade in={Boolean(error)} timeout={300}>
        <Box>
          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 3,
                borderRadius: 2,
                '& .MuiAlert-message': { fontWeight: 500 }
              }}
              onClose={() => setError(null)}
            >
              {error}
            </Alert>
          )}
        </Box>
      </Fade>
      
      <Fade in={Boolean(success)} timeout={300}>
        <Box>
          {success && (
            <Alert 
              severity="success" 
              sx={{ 
                mb: 3,
                borderRadius: 2,
                '& .MuiAlert-message': { fontWeight: 500 }
              }}
              onClose={() => setSuccess(null)}
            >
              {success}
            </Alert>
          )}
        </Box>
      </Fade>
      
      {/* Loading State */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
          <CircularProgress size={48} />
        </Box>
      ) : exams.length === 0 ? (
        <EmptyState />
      ) : (
                 /* Exams Grid */
         <Box
           sx={{
             display: 'grid',
             gridTemplateColumns: {
               xs: '1fr',
               sm: 'repeat(2, 1fr)',
               lg: 'repeat(3, 1fr)'
             },
             gap: 3
           }}
         >
           {exams.map((exam, index) => (
             <ExamCard key={exam._id} exam={exam} index={index} />
           ))}
         </Box>
      )}
      
      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={deleteDialogOpen} 
        onClose={closeDeleteDialog}
        PaperProps={{
          sx: { 
            borderRadius: 3,
            minWidth: 400
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h6" fontWeight="bold">
            Delete Exam
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
            This action cannot be undone. All student responses will also be deleted.
          </Alert>
          
          <Typography variant="body1" gutterBottom>
            Type <strong>"DELETE"</strong> to confirm:
          </Typography>
          <TextField
            fullWidth
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
            variant="outlined"
            margin="normal"
            placeholder="Type DELETE to confirm"
            sx={{ 
              '& .MuiOutlinedInput-root': {
                borderRadius: 2
              }
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button 
            onClick={closeDeleteDialog} 
            disabled={isDeleting}
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button
            onClick={confirmDelete}
            color="error"
            variant="contained"
            disabled={deleteConfirmText !== 'DELETE' || isDeleting}
            sx={{ borderRadius: 2, minWidth: 100 }}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Toggle Live Status Dialog */}
      <Dialog 
        open={toggleLiveDialogOpen} 
        onClose={closeToggleLiveDialog}
        PaperProps={{
          sx: { 
            borderRadius: 3,
            minWidth: 400
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h6" fontWeight="bold">
            {examToToggle?.isLive ? 'Take Exam Offline' : 'Make Exam Live'}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            {examToToggle?.isLive
              ? 'This will prevent students from accessing the exam.'
              : 'This will allow students to access the exam with the provided password during the scheduled time period.'}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button 
            onClick={closeToggleLiveDialog} 
            disabled={isTogglingLive}
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button
            onClick={confirmToggleLive}
            color={examToToggle?.isLive ? 'error' : 'primary'}
            variant="contained"
            disabled={isTogglingLive}
            sx={{ borderRadius: 2, minWidth: 120 }}
          >
            {isTogglingLive
              ? 'Updating...'
              : examToToggle?.isLive
              ? 'Take Offline'
              : 'Make Live'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ExamsList;

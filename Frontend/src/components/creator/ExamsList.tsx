import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../config/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Box, 
  Button, 
  Paper, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import RefreshIcon from '@mui/icons-material/Refresh';
import { format } from 'date-fns';

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

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Exams
        </Typography>
        
        <Box>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<RefreshIcon />}
            onClick={handleRetry}
            sx={{ mr: 2 }}
          >
            Refresh Data
          </Button>
          
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleCreateExam}
          >
            Create New Exam
          </Button>
        </Box>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : exams.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            No exams created yet
          </Typography>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            Get started by creating your first exam
          </Typography>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handleCreateExam}
            sx={{ mt: 2 }}
          >
            Create Exam
          </Button>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Start Time</TableCell>
                <TableCell>End Time</TableCell>
                <TableCell>Duration</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {exams.map((exam) => (
                <TableRow key={exam._id}>
                  <TableCell>{exam.title}</TableCell>
                  <TableCell>
                    <Chip 
                      label={exam.isLive ? 'Live' : 'Offline'} 
                      color={exam.isLive ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{format(new Date(exam.startTime), 'MMM dd, yyyy h:mm a')}</TableCell>
                  <TableCell>{format(new Date(exam.endTime), 'MMM dd, yyyy h:mm a')}</TableCell>
                  <TableCell>{exam.duration} minutes</TableCell>
                  <TableCell align="right">
                    <IconButton
                      color="primary"
                      onClick={() => handleViewExam(exam._id)}
                      title="View Exam"
                    >
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton
                      color="primary"
                      onClick={() => handleEditExam(exam._id)}
                      title="Edit Exam"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color={exam.isLive ? 'error' : 'success'}
                      onClick={() => openToggleLiveDialog(exam)}
                      title={exam.isLive ? 'Take Offline' : 'Make Live'}
                    >
                      {exam.isLive ? <LockIcon /> : <LockOpenIcon />}
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => openDeleteDialog(exam._id)}
                      title="Delete Exam"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={closeDeleteDialog}>
        <DialogTitle>Delete Exam</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            This action cannot be undone. All student responses will also be deleted.
          </Typography>
          <Typography variant="body1" gutterBottom>
            Type "DELETE" to confirm:
          </Typography>
          <TextField
            fullWidth
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
            variant="outlined"
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            onClick={confirmDelete}
            color="error"
            disabled={deleteConfirmText !== 'DELETE' || isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Toggle Live Status Dialog */}
      <Dialog open={toggleLiveDialogOpen} onClose={closeToggleLiveDialog}>
        <DialogTitle>
          {examToToggle?.isLive ? 'Take Exam Offline' : 'Make Exam Live'}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            {examToToggle?.isLive
              ? 'This will prevent students from accessing the exam.'
              : 'This will allow students to access the exam with the provided password during the scheduled time period.'}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeToggleLiveDialog} disabled={isTogglingLive}>
            Cancel
          </Button>
          <Button
            onClick={confirmToggleLive}
            color={examToToggle?.isLive ? 'error' : 'primary'}
            disabled={isTogglingLive}
          >
            {isTogglingLive
              ? 'Updating...'
              : examToToggle?.isLive
              ? 'Take Offline'
              : 'Make Live'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ExamsList;

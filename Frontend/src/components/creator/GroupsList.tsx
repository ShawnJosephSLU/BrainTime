import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../config/api';
import { useAuth } from '../../contexts/AuthContext';
import {
  Box,
  Button,
  Typography,
  Paper,
  Card,
  CardContent,
  CardActions,
  Divider,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Alert,
  CircularProgress,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import BookIcon from '@mui/icons-material/Book';
import PersonIcon from '@mui/icons-material/Person';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import PublicIcon from '@mui/icons-material/Public';
import LockIcon from '@mui/icons-material/Lock';

interface IGroup {
  _id: string;
  name: string;
  description: string;
  creatorId: string;
  enrollmentCode: string;
  students: any[];
  exams: any[];
  isPublic: boolean;
  password?: string;
  createdAt: string;
}

interface IExam {
  _id: string;
  title: string;
  description: string;
  isLive: boolean;
}

const GroupsList: React.FC = () => {
  const { setAuthHeaders, refreshAuth } = useAuth();
  const [groups, setGroups] = useState<IGroup[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [availableExams, setAvailableExams] = useState<IExam[]>([]);
  
  // Create group dialog
  const [createDialogOpen, setCreateDialogOpen] = useState<boolean>(false);
  const [newGroupName, setNewGroupName] = useState<string>('');
  const [newGroupDescription, setNewGroupDescription] = useState<string>('');
  const [newGroupIsPublic, setNewGroupIsPublic] = useState<boolean>(false);
  const [newGroupPassword, setNewGroupPassword] = useState<string>('');
  const [isCreating, setIsCreating] = useState<boolean>(false);
  
  // Assign exam dialog
  const [assignDialogOpen, setAssignDialogOpen] = useState<boolean>(false);
  const [selectedGroup, setSelectedGroup] = useState<IGroup | null>(null);
  const [selectedExam, setSelectedExam] = useState<string>('');
  const [isAssigning, setIsAssigning] = useState<boolean>(false);

  useEffect(() => {
    // Ensure auth headers are set before fetching data
    refreshAuth();
    setAuthHeaders();
    fetchGroups();
    fetchAvailableExams();
  }, []);

  const fetchGroups = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Ensure auth headers are set before every request
      if (!setAuthHeaders()) {
        // If headers couldn't be set, try refreshing auth
        if (!refreshAuth()) {
          setError('Authentication failed. Please log in again.');
          return;
        }
      }
      
      const response = await axios.get(`${API_URL}/api/groups/creator`);
      setGroups(response.data);
    } catch (err: any) {
      console.error('Error fetching groups:', err);
      const errorMessage = err.response?.data?.message || 'Failed to fetch groups';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchAvailableExams = async () => {
    try {
      // Ensure auth headers are set before every request
      if (!setAuthHeaders()) {
        // If headers couldn't be set, try refreshing auth
        if (!refreshAuth()) {
          return;
        }
      }
      
      const response = await axios.get(`${API_URL}/api/quizzes/creator`);
      setAvailableExams(response.data);
    } catch (err: any) {
      console.error('Error fetching exams:', err);
    }
  };

  const handleRefresh = () => {
    // Try refreshing the auth state and fetch again
    refreshAuth();
    setAuthHeaders();
    fetchGroups();
    fetchAvailableExams();
  };

  const handleCreateGroup = () => {
    setNewGroupName('');
    setNewGroupDescription('');
    setNewGroupIsPublic(false);
    setNewGroupPassword('');
    setCreateDialogOpen(true);
  };

  const closeCreateDialog = () => {
    setCreateDialogOpen(false);
  };

  const confirmCreateGroup = async () => {
    if (!newGroupName.trim()) return;
    
    setIsCreating(true);
    setError(null);
    
    try {
      // Ensure auth headers are set
      setAuthHeaders();
      
      await axios.post(`${API_URL}/api/groups/create`, {
        name: newGroupName.trim(),
        description: newGroupDescription.trim(),
        isPublic: newGroupIsPublic,
        password: newGroupIsPublic && newGroupPassword.trim() ? newGroupPassword.trim() : null
      });
      
      setSuccess('Group created successfully');
      closeCreateDialog();
      fetchGroups();
    } catch (err: any) {
      console.error('Error creating group:', err);
      setError(err.response?.data?.message || 'Failed to create group');
    } finally {
      setIsCreating(false);
    }
  };

  const handleAssignExam = (group: IGroup) => {
    setSelectedGroup(group);
    setSelectedExam('');
    setAssignDialogOpen(true);
  };

  const closeAssignDialog = () => {
    setAssignDialogOpen(false);
    setSelectedGroup(null);
  };

  const confirmAssignExam = async () => {
    if (!selectedGroup || !selectedExam) return;
    
    setIsAssigning(true);
    
    try {
      // Set auth headers before making the request
      setAuthHeaders();
      
      await axios.post(
        `${API_URL}/api/groups/${selectedGroup._id}/assign-exam/${selectedExam}`,
        {},
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      
      setSuccess(`Exam assigned to ${selectedGroup.name} successfully`);
      closeAssignDialog();
      fetchGroups(); // Refresh groups list
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to assign exam');
    } finally {
      setIsAssigning(false);
    }
  };

  const handleCopyEnrollmentCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setSuccess('Enrollment code copied to clipboard');
    
    // Clear the success message after 3 seconds
    setTimeout(() => {
      setSuccess(null);
    }, 3000);
  };

  const handleDeleteGroup = async (groupId: string) => {
    if (!window.confirm('Are you sure you want to delete this group? This action cannot be undone.')) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Ensure auth headers are set
      setAuthHeaders();
      
      await axios.delete(`${API_URL}/api/groups/${groupId}`);
      
      setSuccess('Group deleted successfully');
      fetchGroups();
    } catch (err: any) {
      console.error('Error deleting group:', err);
      setError(err.response?.data?.message || 'Failed to delete group');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Groups
        </Typography>
        
        <Box>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            sx={{ mr: 2 }}
          >
            Refresh
          </Button>
          
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleCreateGroup}
          >
            Create New Group
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
      ) : groups.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            No groups created yet
          </Typography>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            Get started by creating your first group
          </Typography>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handleCreateGroup}
            sx={{ mt: 2 }}
          >
            Create Group
          </Button>
        </Paper>
      ) : (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {groups.map((group) => (
            <Box sx={{ width: { xs: '100%', md: 'calc(50% - 12px)', lg: 'calc(33.33% - 16px)' } }} key={group._id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Typography variant="h6" gutterBottom sx={{ mb: 0 }}>
                      {group.name}
                    </Typography>
                    <Chip
                      icon={group.isPublic ? <PublicIcon /> : <LockIcon />}
                      label={group.isPublic ? 'Public' : 'Private'}
                      color={group.isPublic ? 'success' : 'default'}
                      size="small"
                      variant="outlined"
                    />
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {group.description || 'No description'}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <PersonIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {group.students.length} Student{group.students.length !== 1 ? 's' : ''}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <BookIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {group.exams.length} Exam{group.exams.length !== 1 ? 's' : ''}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle2" sx={{ mr: 1 }}>
                      Enrollment Code:
                    </Typography>
                    <Chip 
                      label={group.enrollmentCode} 
                      size="small" 
                      color="primary" 
                      sx={{ mr: 1 }}
                    />
                    <IconButton 
                      size="small" 
                      onClick={() => handleCopyEnrollmentCode(group.enrollmentCode)}
                      title="Copy code"
                    >
                      <ContentCopyIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </CardContent>
                
                <Divider />
                
                <CardActions>
                  <Button 
                    size="small" 
                    startIcon={<BookIcon />}
                    onClick={() => handleAssignExam(group)}
                  >
                    Assign Exam
                  </Button>
                  
                  <Box sx={{ flex: 1 }} />
                  
                  <IconButton 
                    size="small" 
                    color="error"
                    onClick={() => handleDeleteGroup(group._id)}
                    title="Delete Group"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </CardActions>
              </Card>
            </Box>
          ))}
        </Box>
      )}
      
      {/* Create Group Dialog */}
      <Dialog open={createDialogOpen} onClose={closeCreateDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Group</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Group Name"
            fullWidth
            variant="outlined"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Description (Optional)"
            fullWidth
            variant="outlined"
            multiline
            rows={3}
            value={newGroupDescription}
            onChange={(e) => setNewGroupDescription(e.target.value)}
            sx={{ mb: 3 }}
          />

          {/* Group Visibility Setting */}
          <Paper sx={{ p: 2, mb: 2, border: '1px solid', borderColor: 'divider' }}>
            <FormControl component="fieldset">
              <FormLabel component="legend" sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="subtitle2" fontWeight="bold">
                    Group Visibility
                  </Typography>
                  <Chip 
                    label={newGroupIsPublic ? 'Public' : 'Private'} 
                    color={newGroupIsPublic ? 'success' : 'default'}
                    size="small"
                  />
                </Box>
              </FormLabel>
              
              <RadioGroup
                value={newGroupIsPublic ? 'public' : 'private'}
                onChange={(e) => setNewGroupIsPublic(e.target.value === 'public')}
              >
                <FormControlLabel
                  value="private"
                  control={<Radio />}
                  label={
                    <Box>
                      <Typography variant="body2" fontWeight="medium">Private Group</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Only visible to you. Students need enrollment code to join.
                      </Typography>
                    </Box>
                  }
                />
                <FormControlLabel
                  value="public"
                  control={<Radio />}
                  label={
                    <Box>
                      <Typography variant="body2" fontWeight="medium">Public Group</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Discoverable by students. Can be protected with a password.
                      </Typography>
                    </Box>
                  }
                />
              </RadioGroup>
            </FormControl>
          </Paper>

          {/* Password Field for Public Groups */}
          {newGroupIsPublic && (
            <TextField
              margin="dense"
              label="Group Password (Optional)"
              fullWidth
              variant="outlined"
              type="password"
              value={newGroupPassword}
              onChange={(e) => setNewGroupPassword(e.target.value)}
              placeholder="Leave empty for no password protection"
              helperText="Students will need this password to join the public group"
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeCreateDialog} disabled={isCreating}>
            Cancel
          </Button>
          <Button 
            onClick={confirmCreateGroup} 
            color="primary"
            disabled={!newGroupName.trim() || isCreating}
          >
            {isCreating ? 'Creating...' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Assign Exam Dialog */}
      <Dialog open={assignDialogOpen} onClose={closeAssignDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Assign Exam to Group</DialogTitle>
        <DialogContent>
          <Typography variant="subtitle1" gutterBottom>
            Group: {selectedGroup?.name}
          </Typography>
          
          <TextField
            select
            label="Select Exam"
            fullWidth
            variant="outlined"
            value={selectedExam}
            onChange={(e) => setSelectedExam(e.target.value)}
            margin="normal"
            SelectProps={{
              native: true,
            }}
          >
            <option value="">-- Select an Exam --</option>
            {availableExams.map((exam) => (
              <option key={exam._id} value={exam._id}>
                {exam.title}
              </option>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeAssignDialog} disabled={isAssigning}>
            Cancel
          </Button>
          <Button 
            onClick={confirmAssignExam} 
            color="primary"
            disabled={!selectedExam || isAssigning}
          >
            {isAssigning ? 'Assigning...' : 'Assign Exam'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GroupsList; 
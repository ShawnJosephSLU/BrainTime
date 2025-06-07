import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../config/api';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Divider,
} from '@mui/material';
import PublicIcon from '@mui/icons-material/Public';
import GroupIcon from '@mui/icons-material/Group';
import BookIcon from '@mui/icons-material/Book';
import LockIcon from '@mui/icons-material/Lock';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RefreshIcon from '@mui/icons-material/Refresh';

interface PublicGroup {
  _id: string;
  name: string;
  description: string;
  enrollmentCode: string;
  isPublic: boolean;
  isEnrolled: boolean;
  studentCount: number;
  examCount: number;
  creatorId: {
    email: string;
    name?: string;
  };
  createdAt: string;
}

const PublicGroups: React.FC = () => {
  const [groups, setGroups] = useState<PublicGroup[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Join dialog state
  const [joinDialogOpen, setJoinDialogOpen] = useState<boolean>(false);
  const [selectedGroup, setSelectedGroup] = useState<PublicGroup | null>(null);
  const [groupPassword, setGroupPassword] = useState<string>('');
  const [isJoining, setIsJoining] = useState<boolean>(false);

  useEffect(() => {
    fetchPublicGroups();
  }, []);

  const fetchPublicGroups = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      const response = await axios.get(`${API_URL}/api/groups/public`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGroups(response.data);
    } catch (err: any) {
      console.error('Error fetching public groups:', err);
      setError(err.response?.data?.message || 'Failed to fetch public groups');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGroup = (group: PublicGroup) => {
    setSelectedGroup(group);
    setGroupPassword('');
    setJoinDialogOpen(true);
  };

  const closeJoinDialog = () => {
    setJoinDialogOpen(false);
    setSelectedGroup(null);
    setGroupPassword('');
  };

  const confirmJoinGroup = async () => {
    if (!selectedGroup) return;
    
    setIsJoining(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      await axios.post(
        `${API_URL}/api/groups/${selectedGroup._id}/join`,
        { password: groupPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setSuccess(`Successfully joined ${selectedGroup.name}!`);
      closeJoinDialog();
      fetchPublicGroups(); // Refresh the list
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to join group');
    } finally {
      setIsJoining(false);
    }
  };

  const handleRefresh = () => {
    fetchPublicGroups();
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
            Discover Public Groups
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Join public groups to access shared assessments and collaborate with other students
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
      
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      {groups.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <PublicIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No public groups available
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Check back later for new public groups to join
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {groups.map((group) => (
            <Grid size={{ xs: 12, md: 6, lg: 4 }} key={group._id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" gutterBottom sx={{ mb: 0 }}>
                      {group.name}
                    </Typography>
                    {group.isEnrolled ? (
                      <Chip
                        icon={<CheckCircleIcon />}
                        label="Enrolled"
                        color="success"
                        size="small"
                        variant="outlined"
                      />
                    ) : (
                      <Chip
                        icon={<PublicIcon />}
                        label="Public"
                        color="primary"
                        size="small"
                        variant="outlined"
                      />
                    )}
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {group.description || 'No description available'}
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <GroupIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {group.studentCount} student{group.studentCount !== 1 ? 's' : ''}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <BookIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {group.examCount} assessment{group.examCount !== 1 ? 's' : ''}
                    </Typography>
                  </Box>

                  <Divider sx={{ my: 1 }} />

                  <Typography variant="caption" color="text.secondary">
                    Created by: {group.creatorId.name || group.creatorId.email}
                  </Typography>
                </CardContent>
                
                <CardActions>
                  {group.isEnrolled ? (
                    <Button size="small" disabled startIcon={<CheckCircleIcon />}>
                      Already Enrolled
                    </Button>
                  ) : (
                    <Button 
                      size="small" 
                      variant="contained"
                      onClick={() => handleJoinGroup(group)}
                    >
                      Join Group
                    </Button>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Join Group Dialog */}
      <Dialog open={joinDialogOpen} onClose={closeJoinDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Join Group</DialogTitle>
        <DialogContent>
          <Typography variant="subtitle1" gutterBottom>
            Group: {selectedGroup?.name}
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {selectedGroup?.description || 'No description available'}
          </Typography>

          <TextField
            fullWidth
            type="password"
            label="Group Password (if required)"
            value={groupPassword}
            onChange={(e) => setGroupPassword(e.target.value)}
            placeholder="Leave empty if no password required"
            margin="normal"
            InputProps={{
              startAdornment: <LockIcon sx={{ mr: 1, color: 'text.secondary' }} />
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeJoinDialog} disabled={isJoining}>
            Cancel
          </Button>
          <Button 
            onClick={confirmJoinGroup} 
            variant="contained"
            disabled={isJoining}
          >
            {isJoining ? 'Joining...' : 'Join Group'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PublicGroups; 
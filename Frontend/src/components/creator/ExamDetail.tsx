import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../config/api';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
  Tab,
  Tabs,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import RefreshIcon from '@mui/icons-material/Refresh';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import AlarmIcon from '@mui/icons-material/Alarm';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import HelpIcon from '@mui/icons-material/Help';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import TimerIcon from '@mui/icons-material/Timer';

interface IExam {
  _id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  duration: number;
  questions: any[];
  isLive: boolean;
  allowInternet: boolean;
  password: string;
  autoSubmit: boolean;
  shuffleQuestions: boolean;
  showResults: boolean;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`exam-tabpanel-${index}`}
      aria-labelledby={`exam-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const ExamDetail: React.FC = () => {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const { setAuthHeaders, refreshAuth } = useAuth();
  const [exam, setExam] = useState<IExam | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isTogglingLive, setIsTogglingLive] = useState<boolean>(false);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    // Refresh auth and fetch data
    refreshAuth();
    setAuthHeaders();
    fetchExamDetails();
  }, [examId]);

  const fetchExamDetails = async () => {
    if (!examId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Ensure auth headers are set
      setAuthHeaders();
      
      const response = await axios.get(`${API_URL}/api/quizzes/${examId}`);
      setExam(response.data);
    } catch (err: any) {
      console.error('Error fetching exam details:', err);
      const errorMessage = err.response?.data?.message || 'Failed to fetch exam details';
      setError(errorMessage);
      
      if (err.response?.status === 401) {
        setError('Authentication error. Please try refreshing your login.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    // Try refreshing the auth state
    const didRefresh = refreshAuth();
    setAuthHeaders();
    
    if (didRefresh) {
      fetchExamDetails();
    } else {
      setError('Authentication failed. Please log in again.');
      setTimeout(() => {
        navigate(`/signin?returnUrl=/creator/exams/${examId}`);
      }, 2000);
    }
  };

  const handleToggleLiveStatus = async () => {
    if (!exam) return;
    
    setIsTogglingLive(true);
    setError(null);
    
    try {
      // Ensure auth headers are set
      setAuthHeaders();
      
      const newStatus = !exam.isLive;
      await axios.patch(`${API_URL}/api/quizzes/${exam._id}/toggle-live`, {
        isLive: newStatus
      });
      
      setSuccess(`Exam is now ${newStatus ? 'live' : 'offline'}`);
      
      // Update the local state
      setExam({
        ...exam,
        isLive: newStatus
      });

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err: any) {
      console.error('Error toggling exam status:', err);
      setError(err.response?.data?.message || 'Failed to update exam status');
    } finally {
      setIsTogglingLive(false);
    }
  };

  const handleEdit = () => {
    navigate(`/creator/exams/edit/${examId}`);
  };

  const handleBack = () => {
    navigate('/creator/exams');
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={handleBack}
          variant="outlined" 
          sx={{ mb: 3 }}
        >
          Back to Exams
        </Button>
        
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          action={
            <Button color="inherit" size="small" onClick={handleRetry}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }

  if (!exam) {
    return (
      <Box sx={{ p: 3 }}>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={handleBack} 
          variant="outlined"
          sx={{ mb: 3 }}
        >
          Back to Exams
        </Button>
        
        <Alert severity="warning">Exam not found</Alert>
      </Box>
    );
  }

  const formattedStartTime = format(new Date(exam.startTime), 'PPP p');
  const formattedEndTime = format(new Date(exam.endTime), 'PPP p');

  return (
    <Box sx={{ p: 3 }}>
      {/* Header with actions */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          mb: 4, 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' }, 
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', md: 'center' },
          gap: 2,
          border: '1px solid var(--border-color)',
          borderRadius: '0.5rem',
          backgroundColor: 'white',
        }}
      >
        <Box>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={handleBack}
            variant="outlined"
            size="small"
            sx={{ mb: 2 }}
          >
            Back
          </Button>
          
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
            {exam.title}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
            <Chip 
              label={exam.isLive ? "Live" : "Draft"} 
              color={exam.isLive ? "success" : "default"}
              size="small"
              sx={{ fontWeight: 600 }}
            />
            
            <Chip 
              icon={<HelpIcon fontSize="small" />}
              label={`${exam.questions.length} Questions`}
              size="small"
              variant="outlined"
            />
            
            <Chip 
              icon={<TimerIcon fontSize="small" />}
              label={`${exam.duration} Minutes`}
              size="small"
              variant="outlined"
            />
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<RefreshIcon />}
            onClick={handleRetry}
            size="small"
          >
            Refresh
          </Button>
          
          <Button
            variant="outlined"
            color="primary"
            startIcon={<EditIcon />}
            onClick={handleEdit}
            size="small"
          >
            Edit
          </Button>
          
          <Button
            variant={exam.isLive ? "outlined" : "contained"}
            color={exam.isLive ? "error" : "success"}
            startIcon={exam.isLive ? <LockIcon /> : <LockOpenIcon />}
            onClick={handleToggleLiveStatus}
            disabled={isTogglingLive}
            size="small"
          >
            {isTogglingLive ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              exam.isLive ? "Unpublish" : "Publish"
            )}
          </Button>
          
          <Button
            variant="contained"
            color="primary"
            startIcon={<AssignmentTurnedInIcon />}
            component={Link}
            to={`/creator/exams/${exam._id}/submissions`}
            size="small"
          >
            View Submissions
          </Button>
        </Box>
      </Paper>

      {/* Success message */}
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}
      
      {/* Tab navigation */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          aria-label="exam detail tabs"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Overview" id="exam-tab-0" aria-controls="exam-tabpanel-0" />
          <Tab label="Questions" id="exam-tab-1" aria-controls="exam-tabpanel-1" />
          <Tab label="Settings" id="exam-tab-2" aria-controls="exam-tabpanel-2" />
        </Tabs>
      </Box>
      
      {/* Overview tab */}
      <TabPanel value={tabValue} index={0}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
          <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 66.67%' } }}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                mb: 3,
                border: '1px solid var(--border-color)',
                borderRadius: '0.5rem',
                backgroundColor: 'white',
              }}
            >
              <Typography variant="h6" component="h2" sx={{ mb: 2, fontWeight: 600 }}>
                Description
              </Typography>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                {exam.description || 'No description provided.'}
            </Typography>
            </Paper>
            
            <Paper
              elevation={0}
              sx={{
                p: 3,
                mb: 3,
                border: '1px solid var(--border-color)',
                borderRadius: '0.5rem',
                backgroundColor: 'white',
              }}
            >
              <Typography variant="h6" component="h2" sx={{ mb: 2, fontWeight: 600 }}>
                Questions Overview
              </Typography>
              
              {exam.questions.length > 0 ? (
                <List disablePadding>
                  {exam.questions.slice(0, 5).map((question, index) => (
                    <React.Fragment key={index}>
                      {index > 0 && <Divider component="li" />}
                      <ListItem 
                        alignItems="flex-start"
                        sx={{ py: 2 }}
                      >
                        <ListItemText
                          primary={
                            <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                              Question {index + 1}
                            </Typography>
                          }
                          secondary={
                            <Typography
                              variant="body2"
                              color="text.primary"
                              sx={{ mt: 1, maxHeight: 60, overflow: 'hidden', textOverflow: 'ellipsis' }}
                            >
                              {question.text}
                </Typography>
                          }
                        />
                      </ListItem>
                    </React.Fragment>
                  ))}
                  {exam.questions.length > 5 && (
                    <>
                      <Divider />
                      <Box sx={{ pt: 2, textAlign: 'center' }}>
                        <Button 
                          variant="text"
                          size="small"
                          onClick={() => setTabValue(1)}
                        >
                          View all {exam.questions.length} questions
                        </Button>
                      </Box>
                    </>
                  )}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No questions have been added to this exam yet.
                </Typography>
              )}
            </Paper>
              </Box>
          
          <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 33.33%' } }}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                mb: 3,
                border: '1px solid var(--border-color)',
                borderRadius: '0.5rem',
                backgroundColor: 'white',
              }}
            >
              <Typography variant="h6" component="h2" sx={{ mb: 2, fontWeight: 600 }}>
                Exam Details
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CalendarTodayIcon sx={{ color: 'var(--text-secondary)', mr: 1.5 }} fontSize="small" />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Start Date
                    </Typography>
                    <Typography variant="body1">
                      {formattedStartTime}
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CalendarTodayIcon sx={{ color: 'var(--text-secondary)', mr: 1.5 }} fontSize="small" />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      End Date
                </Typography>
                    <Typography variant="body1">
                      {formattedEndTime}
                </Typography>
                  </Box>
              </Box>
              
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <AlarmIcon sx={{ color: 'var(--text-secondary)', mr: 1.5 }} fontSize="small" />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Time Limit
                </Typography>
                    <Typography variant="body1">
                  {exam.duration} minutes
                </Typography>
                  </Box>
              </Box>
              
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <HelpIcon sx={{ color: 'var(--text-secondary)', mr: 1.5 }} fontSize="small" />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Questions
                </Typography>
                    <Typography variant="body1">
                      {exam.questions.length} questions
                </Typography>
                  </Box>
                </Box>
              </Box>
            </Paper>
            
            <Paper
              elevation={0}
              sx={{
                p: 3,
                mb: 3,
                border: '1px solid var(--border-color)',
                borderRadius: '0.5rem',
                backgroundColor: 'white',
              }}
            >
              <Typography variant="h6" component="h2" sx={{ mb: 2, fontWeight: 600 }}>
                Settings at a Glance
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2">
                    Password Protected
                  </Typography>
                  <Chip 
                    size="small" 
                    label={exam.password ? "Yes" : "No"} 
                    color={exam.password ? "primary" : "default"}
                  />
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2">
                    Internet Access
                  </Typography>
                  <Chip 
                    size="small" 
                    label={exam.allowInternet ? "Allowed" : "Blocked"} 
                    color={exam.allowInternet ? "success" : "error"}
                  />
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2">
                    Shuffle Questions
                  </Typography>
                  <Chip 
                    size="small" 
                    label={exam.shuffleQuestions ? "Yes" : "No"} 
                    color={exam.shuffleQuestions ? "primary" : "default"}
                  />
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2">
                    Auto-submit
                  </Typography>
                  <Chip 
                    size="small" 
                    label={exam.autoSubmit ? "Enabled" : "Disabled"} 
                    color={exam.autoSubmit ? "primary" : "default"}
                  />
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2">
                    Show Results to Students
                </Typography>
                  <Chip 
                    size="small" 
                    label={exam.showResults ? "Yes" : "No"} 
                    color={exam.showResults ? "primary" : "default"}
                  />
                </Box>
              </Box>
              
              <Box sx={{ mt: 3 }}>
                <Button
                  variant="outlined"
                  color="primary"
                  size="small"
                  fullWidth
                  onClick={() => setTabValue(2)}
                >
                  View All Settings
                </Button>
            </Box>
            </Paper>
          </Box>
        </Box>
      </TabPanel>
      
      {/* Questions tab */}
      <TabPanel value={tabValue} index={1}>
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 3,
            border: '1px solid var(--border-color)',
            borderRadius: '0.5rem',
            backgroundColor: 'white',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
        Questions ({exam.questions.length})
      </Typography>
      
            <Button
              variant="outlined"
              color="primary"
              startIcon={<EditIcon />}
              onClick={handleEdit}
              size="small"
            >
              Edit Questions
            </Button>
          </Box>
          
          {exam.questions.length > 0 ? (
            <List disablePadding>
        {exam.questions.map((question, index) => (
                <React.Fragment key={index}>
                  {index > 0 && <Divider />}
                  <ListItem 
                    alignItems="flex-start"
                    sx={{ py: 3 }}
                  >
                    <ListItemText
                      primary={
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                          Question {index + 1}
                        </Typography>
                      }
                      secondary={
                        <>
                          <Typography
                            variant="body1"
                            color="text.primary"
                            sx={{ mb: 2 }}
                          >
                            {question.text}
                </Typography>
                
                          {question.type === 'multiple-choice' && (
                            <Box sx={{ ml: 2 }}>
                              {question.options.map((option: any, optIndex: number) => (
                                <Box 
                                  key={optIndex} 
                                  sx={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    mb: 1,
                                    p: 1,
                                    borderRadius: 1,
                                    backgroundColor: question.correctAnswer === option ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                                    border: question.correctAnswer === option ? '1px solid var(--secondary-color)' : 'none'
                                  }}
                                >
                                  <Box 
                                    sx={{ 
                                      width: 24, 
                                      height: 24,
                                      borderRadius: '50%',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      mr: 2,
                                      backgroundColor: question.correctAnswer === option ? 'var(--secondary-color)' : 'var(--surface-color)',
                                      color: question.correctAnswer === option ? 'white' : 'var(--text-primary)',
                                      fontSize: '0.75rem',
                                      fontWeight: 600
                                    }}
                                  >
                                    {String.fromCharCode(65 + optIndex)}
                                  </Box>
                                  <Typography variant="body2">
                                    {option}
                                  </Typography>
                                </Box>
                              ))}
                  </Box>
                )}
                
                          {question.type === 'text' && (
                            <Box sx={{ ml: 2, mt: 1 }}>
                              <Typography variant="body2" color="text.secondary">
                                Answer type: Free text response
                              </Typography>
                            </Box>
                          )}
                        </>
                      }
                        />
                      </ListItem>
                </React.Fragment>
                    ))}
                  </List>
          ) : (
            <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
              No questions have been added to this exam yet.
              <Box sx={{ mt: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleEdit}
                  size="small"
                >
                  Add Questions
                </Button>
              </Box>
            </Typography>
          )}
        </Paper>
      </TabPanel>
      
      {/* Settings tab */}
      <TabPanel value={tabValue} index={2}>
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 3,
            border: '1px solid var(--border-color)',
            borderRadius: '0.5rem',
            backgroundColor: 'white',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
              Exam Settings
            </Typography>
            
            <Button
              variant="outlined"
              color="primary"
              startIcon={<EditIcon />}
              onClick={handleEdit}
              size="small"
            >
              Edit Settings
            </Button>
          </Box>
          
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
            <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 50%' } }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                Timing
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Start Time
                  </Typography>
                  <Typography variant="body1">
                    {formattedStartTime}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    End Time
                  </Typography>
                  <Typography variant="body1">
                    {formattedEndTime}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Duration
                  </Typography>
                  <Typography variant="body1">
                    {exam.duration} minutes
                  </Typography>
                </Box>
              </Box>
              
              <Divider sx={{ my: 3 }} />
              
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                Security
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Password Protection
                    </Typography>
                  <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center' }}>
                    {exam.password ? (
                      <>
                        <LockIcon fontSize="small" sx={{ mr: 1, color: 'var(--primary-color)' }} />
                        Password protected
                      </>
                    ) : (
                      <>
                        <LockOpenIcon fontSize="small" sx={{ mr: 1, color: 'var(--text-tertiary)' }} />
                        No password
                      </>
                    )}
                    </Typography>
                  </Box>
                
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Internet Access
                  </Typography>
                  <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center' }}>
                    {exam.allowInternet ? (
                      <>
                        <VisibilityIcon fontSize="small" sx={{ mr: 1, color: 'var(--secondary-color)' }} />
                        Students can access the internet
                      </>
                    ) : (
                      <>
                        <VisibilityOffIcon fontSize="small" sx={{ mr: 1, color: 'var(--danger-color)' }} />
                        Internet access is blocked
                      </>
                    )}
                  </Typography>
                </Box>
              </Box>
            </Box>
            
            <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 50%' } }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                Exam Behavior
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Question Order
                  </Typography>
                  <Typography variant="body1">
                    {exam.shuffleQuestions ? 'Questions are shuffled for each student' : 'Fixed order for all students'}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Auto-submission
                  </Typography>
                  <Typography variant="body1">
                    {exam.autoSubmit ? 'Exam auto-submits when time expires' : 'Manual submission required'}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Results Visibility
                  </Typography>
                  <Typography variant="body1">
                    {exam.showResults ? 'Students can view their results after submission' : 'Results are hidden from students'}
                  </Typography>
                </Box>
              </Box>
              
              <Divider sx={{ my: 3 }} />
              
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                Status
              </Typography>
              
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Current Status
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Chip 
                    label={exam.isLive ? "Published" : "Draft"} 
                    color={exam.isLive ? "success" : "default"}
                    sx={{ mr: 2 }}
                  />
                  <Button
                    variant={exam.isLive ? "outlined" : "contained"}
                    color={exam.isLive ? "error" : "success"}
                    size="small"
                    onClick={handleToggleLiveStatus}
                    disabled={isTogglingLive}
                  >
                    {isTogglingLive ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      exam.isLive ? "Unpublish" : "Publish"
                    )}
                  </Button>
                </Box>
              </Box>
            </Box>
          </Box>
        </Paper>
      </TabPanel>
    </Box>
  );
};

export default ExamDetail; 
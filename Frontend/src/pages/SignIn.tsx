import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { AUTH_ENDPOINTS } from '../config/api';
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Container,
  FormControlLabel,
  Checkbox,
  Divider,
  Stack,
  Alert,
  CircularProgress,
  Paper,

  Fade,
  Grow
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import InsightsIcon from '@mui/icons-material/Insights';
import GroupsIcon from '@mui/icons-material/Groups';
import LoginIcon from '@mui/icons-material/Login';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';

interface SignInFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

const FeatureCard: React.FC<{ 
  icon: React.ReactNode; 
  title: string; 
  description: string;
  delay: number;
}> = ({ icon, title, description, delay }) => (
  <Grow in={true} timeout={800} style={{ transitionDelay: `${delay}ms` }}>
    <Paper 
      elevation={0}
      sx={{ 
        p: 3, 
        textAlign: 'center',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 3,
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 3,
          borderColor: 'primary.main'
        }
      }}
    >
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        mb: 2,
        p: 2,
        borderRadius: 2,
        bgcolor: 'primary.50',
        color: 'primary.600',
        width: 'fit-content',
        mx: 'auto'
      }}>
        {icon}
      </Box>
      <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {description}
      </Typography>
    </Paper>
  </Grow>
);

const SignIn = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<SignInFormData>({
    email: '',
    password: '',
    rememberMe: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(AUTH_ENDPOINTS.LOGIN, {
        loginIdentifier: formData.email,
        password: formData.password
      });

      const { user, accessToken } = response.data;
      login(accessToken, user);

      // Redirect to the appropriate dashboard or return URL
      const returnUrl = new URLSearchParams(location.search).get('returnUrl');
      if (returnUrl) {
        navigate(returnUrl);
      } else if (user.role === 'creator') {
        navigate('/creator/dashboard');
      } else if (user.role === 'student') {
        navigate('/student/dashboard');
      } else if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      console.error('Sign in error:', err);
      setError(err.response?.data?.message || 'Failed to sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      py: 4
    }}>
      <Container maxWidth="lg">
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', lg: 'row' }, 
          gap: 4, 
          alignItems: 'center' 
        }}>
          {/* Left Side - Branding and Features */}
          <Box sx={{ flex: 1, width: '100%' }}>
            <Fade in={true} timeout={800}>
              <Box sx={{ color: 'white', mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <SchoolIcon sx={{ fontSize: 48, mr: 2 }} />
                  <Typography variant="h2" component="h1" sx={{ fontWeight: 800 }}>
                    BrainTime
                  </Typography>
                </Box>
                
                <Typography variant="h4" sx={{ mb: 2, fontWeight: 300 }}>
                  Welcome to the Future of Online Assessments
                </Typography>
                
                <Typography variant="body1" sx={{ mb: 4, opacity: 0.9, maxWidth: 500 }}>
                  Create engaging exams, track student progress, and manage your educational content 
                  with our comprehensive assessment platform.
                </Typography>
              </Box>
            </Fade>

            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, 
              gap: 3 
            }}>
              <FeatureCard 
                icon={<CheckCircleOutlineIcon fontSize="large" />}
                title="Smart Assessments"
                description="Create intelligent exams with multiple question types and automated grading"
                delay={200}
              />
              <FeatureCard 
                icon={<InsightsIcon fontSize="large" />}
                title="Analytics"
                description="Get detailed insights into student performance and learning patterns"
                delay={400}
              />
              <FeatureCard 
                icon={<GroupsIcon fontSize="large" />}
                title="Group Management"
                description="Organize students into groups and manage access permissions easily"
                delay={600}
              />
            </Box>
          </Box>

          {/* Right Side - Sign In Form */}
          <Box sx={{ flex: 1, width: '100%', maxWidth: { lg: '50%' } }}>
            <Fade in={true} timeout={1000} style={{ transitionDelay: '300ms' }}>
              <Card 
                elevation={0}
                sx={{ 
                  maxWidth: 480,
                  mx: 'auto',
                  borderRadius: 4,
                  border: '1px solid rgba(255,255,255,0.2)',
                  background: 'rgba(255,255,255,0.95)',
                  backdropFilter: 'blur(20px)'
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ textAlign: 'center', mb: 4 }}>
                    <Typography variant="h4" component="h2" sx={{ fontWeight: 700, mb: 1 }}>
                      Sign In
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Enter your credentials to access your dashboard
                    </Typography>
                  </Box>

                  {error && (
                    <Fade in={true}>
                      <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                        {error}
                      </Alert>
                    </Fade>
                  )}

                  <Box component="form" onSubmit={handleSubmit}>
                    <Stack spacing={3}>
                      <TextField
                        fullWidth
                        label="Email Address"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        autoComplete="email"
                        autoFocus
                        variant="outlined"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2
                          }
                        }}
                      />

                      <TextField
                        fullWidth
                        label="Password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                        autoComplete="current-password"
                        variant="outlined"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2
                          }
                        }}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                aria-label="toggle password visibility"
                                onClick={handleTogglePasswordVisibility}
                                edge="end"
                                size="small"
                              >
                                {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              name="rememberMe"
                              checked={formData.rememberMe}
                              onChange={handleInputChange}
                              size="small"
                            />
                          }
                          label={
                            <Typography variant="body2">
                              Remember me
                            </Typography>
                          }
                        />
                        
                        <Link 
                          to="/forgot-password"
                          style={{ 
                            textDecoration: 'none',
                            color: 'inherit'
                          }}
                        >
                          <Typography 
                            variant="body2" 
                            color="primary" 
                            sx={{ 
                              '&:hover': { textDecoration: 'underline' },
                              fontWeight: 500
                            }}
                          >
                            Forgot Password?
                          </Typography>
                        </Link>
                      </Box>

                      <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        size="large"
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <LoginIcon />}
                        sx={{
                          py: 1.5,
                          borderRadius: 3,
                          fontWeight: 600,
                          fontSize: '1rem',
                          boxShadow: 2,
                          '&:hover': { boxShadow: 4 }
                        }}
                      >
                        {loading ? 'Signing In...' : 'Sign In'}
                      </Button>
                    </Stack>
                  </Box>

                  <Divider sx={{ my: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      or
                    </Typography>
                  </Divider>

                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Don't have an account?
                    </Typography>
                    <Button
                      component={Link}
                      to="/signup"
                      variant="outlined"
                      size="large"
                      fullWidth
                      sx={{
                        py: 1.5,
                        borderRadius: 3,
                        fontWeight: 600,
                        borderWidth: 2,
                        '&:hover': { borderWidth: 2 }
                      }}
                    >
                      Create Account
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Fade>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default SignIn; 
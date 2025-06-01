import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { AUTH_ENDPOINTS } from '../config/api';
import SchoolIcon from '@mui/icons-material/School';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import InsightsIcon from '@mui/icons-material/Insights';
import GroupsIcon from '@mui/icons-material/Groups';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';

interface SignInFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

const SignIn = () => {
  const [formData, setFormData] = useState<SignInFormData>({
    email: '',
    password: '',
    rememberMe: localStorage.getItem('rememberMe') === 'true'
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasError, setHasError] = useState<string | null>(null);
  const [needsVerification, setNeedsVerification] = useState<boolean>(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login, setAuthHeaders } = useAuth();
  
  // Get returnUrl from query params
  const searchParams = new URLSearchParams(location.search);
  const returnUrl = searchParams.get('returnUrl') || '';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    
    // Store rememberMe preference
    if (name === 'rememberMe') {
      localStorage.setItem('rememberMe', String(checked));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      setHasError('Email and password are required');
      return;
    }
    
    setHasError(null);
    setNeedsVerification(false);
    setIsLoading(true);
    
    try {
      const response = await axios.post(AUTH_ENDPOINTS.LOGIN, {
        loginIdentifier: formData.email,
        password: formData.password
      });
      
      // Get token and user info
      const { accessToken, user } = response.data;
      
      // Use the login function from AuthContext
      login(accessToken, user);
      
      // Set authorization headers for future requests
      setAuthHeaders();
      
      // Redirect based on returnUrl or user role
      if (returnUrl) {
        navigate(returnUrl);
      } else {
        // Default redirects based on user role
        if (user.role === 'student') {
          navigate('/student/dashboard');
        } else if (user.role === 'creator') {
          navigate('/creator/dashboard');
        } else if (user.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/');
        }
      }
      
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        // Check if the error is due to email not being verified
        if (error.response.data.needsVerification) {
          setNeedsVerification(true);
        } else {
          setHasError(error.response.data.message || 'Invalid email or password');
        }
      } else {
        setHasError('Login failed. Please try again later.');
      }
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!formData.email) {
      setHasError('Email is required for resending verification');
      return;
    }
    
    setIsLoading(true);
    
    try {
      await axios.post(AUTH_ENDPOINTS.RESEND_VERIFICATION, {
        email: formData.email
      });
      
      // Show success message
      setHasError(null);
      setNeedsVerification(true);
      
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        setHasError(error.response.data.message || 'Failed to resend verification email.');
      } else {
        setHasError('Failed to resend verification email. Please try again later.');
      }
      console.error('Resend verification error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row w-full bg-white">
      {/* Left section with illustration */}
      <div className="hidden md:flex md:w-2/5 bg-gradient-to-br from-blue-500 to-blue-700 p-12 justify-center items-center">
        <div className="max-w-md text-white">
          <div className="flex items-center mb-8">
            <SchoolIcon sx={{ fontSize: 40, marginRight: 2 }} />
            <h1 className="text-4xl font-bold">BrainTime</h1>
          </div>
          <h2 className="text-2xl font-semibold mb-6">Welcome to the leading online assessment platform</h2>
          <p className="text-lg opacity-90 mb-10">
            Create secure, timed assessments for your students with comprehensive analytics and management tools.
          </p>
          
          <div className="space-y-5">
            <div className="flex items-center">
              <CheckCircleOutlineIcon sx={{ marginRight: 2 }} />
              <span className="text-lg">Create secure, timed assessments</span>
            </div>
            
            <div className="flex items-center">
              <InsightsIcon sx={{ marginRight: 2 }} />
              <span className="text-lg">Advanced analytics and insights</span>
            </div>
            
            <div className="flex items-center">
              <GroupsIcon sx={{ marginRight: 2 }} />
              <span className="text-lg">Comprehensive student management</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right section with form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          {/* Mobile logo - shown only on mobile */}
          <div className="md:hidden flex flex-col items-center mb-10">
            <div className="flex items-center mb-4">
              <SchoolIcon sx={{ fontSize: 36, marginRight: 1, color: 'var(--primary-color)' }} />
              <h1 className="text-3xl font-bold text-blue-600">BrainTime</h1>
            </div>
            <p className="text-gray-600 text-center">
              Sign in to your account to create and manage assessments
            </p>
          </div>
          
          <div className="hidden md:block mb-10">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Sign in to your account</h2>
            <p className="text-gray-600">
              {returnUrl 
                ? "Sign in to continue to your previous session" 
                : "Access your BrainTime dashboard and tools"}
            </p>
          </div>
          
          {/* Verification message */}
          {needsVerification && (
            <Alert 
              severity="warning" 
              sx={{ 
                marginBottom: 3,
                backgroundColor: '#fff8e1',
                color: '#b45309',
                border: '1px solid #fef3c7',
                '& .MuiAlert-icon': {
                  color: '#d97706'
                }
              }}
            >
              <div className="mb-2 font-semibold">Email Verification Required</div>
              <p className="mb-3">Your email address has not been verified. Please check your inbox for the verification link.</p>
              <button
                onClick={handleResendVerification}
                disabled={isLoading}
                className="btn btn-outline text-sm py-1 px-3 mt-1 w-auto"
                style={{ display: 'flex', alignItems: 'center' }}
              >
                {isLoading ? (
                  <CircularProgress size={16} sx={{ marginRight: 1, color: 'var(--primary-color)' }} />
                ) : null}
                Resend Verification Email
              </button>
            </Alert>
          )}
          
          {/* Error message */}
          {hasError && (
            <Alert 
              severity="error" 
              sx={{ 
                marginBottom: 3,
                backgroundColor: '#fee2e2',
                color: '#b91c1c',
                border: '1px solid #fecaca',
                '& .MuiAlert-icon': {
                  color: '#ef4444'
                }
              }}
            >
              {hasError}
            </Alert>
          )}
          
          {/* Login form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="your@email.com"
              />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-blue-800">
                  Forgot password?
                </Link>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="••••••••"
              />
            </div>
            
            <div className="flex items-center">
              <input
                id="rememberMe"
                name="rememberMe"
                type="checkbox"
                checked={formData.rememberMe}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
                Remember me
              </label>
            </div>
            
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-md transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex justify-center items-center"
              >
                {isLoading ? (
                  <CircularProgress size={24} sx={{ color: 'white', marginRight: 1 }} />
                ) : null}
                Sign in
              </button>
            </div>
          </form>
          
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/signup" className="font-medium text-blue-600 hover:text-blue-800">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn; 
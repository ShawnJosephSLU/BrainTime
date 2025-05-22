import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { AUTH_ENDPOINTS } from '../config/api';

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
        email: formData.email,
        password: formData.password
      });
      
      // Get token and user info
      const { token, user } = response.data;
      
      // Use the login function from AuthContext
      login(token, user);
      
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
    <div className="min-h-screen flex flex-col md:flex-row w-full">
      {/* Left section with illustration - hidden on mobile */}
      <div className="hidden md:flex md:w-2/5 bg-gradient-to-br from-primary-600 to-secondary-800 p-12 justify-center items-center">
        <div className="max-w-md text-white">
          <h1 className="text-4xl font-bold mb-6">BrainTime</h1>
          <h2 className="text-2xl font-semibold mb-4">Welcome back!</h2>
          <p className="text-lg opacity-90 mb-8">
            The premier platform for creating secure, timed assessments for your students.
          </p>
          
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="bg-white/20 p-2 rounded-full mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span>Create secure, timed assessments</span>
            </div>
            
            <div className="flex items-center">
              <div className="bg-white/20 p-2 rounded-full mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <span>Advanced analytics and insights</span>
            </div>
            
            <div className="flex items-center">
              <div className="bg-white/20 p-2 rounded-full mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <span>Comprehensive student management</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right section with form */}
      <div className="flex-1 flex items-center justify-center p-0 bg-gray-900 dark:bg-gray-900 w-full">
        <div className="w-full max-w-none px-8 py-10 flex flex-col items-center justify-center">
          <div className="w-full max-w-md">
            <div className="text-center mb-10">
              {/* Mobile logo - shown only on mobile */}
              <div className="md:hidden mb-8">
                <h1 className="text-3xl font-bold text-primary-600">BrainTime</h1>
                <p className="text-gray-500 mt-2">Sign in to your account</p>
              </div>
              
              <h2 className="hidden md:block text-3xl font-bold text-white mb-4">Sign in</h2>
              <p className="hidden md:block text-gray-400">
                Access your BrainTime account
              </p>
              
              {returnUrl && (
                <p className="mt-2 text-secondary-400 text-sm">
                  Sign in to continue to your previous session
                </p>
              )}
            </div>
            
            {needsVerification ? (
              <div className="bg-yellow-900/20 text-yellow-400 p-6 rounded-lg mb-6">
                <h3 className="text-xl font-medium mb-2">Email Verification Required</h3>
                <p>Your email address has not been verified. Please check your inbox for the verification link or click the button below to resend the verification email.</p>
                <button
                  onClick={handleResendVerification}
                  disabled={isLoading}
                  className="mt-4 w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium 
                             text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 
                             focus:ring-yellow-500 focus:ring-offset-gray-900 transition duration-150 relative"
                >
                  {isLoading ? 'Sending...' : 'Resend Verification Email'}
                </button>
              </div>
            ) : hasError ? (
              <div className="bg-red-900/20 text-red-400 p-4 rounded-lg mb-6 text-sm">
                {hasError}
              </div>
            ) : null}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none block w-full px-4 py-3 border border-gray-700 rounded-lg shadow-sm 
                             placeholder-gray-500 focus:outline-none focus:ring-primary-500 focus:border-primary-500 
                             bg-gray-800 text-white transition duration-150"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                    Password
                  </label>
                  <Link to="/forgot-password" className="text-sm text-secondary-400 hover:text-secondary-300">
                    Forgot password?
                  </Link>
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="appearance-none block w-full px-4 py-3 border border-gray-700 rounded-lg shadow-sm 
                             placeholder-gray-500 focus:outline-none focus:ring-primary-500 focus:border-primary-500 
                             bg-gray-800 text-white transition duration-150"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="rememberMe"
                    name="rememberMe"
                    type="checkbox"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-700 rounded"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                  />
                  <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-300">
                    Remember me
                  </label>
                </div>
              </div>
              
              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium 
                             text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 
                             focus:ring-primary-500 focus:ring-offset-gray-900 transition duration-150 relative"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing in...
                    </>
                  ) : (
                    'Sign in'
                  )}
                </button>
              </div>
            </form>
            
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-400">
                Don't have an account?{' '}
                <Link to="/signup" className="font-medium text-secondary-400 hover:text-secondary-300">
                  Sign up
                </Link>
              </p>
            </div>
            
            <div className="mt-10 pt-8 border-t border-gray-800">
              <div className="flex justify-center space-x-6">
                <a href="#" className="text-gray-500 hover:text-gray-400">
                  <span className="sr-only">Privacy Policy</span>
                  <span className="text-xs">Privacy Policy</span>
                </a>
                <a href="#" className="text-gray-500 hover:text-gray-400">
                  <span className="sr-only">Terms of Service</span>
                  <span className="text-xs">Terms of Service</span>
                </a>
                <a href="#" className="text-gray-500 hover:text-gray-400">
                  <span className="sr-only">Contact</span>
                  <span className="text-xs">Contact</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn; 
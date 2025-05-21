import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AUTH_ENDPOINTS } from '../config/api';

interface SignUpFormData {
  email: string;
  password: string;
  confirmPassword: string;
  role: 'creator' | 'student';
}

const SignUp = () => {
  const [formData, setFormData] = useState<SignUpFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student'
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasError, setHasError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const validateForm = (): boolean => {
    // Reset error state
    setHasError(null);

    // Check if all fields are filled
    if (!formData.email || !formData.password || !formData.confirmPassword || !formData.role) {
      setHasError('All fields are required');
      return false;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setHasError('Please enter a valid email address');
      return false;
    }

    // Check password strength (at least 8 characters with at least one number and one special character)
    const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/;
    if (!passwordRegex.test(formData.password)) {
      setHasError('Password must be at least 8 characters with at least one number and one special character');
      return false;
    }

    // Check if passwords match
    if (formData.password !== formData.confirmPassword) {
      setHasError('Passwords do not match');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await axios.post(AUTH_ENDPOINTS.REGISTER, {
        email: formData.email,
        password: formData.password,
        role: formData.role
      });
      
      console.log('Registration successful:', response.data);
      setIsSuccess(true);
      
      // Clear form data
      setFormData({
        email: '',
        password: '',
        confirmPassword: '',
        role: 'student'
      });
      
      // After 5 seconds, redirect to sign in page
      setTimeout(() => {
        navigate('/signin');
      }, 5000);
      
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        setHasError(error.response.data.message || 'Registration failed. Please try again.');
      } else {
        setHasError('Registration failed. Please try again later.');
      }
      console.error('Registration error:', error);
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
          <h2 className="text-2xl font-semibold mb-4">Join BrainTime today!</h2>
          <p className="text-lg opacity-90 mb-8">
            Create or join secure, timed assessments for a better learning experience.
          </p>
          
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="bg-white/20 p-2 rounded-full mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span>Create or take secure assessments</span>
            </div>
            
            <div className="flex items-center">
              <div className="bg-white/20 p-2 rounded-full mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <span>Get detailed analytics and insights</span>
            </div>
            
            <div className="flex items-center">
              <div className="bg-white/20 p-2 rounded-full mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <span>Join as a creator or student</span>
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
                <p className="text-gray-500 mt-2">Create your account</p>
              </div>
              
              <h2 className="hidden md:block text-3xl font-bold text-white mb-4">Sign up</h2>
              <p className="hidden md:block text-gray-400">
                Create your BrainTime account
              </p>
            </div>
            
            {isSuccess ? (
              <div className="bg-green-900/20 text-green-400 p-6 rounded-lg mb-6">
                <h3 className="text-xl font-medium mb-2">Registration Successful!</h3>
                <p>A verification email has been sent to your email address. Please check your inbox and follow the link to verify your account.</p>
                <p className="mt-4">You'll be redirected to the sign in page in a few seconds...</p>
              </div>
            ) : (
              <>
                {hasError && (
                  <div className="bg-red-900/20 text-red-400 p-4 rounded-lg mb-6 text-sm">
                    {hasError}
                  </div>
                )}
                
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
                    <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                      Password
                    </label>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="new-password"
                      required
                      className="appearance-none block w-full px-4 py-3 border border-gray-700 rounded-lg shadow-sm 
                                 placeholder-gray-500 focus:outline-none focus:ring-primary-500 focus:border-primary-500 
                                 bg-gray-800 text-white transition duration-150"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Minimum 8 characters with at least one number and one special character
                    </p>
                  </div>
                  
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1">
                      Confirm Password
                    </label>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      autoComplete="new-password"
                      required
                      className="appearance-none block w-full px-4 py-3 border border-gray-700 rounded-lg shadow-sm 
                                 placeholder-gray-500 focus:outline-none focus:ring-primary-500 focus:border-primary-500 
                                 bg-gray-800 text-white transition duration-150"
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="role" className="block text-sm font-medium text-gray-300 mb-1">
                      I am signing up as a
                    </label>
                    <select
                      id="role"
                      name="role"
                      required
                      className="appearance-none block w-full px-4 py-3 border border-gray-700 rounded-lg shadow-sm 
                                 focus:outline-none focus:ring-primary-500 focus:border-primary-500 
                                 bg-gray-800 text-white transition duration-150"
                      value={formData.role}
                      onChange={handleChange}
                    >
                      <option value="student">Student</option>
                      <option value="creator">Creator</option>
                    </select>
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
                          Creating account...
                        </>
                      ) : (
                        'Create account'
                      )}
                    </button>
                  </div>
                </form>
              </>
            )}
            
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-400">
                Already have an account?{' '}
                <Link to="/signin" className="font-medium text-secondary-400 hover:text-secondary-300">
                  Sign in
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

export default SignUp; 
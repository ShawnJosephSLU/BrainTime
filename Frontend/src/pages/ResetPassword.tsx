import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { AUTH_ENDPOINTS } from '../config/api';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setHasError('Invalid or missing reset token');
    }
  }, [token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setHasError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.newPassword || !formData.confirmPassword) {
      setHasError('Both password fields are required');
      return;
    }
    
    if (formData.newPassword !== formData.confirmPassword) {
      setHasError('Passwords do not match');
      return;
    }
    
    if (formData.newPassword.length < 8) {
      setHasError('Password must be at least 8 characters long');
      return;
    }

    // Check if password has at least one number and one special character
    const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/;
    if (!passwordRegex.test(formData.newPassword)) {
      setHasError('Password must contain at least one number and one special character');
      return;
    }
    
    setIsLoading(true);
    setHasError(null);
    
    try {
      await axios.post(AUTH_ENDPOINTS.RESET_PASSWORD, {
        token,
        newPassword: formData.newPassword
      });
      
      setIsSuccess(true);
      
      // Redirect to sign in after 3 seconds
      setTimeout(() => {
        navigate('/signin');
      }, 3000);
      
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        setHasError(error.response.data.message || 'Failed to reset password. Please try again.');
      } else {
        setHasError('Failed to reset password. Please try again.');
      }
      console.error('Reset password error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 w-full">
        <div className="w-full max-w-md text-center">
          <h1 className="text-3xl font-bold text-primary-600 mb-4">BrainTime</h1>
          <div className="bg-red-900/20 text-red-400 p-4 rounded-lg mb-4">
            Invalid or missing reset token
          </div>
          <Link to="/forgot-password" className="text-secondary-400 hover:text-secondary-300">
            Request a new password reset
          </Link>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 w-full">
        <div className="w-full max-w-md text-center">
          <h1 className="text-3xl font-bold text-primary-600 mb-6">BrainTime</h1>
          <div className="p-4 bg-green-900/20 text-green-400 rounded-lg mb-6">
            <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <h2 className="text-xl font-semibold mb-2">Password Reset Successful!</h2>
            <p>Your password has been reset successfully. You can now log in with your new password.</p>
            <p className="text-sm mt-2">Redirecting to sign in page...</p>
          </div>
          <Link to="/signin" className="text-secondary-400 hover:text-secondary-300">
            Go to sign in now
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 w-full">
      <div className="w-full max-w-none px-8 py-10 flex flex-col items-center justify-center">
        <div className="w-full max-w-md">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-primary-600">BrainTime</h1>
            <h2 className="mt-6 text-2xl font-bold text-white">
              Reset your password
            </h2>
            <p className="mt-2 text-sm text-gray-400">
              Enter your new password below
            </p>
          </div>

          {hasError && (
            <div className="bg-red-900/20 text-red-400 p-4 rounded-lg mb-4 text-sm">
              {hasError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-300 mb-1">
                New Password
              </label>
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                required
                className="appearance-none block w-full px-4 py-3 border border-gray-700 rounded-lg shadow-sm 
                           placeholder-gray-500 focus:outline-none focus:ring-primary-500 focus:border-primary-500 
                           bg-gray-800 text-white transition duration-150"
                placeholder="Enter new password"
                value={formData.newPassword}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1">
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                className="appearance-none block w-full px-4 py-3 border border-gray-700 rounded-lg shadow-sm 
                           placeholder-gray-500 focus:outline-none focus:ring-primary-500 focus:border-primary-500 
                           bg-gray-800 text-white transition duration-150"
                placeholder="Confirm new password"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>

            <div className="text-xs text-gray-400">
              Password must be at least 8 characters long and contain at least one number and one special character.
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
                    Resetting Password...
                  </>
                ) : (
                  'Reset Password'
                )}
              </button>
            </div>
          </form>

          <div className="mt-8 text-center">
            <Link
              to="/signin"
              className="font-medium text-secondary-400 hover:text-secondary-300 flex items-center justify-center"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
              </svg>
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword; 
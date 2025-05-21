import { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AUTH_ENDPOINTS } from '../config/api';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [hasError, setHasError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');
      
      if (!token) {
        setHasError('Verification token is missing');
        setIsLoading(false);
        return;
      }
      
      try {
        await axios.get(AUTH_ENDPOINTS.VERIFY_EMAIL, {
          params: { token }
        });
        
        setIsSuccess(true);
        
        // After 3 seconds, redirect to sign in page
        setTimeout(() => {
          navigate('/signin');
        }, 3000);
        
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          setHasError(error.response.data.message || 'Email verification failed');
        } else {
          setHasError('Email verification failed. Please try again later.');
        }
        console.error('Verification error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    verifyEmail();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="max-w-md w-full p-8 bg-gray-800 rounded-lg shadow-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary-600">BrainTime</h1>
          <h2 className="text-2xl font-bold text-white mt-4">Email Verification</h2>
        </div>
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <svg className="animate-spin h-12 w-12 text-primary-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-gray-300">Verifying your email address...</p>
          </div>
        ) : isSuccess ? (
          <div className="bg-green-900/20 text-green-400 p-6 rounded-lg">
            <h3 className="text-xl font-medium mb-2">Email Verified!</h3>
            <p>Your email has been successfully verified. You can now sign in to your account.</p>
            <p className="mt-4">Redirecting to sign in page...</p>
          </div>
        ) : (
          <div className="bg-red-900/20 text-red-400 p-6 rounded-lg">
            <h3 className="text-xl font-medium mb-2">Verification Failed</h3>
            <p>{hasError}</p>
            <div className="mt-6">
              <Link 
                to="/signin" 
                className="block w-full text-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium 
                           text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 
                           focus:ring-primary-500 focus:ring-offset-gray-900 transition duration-150"
              >
                Return to Sign In
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail; 
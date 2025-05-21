import { useState } from 'react';
import { Link } from 'react-router-dom';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setHasError('Email is required');
      return;
    }
    
    setHasError(null);
    setIsLoading(true);
    
    try {
      // TODO: Implement actual password reset logic
      console.log('Password reset requested for:', email);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsSubmitted(true);
    } catch (error) {
      setHasError('Failed to submit request. Please try again.');
      console.error('Password reset error:', error);
    } finally {
      setIsLoading(false);
    }
  };

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
              {!isSubmitted
                ? "Enter your email and we'll send you a link to reset your password."
                : "If your email address exists in our database, you will receive a password recovery link at your email address in a few minutes."}
            </p>
          </div>

          {hasError && (
            <div className="bg-red-900/20 text-red-400 p-4 rounded-lg mb-4 text-sm">
              {hasError}
            </div>
          )}

          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
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
                      Processing...
                    </>
                  ) : (
                    'Send reset link'
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="mt-8 text-center">
              <div className="p-4 bg-green-900/20 text-green-400 rounded-lg">
                <svg className="w-6 h-6 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                Check your email for a reset link
              </div>
            </div>
          )}

          <div className="mt-8 text-center">
            <Link
              to="/signin"
              className="font-medium text-secondary-400 hover:text-secondary-300 flex items-center justify-center"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
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

export default ForgotPassword; 
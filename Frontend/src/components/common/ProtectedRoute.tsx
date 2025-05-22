import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  allowedRoles?: ('admin' | 'creator' | 'student')[];
}

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, user, isLoading, setAuthHeaders, refreshAuth } = useAuth();
  const location = useLocation();

  // Refresh auth headers on route change
  useEffect(() => {
    // Try to refresh authentication state
    refreshAuth();
    // Always set headers after a refresh attempt
    setAuthHeaders();
  }, [location.pathname]);
  
  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="flex flex-col items-center">
          <svg className="animate-spin h-12 w-12 text-primary-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
  }
  
  // If not authenticated, redirect to login with return URL
  if (!isAuthenticated) {
    const returnUrl = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/signin?returnUrl=${returnUrl}`} replace />;
  }
  
  // If allowedRoles is specified, check if user has the right role
  if (allowedRoles && allowedRoles.length > 0) {
    if (!user || !allowedRoles.includes(user.role)) {
      // Redirect based on user role
      if (user?.role === 'student') {
        return <Navigate to="/student/dashboard" replace />;
      } else if (user?.role === 'creator') {
        return <Navigate to="/creator/dashboard" replace />;
      } else if (user?.role === 'admin') {
        return <Navigate to="/admin/dashboard" replace />;
      } else {
        // Fallback to sign in if user role is unknown
        return <Navigate to="/signin" replace />;
      }
    }
  }
  
  return <Outlet />;
};

export default ProtectedRoute; 
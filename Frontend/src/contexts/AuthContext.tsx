import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

export interface User {
  id: string;
  email: string;
  role: 'admin' | 'creator' | 'student';
  subscriptionPlan?: string;
  isEmailVerified?: boolean;
  name?: string;
  customerId?: string;
  createdAt?: string;
  liveExamsCount?: number;
}

interface DecodedToken {
  userId: string;
  email: string;
  role: 'admin' | 'creator' | 'student';
  iat: number;
  exp: number;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
  setAuthHeaders: () => boolean;
  refreshAuth: () => boolean;
  getTokenExpiryTime: () => Date | null;
  getRemainingTokenTime: () => number | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if token is expired
  const isTokenExpired = (): boolean => {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    if (!token) return true;
    
    try {
      const decoded = jwtDecode<DecodedToken>(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp < currentTime;
    } catch (error) {
      console.error('Error decoding token:', error);
      return true;
    }
  };
  
  // Get token expiry time as Date object
  const getTokenExpiryTime = (): Date | null => {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    if (!token) return null;
    
    try {
      const decoded = jwtDecode<DecodedToken>(token);
      return new Date(decoded.exp * 1000);
    } catch (error) {
      console.error('Error getting token expiry:', error);
      return null;
    }
  };
  
  // Get remaining time in milliseconds
  const getRemainingTokenTime = (): number | null => {
    const expiryTime = getTokenExpiryTime();
    if (!expiryTime) return null;
    
    return expiryTime.getTime() - Date.now();
  };
  
  const refreshAuth = (): boolean => {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    const userData = localStorage.getItem('user') || sessionStorage.getItem('user');
    
    if (token && userData) {
      // Check if token is expired
      if (isTokenExpired()) {
        console.log('Token is expired, logging out');
        logout();
        return false;
      }
      
      try {
        const parsedUser = JSON.parse(userData);
        setIsAuthenticated(true);
        setUser(parsedUser);
        setAuthHeaders();
        
        // Log token expiry information
        const expiryTime = getTokenExpiryTime();
        if (expiryTime) {
          const remainingTime = getRemainingTokenTime();
          console.log(`Token valid until: ${expiryTime.toLocaleString()}`);
          console.log(`Time remaining: ${Math.floor((remainingTime || 0) / 60000)} minutes`);
        }
        
        return true;
      } catch (error) {
        console.error('Error parsing user data:', error);
        // Clear invalid data
        localStorage.removeItem('authToken');
        sessionStorage.removeItem('authToken');
        localStorage.removeItem('user');
        sessionStorage.removeItem('user');
        return false;
      }
    }
    return false;
  };
  
  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = () => {
      refreshAuth();
      setIsLoading(false);
    };
    
    checkAuth();
  }, []);
  
  // Set up a timer to check token expiration periodically
  useEffect(() => {
    if (!isAuthenticated) return;
    
    // Check every 5 minutes
    const checkInterval = 5 * 60 * 1000; 
    
    const intervalId = setInterval(() => {
      console.log('Checking token expiration...');
      if (isTokenExpired()) {
        console.log('Token expired during session, logging out');
        logout();
        navigate('/signin');
      } else {
        const remainingTime = getRemainingTokenTime();
        if (remainingTime) {
          const minutesRemaining = Math.floor(remainingTime / 60000);
          console.log(`Token still valid. ${minutesRemaining} minutes remaining.`);
        }
      }
    }, checkInterval);
    
    return () => clearInterval(intervalId);
  }, [isAuthenticated, navigate]);
  
  // Refresh auth headers on route change
  useEffect(() => {
    if (isAuthenticated) {
      setAuthHeaders();
    }
  }, [location.pathname, isAuthenticated]);
  
  // Setup axios interceptor for 401 errors
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      response => response,
      error => {
        // Handle 401 Unauthorized errors
        if (error.response && error.response.status === 401) {
          console.warn('Authentication error detected:', error.response.data);
          
          // Only redirect to signin if we were previously authenticated
          // This prevents redirect loops
          if (isAuthenticated) {
            logout();
            
            // Add return URL to maintain context after login
            const returnPath = location.pathname !== '/signin' ? location.pathname : '/';
            navigate(`/signin?returnUrl=${encodeURIComponent(returnPath)}`);
          }
        }
        return Promise.reject(error);
      }
    );
    
    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [navigate, location.pathname, isAuthenticated]);
  
  const login = (token: string, userData: User) => {
    // Always use localStorage for persistence until expiration
    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('rememberMe', 'true');
    
    // Remove from sessionStorage to avoid conflicts
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('user');
    
    setIsAuthenticated(true);
    setUser(userData);
    setAuthHeaders();
    
    // Log token expiry information
    try {
      const decoded = jwtDecode<DecodedToken>(token);
      const expiryDate = new Date(decoded.exp * 1000);
      console.log(`Login successful. Token valid until: ${expiryDate.toLocaleString()}`);
    } catch (error) {
      console.error('Error decoding token on login:', error);
    }
  };
  
  const logout = () => {
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('authToken');
    localStorage.removeItem('user');
    sessionStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
    
    // Remove Authorization header
    delete axios.defaults.headers.common['Authorization'];
  };
  
  const setAuthHeaders = (): boolean => {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    if (token && !isTokenExpired()) {
      // Set the header for all axios requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Log the header to debug
      console.log('Auth header set:', axios.defaults.headers.common['Authorization']);
      return true;
    } else if (token && isTokenExpired()) {
      console.warn('Token is expired, removing headers');
      delete axios.defaults.headers.common['Authorization'];
      logout();
      return false;
    } else {
      console.warn('No token found when setting auth headers');
      delete axios.defaults.headers.common['Authorization'];
      return false;
    }
  };

  // Add a global axios config to ensure headers are set for every request
  useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use(
      config => {
        // Always check and refresh auth headers before each request
        if (!config.headers.Authorization) {
          const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
          if (token && !isTokenExpired()) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }
        return config;
      },
      error => Promise.reject(error)
    );

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
    };
  }, []);
  
  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        isLoading,
        login,
        logout,
        setAuthHeaders,
        refreshAuth,
        getTokenExpiryTime,
        getRemainingTokenTime,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext; 
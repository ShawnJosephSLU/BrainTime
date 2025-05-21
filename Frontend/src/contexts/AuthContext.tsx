import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface User {
  id: string;
  email: string;
  role: 'admin' | 'creator' | 'student';
  subscriptionPlan?: 'Basic' | 'Pro' | 'Enterprise' | null;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
  setAuthHeaders: () => void;
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
  
  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      const userData = localStorage.getItem('user') || sessionStorage.getItem('user');
      
      if (token && userData) {
        setIsAuthenticated(true);
        setUser(JSON.parse(userData));
        setAuthHeaders();
      }
      
      setIsLoading(false);
    };
    
    checkAuth();
  }, []);
  
  // Setup axios interceptor for 401 errors
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      response => response,
      error => {
        if (error.response && error.response.status === 401) {
          logout();
          navigate('/signin');
        }
        return Promise.reject(error);
      }
    );
    
    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [navigate]);
  
  const login = (token: string, userData: User) => {
    // Store the authentication token based on user preference (localStorage or sessionStorage)
    const rememberMe = localStorage.getItem('rememberMe') === 'true';
    
    if (rememberMe) {
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(userData));
    } else {
      sessionStorage.setItem('authToken', token);
      sessionStorage.setItem('user', JSON.stringify(userData));
    }
    
    setIsAuthenticated(true);
    setUser(userData);
    setAuthHeaders();
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
    
    navigate('/signin');
  };
  
  const setAuthHeaders = () => {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  };
  
  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        isLoading,
        login,
        logout,
        setAuthHeaders,
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
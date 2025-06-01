import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../config/api';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Paper,
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

const SubscriptionSuccess: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { refreshAuth, setAuthHeaders } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const verifySubscription = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get session_id from URL query parameters
        const queryParams = new URLSearchParams(location.search);
        const sessionId = queryParams.get('session_id');

        if (!sessionId) {
          setError('Invalid checkout session');
          setLoading(false);
          return;
        }

        // Verify the subscription with the backend
        setAuthHeaders();
        const response = await axios.get(`${API_URL}/api/subscriptions/verify-session/${sessionId}`);
        
        if (response.data?.subscription) {
          // Refresh auth to get updated user data with subscription info
          refreshAuth();
        } else {
          setError('Unable to verify subscription');
        }
      } catch (err: any) {
        console.error('Error verifying subscription:', err);
        setError(err.response?.data?.message || 'Failed to verify subscription');
      } finally {
        setLoading(false);
      }
    };

    verifySubscription();
  }, [location.search, setAuthHeaders, refreshAuth]);

  const handleGoToDashboard = () => {
    navigate('/creator/dashboard');
  };

  const handleManageSubscription = () => {
    navigate('/creator/account');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          action={
            <Button color="inherit" size="small" onClick={handleGoToDashboard}>
              Go to Dashboard
            </Button>
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 800, mx: 'auto' }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2, textAlign: 'center' }}>
        <CheckCircleOutlineIcon 
          color="success" 
          sx={{ fontSize: 80, mb: 2 }} 
        />
        
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 2 }}>
          Subscription Successful!
        </Typography>
        
        <Typography variant="body1" sx={{ mb: 4 }}>
          Thank you for subscribing to BrainTime. Your account has been upgraded and you now have access to all features included in your plan.
        </Typography>
        
        <Divider sx={{ my: 3 }} />
        
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'center', gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={handleGoToDashboard}
          >
            Go to Dashboard
          </Button>
          
          <Button
            variant="outlined"
            color="primary"
            size="large"
            onClick={handleManageSubscription}
          >
            Manage Subscription
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default SubscriptionSuccess; 
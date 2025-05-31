import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Paper,
  Divider,
} from '@mui/material';
import CancelIcon from '@mui/icons-material/Cancel';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const SubscriptionCancel: React.FC = () => {
  const navigate = useNavigate();

  const handleGoToDashboard = () => {
    navigate('/creator/dashboard');
  };

  const handleRetrySubscription = () => {
    navigate('/creator/subscription/plans');
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 800, mx: 'auto' }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2, textAlign: 'center' }}>
        <CancelIcon 
          color="error" 
          sx={{ fontSize: 80, mb: 2 }} 
        />
        
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 2 }}>
          Subscription Canceled
        </Typography>
        
        <Typography variant="body1" sx={{ mb: 4 }}>
          You have canceled the subscription process. No charges have been made to your account.
          If you need any assistance or have questions about our subscription plans, please contact our support team.
        </Typography>
        
        <Divider sx={{ my: 3 }} />
        
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'center', gap: 2 }}>
          <Button
            variant="outlined"
            color="primary"
            size="large"
            startIcon={<ArrowBackIcon />}
            onClick={handleGoToDashboard}
          >
            Back to Dashboard
          </Button>
          
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={handleRetrySubscription}
          >
            View Subscription Plans
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default SubscriptionCancel; 
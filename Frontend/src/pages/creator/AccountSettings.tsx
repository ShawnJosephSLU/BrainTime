import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../config/api';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Paper,
  CircularProgress,
  Alert,
  Divider,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  List,
  ListItem,
  ListItemText,
  Tab,
  Tabs,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PaymentIcon from '@mui/icons-material/Payment';
import SettingsIcon from '@mui/icons-material/Settings';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import ReceiptIcon from '@mui/icons-material/Receipt';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`account-tabpanel-${index}`}
      aria-labelledby={`account-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const AccountSettings: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [subscriptionLoading, setSubscriptionLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [tabValue, setTabValue] = useState<number>(0);
  const { user, refreshAuth, setAuthHeaders } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.id) {
      fetchSubscriptionData();
    } else {
      setSubscriptionLoading(false);
    }
  }, [user]);

  const fetchSubscriptionData = async () => {
    try {
      setSubscriptionLoading(true);
      setError(null);
      setAuthHeaders();

      // If user has a customerId, fetch their subscription data
      if (user?.customerId) {
        const response = await axios.get(`${API_URL}/api/subscriptions/customer/${user.customerId}`);
        
        if (response.data?.subscriptions?.data?.length > 0) {
          // Get the most recent active subscription
          setSubscription(response.data.subscriptions.data[0]);
        }
      }
    } catch (err: any) {
      console.error('Error fetching subscription data:', err);
      setError(err.response?.data?.message || 'Failed to load subscription data');
    } finally {
      setSubscriptionLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    try {
      setLoading(true);
      setError(null);
      setAuthHeaders();

      if (!user?.customerId) {
        setError('Customer ID not found');
        return;
      }

      const response = await axios.post(`${API_URL}/api/subscriptions/portal-session`, {
        customerId: user.customerId,
      });

      if (response.data?.url) {
        // Redirect to Stripe Customer Portal
        window.location.href = response.data.url;
      } else {
        setError('Failed to create portal session');
      }
    } catch (err: any) {
      console.error('Error creating portal session:', err);
      setError(err.response?.data?.message || 'Failed to access subscription management');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleNewSubscription = () => {
    navigate('/creator/subscription/plans');
  };

  // Format date from ISO string to human-readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  // Capitalize first letter of status
  const formatStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  // Convert period to readable format (e.g., "month" or "year")
  const formatBillingPeriod = (interval: string) => {
    return interval === 'month' ? 'Monthly' : 'Annual';
  };

  if (subscriptionLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/creator/dashboard')}
          variant="outlined"
          sx={{ mb: 2 }}
        >
          Back to Dashboard
        </Button>
        
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
          Account Settings
        </Typography>
        
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Manage your account and subscription settings
        </Typography>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Paper sx={{ mb: 4 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="account settings tabs"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab 
            icon={<CreditCardIcon />} 
            label="Subscription" 
            id="account-tab-0" 
            aria-controls="account-tabpanel-0" 
            iconPosition="start"
          />
          <Tab 
            icon={<AccountCircleIcon />} 
            label="Profile" 
            id="account-tab-1" 
            aria-controls="account-tabpanel-1" 
            iconPosition="start"
          />
          <Tab 
            icon={<SettingsIcon />} 
            label="Preferences" 
            id="account-tab-2" 
            aria-controls="account-tabpanel-2" 
            iconPosition="start"
          />
        </Tabs>
        
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ p: 3 }}>
            {subscription ? (
              <Grid container spacing={3}>
                <Grid item xs={12} md={7}>
                  <Box>
                    <Typography variant="h6" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
                      Current Subscription
                    </Typography>
                    
                    <Card elevation={0} variant="outlined" sx={{ mb: 3 }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                          <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                              {subscription.items.data[0]?.price?.product?.name || 'Subscription Plan'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {formatBillingPeriod(subscription.items.data[0]?.price?.recurring?.interval || 'month')} Plan
                            </Typography>
                          </Box>
                          <Chip 
                            label={formatStatus(subscription.status)} 
                            color={subscription.status === 'active' ? 'success' : 'default'} 
                            size="small"
                          />
                        </Box>
                        
                        <Divider sx={{ my: 2 }} />
                        
                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">
                              Amount
                            </Typography>
                            <Typography variant="body1">
                              ${(subscription.items.data[0]?.price?.unit_amount / 100).toFixed(2)} / {subscription.items.data[0]?.price?.recurring?.interval}
                            </Typography>
                          </Grid>
                          
                          <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">
                              Next billing date
                            </Typography>
                            <Typography variant="body1">
                              {formatDate(subscription.current_period_end * 1000)}
                            </Typography>
                          </Grid>
                          
                          <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">
                              Subscription started
                            </Typography>
                            <Typography variant="body1">
                              {formatDate(subscription.start_date * 1000)}
                            </Typography>
                          </Grid>
                          
                          <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">
                              Payment method
                            </Typography>
                            <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center' }}>
                              <CreditCardIcon fontSize="small" sx={{ mr: 1 }} />
                              •••• {subscription.default_payment_method?.card?.last4 || '****'}
                            </Typography>
                          </Grid>
                        </Grid>
                      </CardContent>
                      <CardActions sx={{ px: 2, pb: 2 }}>
                        <Button
                          variant="outlined"
                          onClick={handleManageSubscription}
                          disabled={loading}
                          startIcon={loading ? <CircularProgress size={20} /> : <PaymentIcon />}
                        >
                          Manage Subscription
                        </Button>
                      </CardActions>
                    </Card>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={5}>
                  <Box>
                    <Typography variant="h6" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
                      Recent Invoices
                    </Typography>
                    
                    <Card elevation={0} variant="outlined">
                      <List disablePadding>
                        {/* Sample invoices - in a real app, you would fetch these from API */}
                        {[1, 2, 3].map((item, index) => (
                          <React.Fragment key={index}>
                            {index > 0 && <Divider component="li" />}
                            <ListItem
                              sx={{ 
                                py: 1.5,
                                px: 2,
                                '&:hover': { bgcolor: 'action.hover' },
                                cursor: 'pointer'
                              }}
                            >
                              <ReceiptIcon sx={{ mr: 2, color: 'text.secondary' }} />
                              <ListItemText
                                primary={`Invoice #${10000 + item}`}
                                secondary={`${formatDate(new Date(2023, 5 - item, 15).toISOString())}`}
                              />
                              <Typography variant="body2" color="text.secondary">
                                ${(subscription.items.data[0]?.price?.unit_amount / 100).toFixed(2)}
                              </Typography>
                            </ListItem>
                          </React.Fragment>
                        ))}
                      </List>
                      <Box sx={{ p: 2, textAlign: 'center' }}>
                        <Button
                          variant="text"
                          size="small"
                          onClick={handleManageSubscription}
                        >
                          View All Invoices
                        </Button>
                      </Box>
                    </Card>
                  </Box>
                </Grid>
              </Grid>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <ShoppingCartIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                
                <Typography variant="h6" gutterBottom>
                  No Active Subscription
                </Typography>
                
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  You don't have an active subscription plan. Subscribe now to access premium features.
                </Typography>
                
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  onClick={handleNewSubscription}
                >
                  View Subscription Plans
                </Button>
              </Box>
            )}
          </Box>
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
              Profile Information
            </Typography>
            
            <Card elevation={0} variant="outlined" sx={{ mb: 3 }}>
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Name
                    </Typography>
                    <Typography variant="body1">
                      {user?.name || 'N/A'}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Email
                    </Typography>
                    <Typography variant="body1">
                      {user?.email || 'N/A'}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Role
                    </Typography>
                    <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                      {user?.role || 'N/A'}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Member Since
                    </Typography>
                    <Typography variant="body1">
                      {user?.createdAt ? formatDate(user.createdAt) : 'N/A'}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
              <CardActions sx={{ px: 2, pb: 2 }}>
                <Button variant="outlined">
                  Edit Profile
                </Button>
              </CardActions>
            </Card>
            
            <Typography variant="h6" component="h2" gutterBottom sx={{ fontWeight: 600, mt: 4 }}>
              Security
            </Typography>
            
            <Card elevation={0} variant="outlined">
              <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Password
                </Typography>
                <Typography variant="body1">
                  ••••••••••••
                </Typography>
              </CardContent>
              <CardActions sx={{ px: 2, pb: 2 }}>
                <Button variant="outlined">
                  Change Password
                </Button>
              </CardActions>
            </Card>
          </Box>
        </TabPanel>
        
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
              Preferences
            </Typography>
            
            <Card elevation={0} variant="outlined">
              <CardContent>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  Customize your preferences and notifications settings.
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  This section will be available soon.
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default AccountSettings; 
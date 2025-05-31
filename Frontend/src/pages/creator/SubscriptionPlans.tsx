import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../config/api';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  CardHeader,
  Grid,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Paper,
  Chip,
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

interface IPlan {
  name: string;
  description: string;
  monthlyPriceId: string;
  annualPriceId: string;
  features: string[];
  price: {
    monthly: number;
    annual: number;
  };
}

interface IPlansResponse {
  plans: {
    basic: IPlan;
    pro: IPlan;
    enterprise: IPlan;
  };
}

const SubscriptionPlans: React.FC = () => {
  const [plans, setPlans] = useState<IPlansResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [processingPlanId, setProcessingPlanId] = useState<string | null>(null);
  const { user, setAuthHeaders } = useAuth();
  const navigate = useNavigate();

  // Fetch subscription plans
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setAuthHeaders();
        const response = await axios.get(`${API_URL}/api/subscriptions/plans`);
        setPlans(response.data);
      } catch (err: any) {
        console.error('Error fetching plans:', err);
        setError(err.response?.data?.message || 'Failed to load subscription plans');
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, [setAuthHeaders]);

  const handleBillingCycleChange = (_event: React.SyntheticEvent, newValue: 'monthly' | 'annual') => {
    setBillingCycle(newValue);
  };

  const handleSubscribe = async (priceId: string) => {
    if (!user?.id) return;

    setProcessingPlanId(priceId);
    setError(null);

    try {
      setAuthHeaders();
      const response = await axios.post(`${API_URL}/api/subscriptions/checkout-session`, {
        customerId: user.id,
        priceId: priceId,
      });

      // Redirect to Stripe Checkout
      if (response.data?.url) {
        window.location.href = response.data.url;
      } else {
        setError('Failed to create checkout session');
      }
    } catch (err: any) {
      console.error('Error creating checkout session:', err);
      setError(err.response?.data?.message || 'Failed to create checkout session');
    } finally {
      setProcessingPlanId(null);
    }
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
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate('/creator/dashboard')}
          variant="outlined" 
          sx={{ mb: 3 }}
        >
          Back to Dashboard
        </Button>
        
        <Alert severity="error">
          {error}
        </Alert>
      </Box>
    );
  }

  if (!plans) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">No subscription plans available</Alert>
      </Box>
    );
  }

  const planTypes = ['basic', 'pro', 'enterprise'] as const;
  
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
          Subscription Plans
        </Typography>
        
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Choose the plan that works best for you and your students
        </Typography>
        
        <Paper sx={{ mb: 4, p: 1, width: 'fit-content' }}>
          <Tabs
            value={billingCycle}
            onChange={handleBillingCycleChange}
            aria-label="billing cycle tabs"
          >
            <Tab 
              label="Monthly" 
              value="monthly" 
              id="billing-tab-monthly" 
              aria-controls="billing-tabpanel-monthly" 
            />
            <Tab 
              label="Annual (20% off)" 
              value="annual" 
              id="billing-tab-annual" 
              aria-controls="billing-tabpanel-annual" 
            />
          </Tabs>
        </Paper>
      </Box>
      
      <Grid container spacing={3}>
        {planTypes.map((planType) => {
          const plan = plans.plans[planType];
          const priceId = billingCycle === 'monthly' ? plan.monthlyPriceId : plan.annualPriceId;
          const price = billingCycle === 'monthly' ? plan.price.monthly : plan.price.annual;
          const isProcessing = processingPlanId === priceId;
          
          return (
            <Grid item xs={12} md={4} key={planType}>
              <Card 
                elevation={3} 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  border: planType === 'pro' ? '2px solid var(--primary-color)' : 'none',
                  position: 'relative',
                  overflow: 'visible'
                }}
              >
                {planType === 'pro' && (
                  <Chip
                    label="Most Popular"
                    color="primary"
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: -12,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      fontWeight: 600,
                    }}
                  />
                )}
                
                <CardHeader
                  title={
                    <Typography variant="h5" component="h2" sx={{ fontWeight: 700 }}>
                      {plan.name}
                    </Typography>
                  }
                  subheader={plan.description}
                  sx={{ 
                    backgroundColor: planType === 'pro' ? 'var(--primary-light)' : 'var(--surface-variant)',
                    color: planType === 'pro' ? 'var(--primary-dark)' : 'inherit',
                  }}
                />
                
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h4" component="p" sx={{ fontWeight: 700, display: 'flex', alignItems: 'flex-start' }}>
                      ${price}
                      <Typography variant="subtitle1" component="span" color="text.secondary" sx={{ ml: 1 }}>
                        /{billingCycle === 'monthly' ? 'month' : 'year'}
                      </Typography>
                    </Typography>
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <List disablePadding>
                    {plan.features.map((feature, index) => (
                      <ListItem key={index} disablePadding sx={{ mb: 1 }}>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <CheckIcon color="success" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary={feature} />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
                
                <CardActions sx={{ p: 2, pt: 0 }}>
                  <Button
                    variant={planType === 'pro' ? "contained" : "outlined"}
                    color="primary"
                    fullWidth
                    onClick={() => handleSubscribe(priceId)}
                    disabled={isProcessing}
                  >
                    {isProcessing ? <CircularProgress size={24} /> : `Subscribe to ${plan.name}`}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          );
        })}
      </Grid>
      
      <Box sx={{ mt: 4, p: 3, bgcolor: 'var(--surface-variant)', borderRadius: 2 }}>
        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
          All plans include:
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CheckIcon color="success" sx={{ mr: 1 }} />
              <Typography variant="body2">Secure exam environment</Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CheckIcon color="success" sx={{ mr: 1 }} />
              <Typography variant="body2">Detailed analytics</Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CheckIcon color="success" sx={{ mr: 1 }} />
              <Typography variant="body2">Multiple question types</Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CheckIcon color="success" sx={{ mr: 1 }} />
              <Typography variant="body2">Customer support</Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default SubscriptionPlans; 
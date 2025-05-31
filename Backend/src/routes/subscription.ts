import express, { Router } from 'express';
import * as subscriptionController from '../controllers/subscriptionController';

const router: Router = express.Router();

// Route paths that don't conflict with each other
// Get all subscriptions for a customer (must be before /:subscriptionId)
router.get('/customer/:customerId', subscriptionController.getCustomerSubscriptions as any);

// Get all subscription plans
router.get('/plans', subscriptionController.getSubscriptionPlans as any);

// Create a checkout session
router.post('/checkout-session', subscriptionController.createCheckoutSession as any);

// Cancel a subscription
router.post('/cancel/:subscriptionId', subscriptionController.cancelSubscription as any);

// Update a subscription
router.post('/update/:subscriptionId', subscriptionController.updateSubscription as any);

// Create a portal session
router.post('/portal-session', subscriptionController.createPortalSession as any);

// Verify a checkout session
router.get('/verify-session/:sessionId', subscriptionController.verifySession as any);

// Get a subscription (must be last to avoid conflicts)
router.get('/:subscriptionId', subscriptionController.getSubscription as any);

export default router;

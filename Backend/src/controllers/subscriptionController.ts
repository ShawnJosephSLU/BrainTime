import { Request, Response } from 'express';
import subscriptionService from '../services/stripe/subscription';
import { subscriptionPlans } from '../services/stripe/stripe';

export const getSubscriptionPlans = (req: Request, res: Response) => {
  try {
    res.status(200).json({ plans: subscriptionPlans });
  } catch (error) {
    console.error('Error fetching subscription plans:', error);
    res.status(500).json({ error: 'Failed to fetch subscription plans' });
  }
};

export const createCheckoutSession = async (req: Request, res: Response) => {
  try {
    const { customerId, priceId } = req.body;

    if (!customerId || !priceId) {
      return res.status(400).json({ error: 'Customer ID and price ID are required' });
    }

    const domain = process.env.FRONTEND_URL || 'http://localhost:5173';
    const successUrl = `${domain}/subscription/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${domain}/subscription/cancel`;

    const session = await subscriptionService.createCheckoutSession({
      customerId,
      priceId,
      successUrl,
      cancelUrl,
    });

    res.status(200).json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
};

export const cancelSubscription = async (req: Request, res: Response) => {
  try {
    const { subscriptionId } = req.params;

    if (!subscriptionId) {
      return res.status(400).json({ error: 'Subscription ID is required' });
    }

    const canceledSubscription = await subscriptionService.cancelSubscription(subscriptionId);
    res.status(200).json({ subscription: canceledSubscription });
  } catch (error) {
    console.error('Error canceling subscription:', error);
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
};

export const updateSubscription = async (req: Request, res: Response) => {
  try {
    const { subscriptionId } = req.params;
    const { newPriceId } = req.body;

    if (!subscriptionId || !newPriceId) {
      return res.status(400).json({ error: 'Subscription ID and new price ID are required' });
    }

    const updatedSubscription = await subscriptionService.updateSubscription(subscriptionId, newPriceId);
    res.status(200).json({ subscription: updatedSubscription });
  } catch (error) {
    console.error('Error updating subscription:', error);
    res.status(500).json({ error: 'Failed to update subscription' });
  }
};

export const getSubscription = async (req: Request, res: Response) => {
  try {
    const { subscriptionId } = req.params;

    if (!subscriptionId) {
      return res.status(400).json({ error: 'Subscription ID is required' });
    }

    const subscription = await subscriptionService.getSubscription(subscriptionId);
    res.status(200).json({ subscription });
  } catch (error) {
    console.error('Error retrieving subscription:', error);
    res.status(500).json({ error: 'Failed to retrieve subscription' });
  }
};

export const getCustomerSubscriptions = async (req: Request, res: Response) => {
  try {
    const { customerId } = req.params;

    if (!customerId) {
      return res.status(400).json({ error: 'Customer ID is required' });
    }

    const subscriptions = await subscriptionService.getCustomerSubscriptions(customerId);
    res.status(200).json({ subscriptions });
  } catch (error) {
    console.error('Error retrieving customer subscriptions:', error);
    res.status(500).json({ error: 'Failed to retrieve customer subscriptions' });
  }
};

export const createPortalSession = async (req: Request, res: Response) => {
  try {
    const { customerId } = req.body;

    if (!customerId) {
      return res.status(400).json({ error: 'Customer ID is required' });
    }

    const domain = process.env.FRONTEND_URL || 'http://localhost:5173';
    const returnUrl = `${domain}/account`;

    const session = await subscriptionService.createPortalSession(customerId, returnUrl);
    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('Error creating portal session:', error);
    res.status(500).json({ error: 'Failed to create portal session' });
  }
};

export default {
  getSubscriptionPlans,
  createCheckoutSession,
  cancelSubscription,
  updateSubscription,
  getSubscription,
  getCustomerSubscriptions,
  createPortalSession,
};

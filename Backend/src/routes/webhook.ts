import express, { Router } from 'express';
import { handleStripeWebhook } from '../controllers/webhookController';

const router: Router = express.Router();

// Stripe webhook endpoint
router.post('/stripe', express.raw({ type: 'application/json' }), handleStripeWebhook as any);

export default router;

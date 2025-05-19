import Stripe from 'stripe';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined in the environment variables');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-04-30.basil',
});

export const subscriptionPlans = {
  basic: {
    name: 'Basic',
    description: '5 live exams, 50 students',
    monthlyPriceId: process.env.STRIPE_PRICE_BASIC_MONTHLY,
    annualPriceId: process.env.STRIPE_PRICE_BASIC_ANNUAL,
    features: ['5 live exams', '50 students', 'Basic analytics'],
    price: {
      monthly: 5.99,
      annual: 57.50, // $5.99 × 12 × 0.8 = $57.50 (20% discount)
    },
  },
  pro: {
    name: 'Pro',
    description: '50 live exams, 150 students',
    monthlyPriceId: process.env.STRIPE_PRICE_PRO_MONTHLY,
    annualPriceId: process.env.STRIPE_PRICE_PRO_ANNUAL,
    features: ['50 live exams', '150 students', 'Advanced analytics', 'Priority support'],
    price: {
      monthly: 12.99,
      annual: 124.70, // $12.99 × 12 × 0.8 = $124.70 (20% discount)
    },
  },
  enterprise: {
    name: 'Enterprise',
    description: 'Unlimited exams, 10 students',
    monthlyPriceId: process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY,
    annualPriceId: process.env.STRIPE_PRICE_ENTERPRISE_ANNUAL,
    features: ['Unlimited exams', '10 students', 'Premium analytics', '24/7 support', 'Custom branding'],
    price: {
      monthly: 24.99,
      annual: 239.90, // $24.99 × 12 × 0.8 = $239.90 (20% discount)
    },
  },
};

export default stripe;

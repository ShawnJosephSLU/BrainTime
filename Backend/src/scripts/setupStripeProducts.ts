import dotenv from 'dotenv';
import path from 'path';
import Stripe from 'stripe';
import fs from 'fs';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  console.error('STRIPE_SECRET_KEY is not defined in the environment variables');
  process.exit(1);
}

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2025-04-30.basil',
});

interface SubscriptionPlan {
  name: string;
  description: string;
  features: string[];
  prices: {
    monthly: number;
    annual: number;
  };
}

const plans: Record<string, SubscriptionPlan> = {
  basic: {
    name: 'BrainTime Basic',
    description: '5 live exams, 50 students',
    features: ['5 live exams', '50 students', 'Basic analytics'],
    prices: {
      monthly: 599, // $5.99
      annual: 5750, // $57.50 (20% discount)
    },
  },
  pro: {
    name: 'BrainTime Pro',
    description: '50 live exams, 150 students',
    features: ['50 live exams', '150 students', 'Advanced analytics', 'Priority support'],
    prices: {
      monthly: 1299, // $12.99
      annual: 12470, // $124.70 (20% discount)
    },
  },
  enterprise: {
    name: 'BrainTime Enterprise',
    description: 'Unlimited exams, 10 students',
    features: [
      'Unlimited exams',
      '10 students',
      'Premium analytics',
      '24/7 support',
      'Custom branding',
    ],
    prices: {
      monthly: 2499, // $24.99
      annual: 23990, // $239.90 (20% discount)
    },
  },
};

async function setupStripeProducts() {
  try {
    console.log('Setting up Stripe products and prices...');
    
    const envUpdates: Record<string, string> = {};
    
    for (const [planKey, plan] of Object.entries(plans)) {
      console.log(`\nCreating ${plan.name} product...`);
      
      // Create the product
      const product = await stripe.products.create({
        name: plan.name,
        description: plan.description,
        metadata: {
          features: JSON.stringify(plan.features),
        },
      });
      
      console.log(`✅ Created product: ${product.name} (${product.id})`);
      envUpdates[`STRIPE_PRODUCT_${planKey.toUpperCase()}`] = product.id;
      
      // Create the monthly price
      const monthlyPrice = await stripe.prices.create({
        product: product.id,
        unit_amount: plan.prices.monthly,
        currency: 'usd',
        recurring: {
          interval: 'month',
        },
        nickname: `${plan.name} Monthly`,
      });
      
      console.log(`✅ Created monthly price: $${monthlyPrice.unit_amount! / 100}/month (${monthlyPrice.id})`);
      envUpdates[`STRIPE_PRICE_${planKey.toUpperCase()}_MONTHLY`] = monthlyPrice.id;
      
      // Create the annual price
      const annualPrice = await stripe.prices.create({
        product: product.id,
        unit_amount: plan.prices.annual,
        currency: 'usd',
        recurring: {
          interval: 'year',
        },
        nickname: `${plan.name} Annual`,
      });
      
      console.log(`✅ Created annual price: $${annualPrice.unit_amount! / 100}/year (${annualPrice.id})`);
      envUpdates[`STRIPE_PRICE_${planKey.toUpperCase()}_ANNUAL`] = annualPrice.id;
    }
    
    // Update the .env file with the new product and price IDs
    console.log('\nUpdating .env file with new product and price IDs...');
    
    const envPath = path.resolve(__dirname, '../../../.env');
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    for (const [key, value] of Object.entries(envUpdates)) {
      const regex = new RegExp(`${key}=.*`, 'g');
      if (envContent.match(regex)) {
        envContent = envContent.replace(regex, `${key}=${value}`);
      } else {
        envContent += `\n${key}=${value}`;
      }
    }
    
    fs.writeFileSync(envPath, envContent);
    
    console.log('✅ .env file updated successfully!');
    console.log('\nStripe products and prices setup completed.');
    console.log('You can now run "npm run test:stripe" to verify the setup.');
  } catch (error) {
    console.error('❌ Failed to set up Stripe products and prices:');
    console.error(error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
}

setupStripeProducts();

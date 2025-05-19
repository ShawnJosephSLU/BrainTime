import dotenv from 'dotenv';
import path from 'path';
import Stripe from 'stripe';

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

async function testStripeConnection() {
  try {
    console.log('Testing Stripe connection...');
    
    // Test retrieving the account information
    const account = await stripe.accounts.retrieve();
    console.log('✅ Successfully connected to Stripe!');
    console.log(`Account ID: ${account.id}`);
    console.log(`Account Email: ${account.email}`);
    
    // Test retrieving the subscription products
    console.log('\nTesting subscription products...');
    const basicProductId = process.env.STRIPE_PRODUCT_BASIC;
    const proProductId = process.env.STRIPE_PRODUCT_PRO;
    const enterpriseProductId = process.env.STRIPE_PRODUCT_ENTERPRISE;
    
    if (!basicProductId || !proProductId || !enterpriseProductId) {
      console.error('❌ One or more product IDs are not defined in the environment variables');
    } else {
      try {
        const basicProduct = await stripe.products.retrieve(basicProductId);
        console.log(`✅ Basic Product: ${basicProduct.name}`);
      } catch (error) {
        console.error(`❌ Failed to retrieve Basic Product: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
      
      try {
        const proProduct = await stripe.products.retrieve(proProductId);
        console.log(`✅ Pro Product: ${proProduct.name}`);
      } catch (error) {
        console.error(`❌ Failed to retrieve Pro Product: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
      
      try {
        const enterpriseProduct = await stripe.products.retrieve(enterpriseProductId);
        console.log(`✅ Enterprise Product: ${enterpriseProduct.name}`);
      } catch (error) {
        console.error(`❌ Failed to retrieve Enterprise Product: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
    
    // Test retrieving the subscription prices
    console.log('\nTesting subscription prices...');
    const basicMonthlyPriceId = process.env.STRIPE_PRICE_BASIC_MONTHLY;
    const proMonthlyPriceId = process.env.STRIPE_PRICE_PRO_MONTHLY;
    const enterpriseMonthlyPriceId = process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY;
    
    if (!basicMonthlyPriceId || !proMonthlyPriceId || !enterpriseMonthlyPriceId) {
      console.error('❌ One or more monthly price IDs are not defined in the environment variables');
    } else {
      try {
        const basicMonthlyPrice = await stripe.prices.retrieve(basicMonthlyPriceId);
        console.log(`✅ Basic Monthly Price: $${(basicMonthlyPrice.unit_amount || 0) / 100}/month`);
      } catch (error) {
        console.error(`❌ Failed to retrieve Basic Monthly Price: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
      
      try {
        const proMonthlyPrice = await stripe.prices.retrieve(proMonthlyPriceId);
        console.log(`✅ Pro Monthly Price: $${(proMonthlyPrice.unit_amount || 0) / 100}/month`);
      } catch (error) {
        console.error(`❌ Failed to retrieve Pro Monthly Price: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
      
      try {
        const enterpriseMonthlyPrice = await stripe.prices.retrieve(enterpriseMonthlyPriceId);
        console.log(`✅ Enterprise Monthly Price: $${(enterpriseMonthlyPrice.unit_amount || 0) / 100}/month`);
      } catch (error) {
        console.error(`❌ Failed to retrieve Enterprise Monthly Price: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
    
    console.log('\nStripe connection test completed.');
  } catch (error) {
    console.error('❌ Failed to connect to Stripe:');
    console.error(error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
}

testStripeConnection();

import dotenv from 'dotenv';
import path from 'path';
import { verifyEmailConnection, sendVerificationEmail } from '../services/email/emailService';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

/**
 * Test the email service connection and send a test email
 */
const testEmailService = async (): Promise<void> => {
  try {
    console.log('Testing email service connection...');
    
    // Verify connection to email server
    const isConnected = await verifyEmailConnection();
    
    if (!isConnected) {
      console.error('Failed to connect to email server. Check your credentials and server settings.');
      process.exit(1);
    }
    
    console.log('Email server connection successful!');
    
    // Send a test email
    const testEmail = process.argv[2] || 'test@example.com';
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    
    console.log(`Sending test verification email to ${testEmail}...`);
    
    const emailSent = await sendVerificationEmail(
      testEmail,
      'test-verification-token-123456',
      frontendUrl
    );
    
    if (emailSent) {
      console.log(`Test email sent successfully to ${testEmail}`);
    } else {
      console.error(`Failed to send test email to ${testEmail}`);
      process.exit(1);
    }
    
    console.log('Email service test completed successfully!');
  } catch (error) {
    console.error('Error testing email service:', error);
    process.exit(1);
  }
};

// Run the test
testEmailService();

/**
 * To run this script:
 * npx ts-node src/scripts/testEmailService.ts [optional-test-email]
 */

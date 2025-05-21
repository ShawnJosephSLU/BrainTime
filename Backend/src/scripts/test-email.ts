import dotenv from 'dotenv';
import { verifyEmailConnection, sendVerificationEmail, createTestAccount } from '../services/email/emailService';
import nodemailer from 'nodemailer';

// Load environment variables
dotenv.config();

async function testEmailConnection() {
  console.log('Testing email configuration...');
  console.log('Email settings:');
  console.log('- HOST:', process.env.EMAIL_HOST);
  console.log('- PORT:', process.env.EMAIL_PORT);
  console.log('- USER:', process.env.EMAIL_USER);
  console.log('- Frontend URL:', process.env.FRONTEND_URL);

  try {
    // First test connection
    const isConnected = await verifyEmailConnection();
    
    if (isConnected) {
      console.log('✅ Email server connection successful!');
      
      // Now try sending a test email
      console.log('Sending test verification email...');
      const sent = await sendVerificationEmail(
        process.env.EMAIL_USER || '', // Send to yourself for testing
        'test-token-123456789',
        process.env.FRONTEND_URL || 'http://localhost:5173'
      );
      
      if (sent) {
        console.log('✅ Test email sent successfully!');
      } else {
        console.log('❌ Failed to send test email');
      }
    } else {
      console.log('❌ Email server connection failed');
      
      // Try using Ethereal as a fallback
      console.log('\n🔄 Trying Ethereal as a fallback...');
      const testTransporter = await createTestAccount();
      
      if (testTransporter) {
        console.log('✅ Ethereal account created successfully');
        
        // Send a test email using Ethereal
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const verificationLink = `${frontendUrl}/verify-email?token=test-token-123456789`;
        
        try {
          const info = await testTransporter.sendMail({
            from: '"BrainTime Test" <test@example.com>',
            to: "test@example.com", // Ethereal will capture this
            subject: "Test Email - BrainTime Verification",
            html: `
              <div>
                <h2>Test Verification Email</h2>
                <p>This is a test verification email from BrainTime.</p>
                <a href="${verificationLink}">Verify Email</a>
              </div>
            `
          });
          
          console.log('✅ Test email sent via Ethereal!');
          console.log('📧 Preview URL:', nodemailer.getTestMessageUrl(info));
          console.log('\nYou can use Ethereal for testing by updating your code to use the createTestAccount function');
        } catch (error) {
          console.error('❌ Failed to send test email via Ethereal:', error);
        }
      } else {
        console.log('❌ Failed to create Ethereal test account');
      }
      
      // Provide instructions on fixing the email server issue
      console.log('\n--- 🔧 TROUBLESHOOTING EMAIL SERVER ---');
      console.log('1. The mail.mlabco.com server has an expired SSL certificate');
      console.log('2. You can:');
      console.log('   a. Update the SSL certificate on your mail server');
      console.log('   b. Use the Gmail transporter option in emailService.ts');
      console.log('   c. Use Ethereal for development/testing purposes');
      console.log('   d. Keep the TLS setting: rejectUnauthorized: false (not secure for production)');
    }
  } catch (error) {
    console.error('Error testing email:', error);
  }
}

// Run the test
testEmailConnection(); 
import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';
import readline from 'readline';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// API base URL
const API_URL = `http://localhost:${process.env.PORT || 5023}/api`;

/**
 * Test the email verification flow
 */
const testEmailVerification = async (): Promise<void> => {
  try {
    console.log('=== Email Verification Flow Test ===\n');
    
    // Get test email from user input
    const email = await new Promise<string>((resolve) => {
      rl.question('Enter test email address: ', (answer) => {
        resolve(answer.trim());
      });
    });
    
    // Get test password from user input
    const password = await new Promise<string>((resolve) => {
      rl.question('Enter test password: ', (answer) => {
        resolve(answer.trim());
      });
    });
    
    console.log('\nStep 1: Registering a new user...');
    
    // Register a new user
    const registerResponse = await axios.post(`${API_URL}/auth/register`, {
      email,
      password,
      role: 'student',
    });
    
    console.log('Registration response:', registerResponse.data);
    
    if (!registerResponse.data.emailVerificationSent) {
      console.error('Email verification was not sent. Check email service configuration.');
      rl.close();
      return;
    }
    
    console.log('\nStep 2: Check your email for verification link');
    console.log('A verification email has been sent to', email);
    
    // Get verification token from user input
    const verificationToken = await new Promise<string>((resolve) => {
      rl.question('\nEnter the verification token from the email (or from the URL): ', (answer) => {
        resolve(answer.trim());
      });
    });
    
    console.log('\nStep 3: Verifying email with token...');
    
    // Verify email with token
    const verifyResponse = await axios.get(`${API_URL}/auth/verify-email`, {
      params: { token: verificationToken },
    });
    
    console.log('Verification response:', verifyResponse.data);
    
    console.log('\nStep 4: Attempting to login...');
    
    // Login with verified credentials
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email,
      password,
    });
    
    console.log('Login response:', loginResponse.data);
    
    console.log('\n=== Email Verification Flow Test Completed Successfully ===');
    
    rl.close();
  } catch (error: any) {
    console.error('Error during test:', error.response?.data || error.message);
    rl.close();
  }
};

// Run the test
testEmailVerification();

/**
 * To run this script:
 * npx ts-node src/scripts/testEmailVerification.ts
 * 
 * Note: Make sure the server is running before executing this script
 */

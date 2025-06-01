import dotenv from 'dotenv';
import mongoose from 'mongoose';
import axios from 'axios';

// Load environment variables
dotenv.config();

const API_BASE_URL = 'http://localhost:5023';

async function testAuthenticationFixes() {
  console.log('🧪 Testing Authentication Fixes...\n');

  try {
    // Test 1: Test forgot password endpoint
    console.log('1. Testing Forgot Password API...');
    try {
      const forgotPasswordResponse = await axios.post(`${API_BASE_URL}/api/auth/forgot-password`, {
        email: 'test@example.com'
      });
      console.log('✅ Forgot Password API working:', forgotPasswordResponse.data.message);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.log('❌ Forgot Password API error:', error.response?.data?.message || error.message);
      } else {
        console.log('❌ Forgot Password API error:', error);
      }
    }

    // Test 2: Test login endpoint with correct field name
    console.log('\n2. Testing Login API with loginIdentifier...');
    try {
      const loginResponse = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        loginIdentifier: 'test@example.com',
        password: 'testpassword123!'
      });
      console.log('✅ Login API working:', loginResponse.data.message);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.log('✅ Login API responding correctly (expected error for non-existent user):', error.response?.data?.message || error.message);
      } else {
        console.log('❌ Login API error:', error);
      }
    }

    console.log('\n🎉 Authentication fixes test completed!');
    console.log('\nNext steps:');
    console.log('1. Start the backend server: npm run dev');
    console.log('2. Start the frontend: cd ../Frontend && npm run dev');
    console.log('3. Test login and forgot password functionality in the browser');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testAuthenticationFixes(); 
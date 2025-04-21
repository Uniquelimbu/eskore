require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const path = require('path');

async function verifyAuth() {
  console.log('🔍 Verifying Authentication Flow');
  console.log('-------------------------------');
  
  // Try to find test credentials in environment or default to example
  const testEmail = process.env.TEST_EMAIL || 'admin@eskore.com';
  const testPassword = process.env.TEST_PASSWORD || 'admin123';
  
  console.log(`Using test account: ${testEmail}`);
  
  try {
    // 1. Test Login
    console.log('\n1. Testing login...');
    let token;
    let user;
    
    try {
      console.log(`Sending login request to http://localhost:5000/api/auth/login with ${testEmail}`);
      
      const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
        email: testEmail,
        password: testPassword
      }, {
        // Add detailed error handling
        validateStatus: status => true // Don't throw on any status code
      });
      
      console.log('Response status:', loginResponse.status);
      console.log('Response data:', JSON.stringify(loginResponse.data, null, 2));
      
      if (loginResponse.status === 200 || loginResponse.status === 201) {
        console.log('✅ Login succeeded!');
        token = loginResponse.data.token;
        user = loginResponse.data.user;
        
        console.log('Token received:', token ? '✓' : '✗');
        console.log('User data received:', user ? '✓' : '✗');
        
        if (user) {
          console.log('User:', JSON.stringify(user, null, 2));
        }
      } else {
        console.error('❌ Login failed with status:', loginResponse.status);
        console.error('Error message:', loginResponse.data.error?.message || 'Unknown error');
        if (loginResponse.data.error?.code) {
          console.error('Error code:', loginResponse.data.error.code);
        }
        process.exit(1);
      }
    } catch (error) {
      console.error('❌ Login failed:', error.message);
      if (error.response) {
        console.error('Status:', error.response.status);
        console.error('Data:', JSON.stringify(error.response.data, null, 2));
      } else if (error.request) {
        console.error('No response received. Is the server running?');
      }
      process.exit(1);
    }
    
    // 2. Test /me endpoint if we have a token
    if (token) {
      console.log('\n2. Testing /me endpoint...');
      try {
        const meResponse = await axios.get('http://localhost:5000/api/auth/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        console.log('✅ /me endpoint succeeded!');
        console.log('User data from /me:', JSON.stringify(meResponse.data, null, 2));
      } catch (error) {
        console.error('❌ /me endpoint failed:', error.response?.data || error.message);
      }
    }
    
    console.log('\n✅ Authentication verification completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Script error:', error.message);
    process.exit(1);
  }
}

verifyAuth();

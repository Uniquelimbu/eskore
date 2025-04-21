/**
 * Diagnostic tool to test authentication endpoints for serialization issues
 */
require('dotenv').config();
const axios = require('axios');

// Test URLs
const BASE_URL = 'http://localhost:5000';
const LOGIN_URL = `${BASE_URL}/api/auth/login`;
const LOGOUT_URL = `${BASE_URL}/api/auth/logout`;
const ME_URL = `${BASE_URL}/api/auth/me`;

async function testAuthEndpoints() {
  console.log('🧪 Testing Authentication Endpoints');
  console.log('----------------------------------');
  
  let token = null;
  
  try {
    // Test 1: Login
    console.log('\n1️⃣ Testing Login Endpoint');
    try {
      const loginResponse = await axios.post(LOGIN_URL, {
        email: 'admin@eskore.com',
        password: 'admin123'
      });
      
      console.log('✅ Login successful!');
      console.log(`   Status: ${loginResponse.status}`);
      console.log(`   Response size: ${JSON.stringify(loginResponse.data).length} bytes`);
      
      // Save token for later tests
      token = loginResponse.data.token;
    } catch (error) {
      console.error('❌ Login failed:', error.message);
      if (error.response) {
        console.log('   Status:', error.response.status);
        console.log('   Data:', error.response.data);
      }
    }
    
    // Test 2: Logout
    console.log('\n2️⃣ Testing Logout Endpoint');
    try {
      const logoutResponse = await axios.post(LOGOUT_URL);
      
      console.log('✅ Logout successful!');
      console.log(`   Status: ${logoutResponse.status}`);
      console.log(`   Response size: ${JSON.stringify(logoutResponse.data).length} bytes`);
      console.log(`   Response: ${JSON.stringify(logoutResponse.data)}`);
    } catch (error) {
      console.error('❌ Logout failed:', error.message);
      if (error.response) {
        console.log('   Status:', error.response.status);
        console.log('   Data:', error.response.data);
      }
    }
    
    // Test 3: Me endpoint (if we have a token)
    if (token) {
      console.log('\n3️⃣ Testing Me Endpoint');
      try {
        const meResponse = await axios.get(ME_URL, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        console.log('✅ Me endpoint successful!');
        console.log(`   Status: ${meResponse.status}`);
        console.log(`   Response size: ${JSON.stringify(meResponse.data).length} bytes`);
      } catch (error) {
        console.error('❌ Me endpoint failed:', error.message);
        if (error.response) {
          console.log('   Status:', error.response.status);
          console.log('   Data:', error.response.data);
        }
      }
    }
    
    console.log('\n✅ All auth endpoint tests completed!');
    
  } catch (error) {
    console.error('❌ Test script error:', error.message);
  }
}

testAuthEndpoints();

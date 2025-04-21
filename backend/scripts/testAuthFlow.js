require('dotenv').config();
const axios = require('axios');
const { sanitizeUserData } = require('../src/utils/userUtils');

/**
 * Tests the full authentication flow including login and retrieving user data
 */
async function testAuthFlow() {
  try {
    console.log('🔑 Testing Authentication Flow');
    console.log('--------------------------------');
    
    // Test credentials - update these as needed
    const credentials = {
      email: 'john.doe@example.com',
      password: 'password123'
    };
    
    console.log(`1️⃣ Testing login with ${credentials.email}...`);
    let token;
    
    try {
      // Step 1: Login
      const loginResponse = await axios.post('http://localhost:5000/api/auth/login', credentials);
      console.log('✅ Login successful!');
      
      if (loginResponse.data.token) {
        token = loginResponse.data.token;
        console.log(`Token received (truncated): ${token.substring(0, 15)}...`);
      } else {
        console.log('Note: No token received in the response body');
      }
      
      // Extract auth cookie if present
      const cookies = loginResponse.headers['set-cookie'];
      if (cookies) {
        console.log('Auth cookies received:', cookies.map(c => c.split(';')[0]));
      }
      
      // Check user data
      console.log('\nUser data from login:');
      console.log(JSON.stringify(loginResponse.data.user, null, 2));
    } catch (error) {
      console.error('❌ Login failed:', error.response?.data || error.message);
      process.exit(1);
    }
    
    console.log('\n2️⃣ Testing /api/auth/me endpoint...');
    
    try {
      // Step 2: Get current user info using the token
      const userResponse = await axios.get('http://localhost:5000/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        withCredentials: true
      });
      
      console.log('✅ Successfully retrieved user data:');
      console.log(JSON.stringify(userResponse.data, null, 2));
    } catch (error) {
      console.error('❌ Failed to get user data:', error.response?.data || error.message);
    }
    
    console.log('\n✅ Authentication flow test complete!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAuthFlow();

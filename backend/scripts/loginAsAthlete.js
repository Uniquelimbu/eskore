/**
 * Script to test athlete login functionality
 */
require('dotenv').config();
const axios = require('axios');

async function loginAsAthlete() {
  try {
    console.log('🧪 Testing Athlete Login');
    console.log('------------------------');
    
    // Test with athlete credentials
    const credentials = [
      { email: 'athlete@example.com', password: 'athlete123' },
      { email: 'john.doe@example.com', password: 'password123' },
      { email: 'jane.smith@example.com', password: 'password123' }
    ];
    
    let success = false;
    
    for (const cred of credentials) {
      try {
        console.log(`\nAttempting login with ${cred.email}...`);
        
        const response = await axios.post('http://localhost:5000/api/auth/login', cred);
        
        if (response.status === 200 && response.data.token) {
          console.log('✅ Login successful!');
          console.log('User:', JSON.stringify(response.data.user, null, 2));
          console.log('Redirect URL:', response.data.redirectUrl || 'Not specified');
          
          console.log('\n📋 What to do next:');
          console.log('1. Use this token in your frontend:');
          console.log(`   ${response.data.token.substring(0, 20)}...`);
          console.log('2. Store in localStorage: localStorage.setItem("token", "' + response.data.token.substring(0, 10) + '...")');
          console.log('3. Set auth header: headers: { Authorization: `Bearer ${token}` }');
          
          success = true;
          break;
        }
      } catch (error) {
        console.error('❌ Login failed:', error.response?.data?.error?.message || error.message);
      }
    }
    
    if (!success) {
      console.error('❌ All athlete login attempts failed');
      console.log('\n💡 Try running the fixAuthData.js script first to ensure athlete credentials are set up correctly');
    }
    
  } catch (error) {
    console.error('Script error:', error);
  }
}

loginAsAthlete();

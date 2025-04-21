require('dotenv').config();
const axios = require('axios');

async function verifyFixedSerialization() {
  console.log('🔍 Verifying Fixed Serialization');
  console.log('--------------------------------');
  
  try {
    // 1. Test Login
    console.log('\n1. Testing login serialization...');
    let token;
    let user;
    
    try {
      const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
        email: 'john.doe@example.com',
        password: 'password123'
      });
      
      console.log('✅ Login succeeded!');
      token = loginResponse.data.token;
      user = loginResponse.data.user;
      
      console.log('Token received:', token ? '✅ Yes' : '❌ No');
      console.log('User data received:', user ? '✅ Yes' : '❌ No');
      
      if (user) {
        console.log('User properties:');
        for (const [key, value] of Object.entries(user)) {
          console.log(`  - ${key}: ${typeof value} (${value})`);
        }
      }
    } catch (error) {
      console.error('❌ Login failed:', error.message);
      if (error.response) {
        console.error('Server response:', error.response.data);
      }
      process.exit(1);
    }
    
    // 2. Test /me endpoint
    if (token) {
      console.log('\n2. Testing /me endpoint serialization...');
      try {
        const meResponse = await axios.get('http://localhost:5000/api/auth/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        console.log('✅ /me endpoint succeeded!');
        console.log('User data properties:');
        for (const [key, value] of Object.entries(meResponse.data)) {
          console.log(`  - ${key}: ${typeof value} (${value})`);
        }
      } catch (error) {
        console.error('❌ /me endpoint failed:', error.message);
        if (error.response) {
          console.error('Server response:', error.response.data);
        }
      }
    }
    
    console.log('\n✅ Serialization verification completed!');
  } catch (error) {
    console.error('❌ Test script error:', error.message);
  }
}

verifyFixedSerialization();

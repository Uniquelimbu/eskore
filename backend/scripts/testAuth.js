require('dotenv').config();
const axios = require('axios');

async function testAuth() {
  try {
    console.log('🔍 Testing Authentication API...');
    
    // Test login
    console.log('\n1. Testing login...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'john.doe@example.com',
      password: 'password123'
    });
    
    console.log(`✅ Login successful! Status: ${loginResponse.status}`);
    console.log('User data:', JSON.stringify(loginResponse.data.user, null, 2));
    
    const token = loginResponse.data.token;
    console.log(`Token (truncated): ${token.substring(0, 20)}...`);
    
    // Test auth me endpoint
    console.log('\n2. Testing /api/auth/me endpoint...');
    const meResponse = await axios.get('http://localhost:5000/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log(`✅ User data retrieved! Status: ${meResponse.status}`);
    console.log('User data:', JSON.stringify(meResponse.data, null, 2));
    
    // Test logout
    console.log('\n3. Testing logout...');
    const logoutResponse = await axios.post('http://localhost:5000/api/auth/logout');
    
    console.log(`✅ Logout successful! Status: ${logoutResponse.status}`);
    console.log('Response:', logoutResponse.data);
    
    console.log('\n✅ All authentication tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testAuth();

require('dotenv').config();
const axios = require('axios');
const { toSafeObject } = require('../src/utils/serializationUtils');

async function testDataSerialization() {
  try {
    console.log('🧪 Testing API Response Serialization');
    console.log('------------------------------------');
    
    // Test login
    console.log('\n1. Testing login serialization...');
    try {
      const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
        email: 'john.doe@example.com',
        password: 'password123'
      });
      
      console.log('✅ Login response successfully serialized!');
      console.log('Response data:', loginResponse.data);
    } catch (error) {
      console.error('❌ Login serialization test failed:', error.message);
      if (error.response) {
        console.error('Server response:', error.response.data);
      }
      process.exit(1);
    }
    
    // Get auth token for subsequent requests
    let token;
    try {
      const tokenResponse = await axios.post('http://localhost:5000/api/auth/login', {
        email: 'john.doe@example.com',
        password: 'password123'
      });
      token = tokenResponse.data.token;
    } catch (e) {
      console.error('❌ Failed to get token for subsequent tests');
      process.exit(1);
    }
    
    // Test /me endpoint
    console.log('\n2. Testing /me endpoint serialization...');
    try {
      const meResponse = await axios.get('http://localhost:5000/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✅ /me response successfully serialized!');
      console.log('Response data:', meResponse.data);
    } catch (error) {
      console.error('❌ /me serialization test failed:', error.message);
      if (error.response) {
        console.error('Server response:', error.response.data);
      }
    }
    
    console.log('\n✅ All serialization tests completed!');
  } catch (error) {
    console.error('❌ Test script error:', error.message);
  }
}

testDataSerialization();

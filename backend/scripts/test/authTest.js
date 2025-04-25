/**
 * Consolidated authentication testing script
 * Tests login, authentication flow, and token validation
 * 
 * Usage: node scripts/test/authTest.js
 */
require('dotenv').config();
const axios = require('axios');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// Basic constants
const API_URL = process.env.API_URL || 'http://localhost:5000';
const TEST_EMAIL = process.env.TEST_EMAIL || 'admin@eskore.com';
const TEST_PASSWORD = process.env.TEST_PASSWORD || 'admin123';

async function testAuthentication() {
  console.log('🔍 Testing Authentication');
  console.log('=======================');
  
  // Basic JWT validation test
  console.log('\n1. Testing JWT generation and validation');
  
  const sampleToken = jwt.sign(
    { userId: 1, role: 'athlete' },
    process.env.JWT_SECRET || 'your-default-secret',
    { expiresIn: '1h' }
  );

  console.log('Sample JWT Token:', sampleToken);
  
  try {
    const decoded = jwt.verify(sampleToken, process.env.JWT_SECRET || 'your-default-secret');
    console.log('✅ Token Verification: Success');
    console.log('Decoded token:', decoded);
  } catch (error) {
    console.error('❌ Token Verification Failed:', error.message);
  }
  
  // Password hashing test
  console.log('\n2. Testing password hashing');
  try {
    const password = 'testpass123';
    const hash = await bcrypt.hash(password, 10);
    console.log('Sample Password Hash:', hash);
    
    const validationResult = await bcrypt.compare(password, hash);
    console.log('✅ Password Validation: ', validationResult ? 'Success' : 'Failed');
  } catch (error) {
    console.error('❌ Password Hashing Error:', error.message);
  }
  
  // API login test
  console.log('\n3. Testing login endpoint');
  let token;
  
  try {
    console.log(`Sending login request to ${API_URL}/api/auth/login with ${TEST_EMAIL}`);
    
    const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    });
    
    console.log('✅ Login succeeded!');
    token = loginResponse.data.token;
    const user = loginResponse.data.user;
    
    console.log('Token received:', token ? '✓' : '✗');
    console.log('User data received:', user ? '✓' : '✗');
    
    if (user) {
      console.log('User:', JSON.stringify(user, null, 2));
    }
  } catch (error) {
    console.error('❌ Login failed:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
  
  // Test /me endpoint if we have a token
  if (token) {
    console.log('\n4. Testing /me endpoint');
    try {
      const meResponse = await axios.get(`${API_URL}/api/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      console.log('✅ /me endpoint succeeded!');
      console.log('User data:', JSON.stringify(meResponse.data, null, 2));
    } catch (error) {
      console.error('❌ /me endpoint failed:', error.message);
    }
  }
  
  console.log('\n✅ Authentication test complete!');
}

testAuthentication().catch(error => {
  console.error('❌ Test script error:', error);
  process.exit(1);
});

/**
 * Comprehensive serialization testing script 
 * Tests both utility functions and API endpoints for safe JSON serialization
 * 
 * Usage: node scripts/test/serializationTest.js
 */
require('dotenv').config();
const axios = require('axios');
const { toSafeObject } = require('../../src/utils/serializationUtils');
const { createSafeJson } = require('../../src/utils/safeSerializer');

// API_URL constant
const API_URL = process.env.API_URL || 'http://localhost:5000';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

async function testSerialization() {
  console.log(`${colors.blue}🔍 Testing API Serialization${colors.reset}`);
  console.log('==================================');
  
  // Create test objects with problematic data patterns
  const circularObj = {};
  circularObj.self = circularObj;
  
  const problemObject = {
    circular: circularObj,
    deep: { level1: { level2: { level3: { level4: { level5: {} } } } } },
    binary: Buffer.from('test binary data'),
    longString: 'x'.repeat(10000),
    function: () => console.log('This should be skipped'),
    normal: {
      name: 'Test User',
      email: 'test@example.com',
      id: 123
    }
  };
  
  // PART 1: Test utility functions
  console.log('\n1. Testing serialization utility functions');
  console.log('------------------------------------------');
  
  try {
    const safeObject = toSafeObject(problemObject);
    console.log('✅ toSafeObject succeeded');
    console.log('Preview:', JSON.stringify(safeObject).substring(0, 200) + '...');
    
    const safeJson = createSafeJson(problemObject);
    console.log('✅ createSafeJson succeeded');
    console.log('Preview:', safeJson.substring(0, 200) + '...');
    
    const parsed = JSON.parse(safeJson);
    console.log('✅ Result can be parsed back to object');
  } catch (err) {
    console.error('❌ Serialization function test failed:', err);
  }
  
  // PART 2: Test API endpoints
  console.log('\n2. Testing API endpoints serialization');
  console.log('-------------------------------------');
  
  let token;
  let loggedIn = false;
  
  // Try multiple credentials from our sample data
  const credentials = [
    { email: 'admin@eskore.com', password: 'admin123' },
    { email: 'athlete@example.com', password: 'athlete123' },
    { email: 'john.doe@example.com', password: 'password123' }
  ];
  
  // Test login endpoint
  console.log(`${colors.cyan}Testing login endpoint...${colors.reset}`);
  
  for (const cred of credentials) {
    try {
      console.log(`Trying login with ${cred.email}...`);
      const loginResponse = await axios.post(`${API_URL}/api/auth/login`, cred);
      
      console.log(`${colors.green}✅ Login succeeded${colors.reset}`);
      token = loginResponse.data.token;
      
      // Verify token was received
      if (token) {
        console.log(`${colors.green}✅ Token received${colors.reset}`);
        loggedIn = true;
        break; // We found a working credential, exit the loop
      } else {
        console.log(`${colors.yellow}⚠️ No token in response${colors.reset}`);
      }
    } catch (error) {
      console.error(`${colors.yellow}⚠️ Login failed with ${cred.email}:${colors.reset}`, 
        error.response?.data || error.message);
    }
  }
  
  if (!loggedIn) {
    console.error(`${colors.red}❌ All login attempts failed${colors.reset}`);
  }
  
  // Test /me endpoint if login was successful
  if (token) {
    console.log(`\n${colors.cyan}Testing /me endpoint...${colors.reset}`);
    try {
      const meResponse = await axios.get(`${API_URL}/api/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      console.log(`${colors.green}✅ /me endpoint succeeded${colors.reset}`);
      console.log('User data:', JSON.stringify(meResponse.data, null, 2));
    } catch (error) {
      console.error(`${colors.red}❌ /me endpoint failed:${colors.reset}`, 
        error.response?.data || error.message);
    }
  }
  
  console.log(`\n${colors.green}✅ Serialization test complete${colors.reset}`);
}

testSerialization()
  .then(() => {
    // Allow event loop to finish any pending HTTP requests
    setTimeout(() => {
      process.exit(0);
    }, 100);
  })
  .catch(error => {
    console.error('❌ Test script error:', error);
    setTimeout(() => {
      process.exit(1);
    }, 100);
  });

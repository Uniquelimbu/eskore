require('dotenv').config();
const axios = require('axios');
const { toSafeObject } = require('../src/utils/serializationUtils');
const { createSafeJson, makeSafeObject } = require('../src/utils/safeSerializer');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

async function testSerialization() {
  console.log(`${colors.blue}🔍 Testing API Serialization${colors.reset}`);
  console.log('--------------------------');
  
  try {
    // 1. Test Login
    console.log(`\n${colors.cyan}1. Testing login serialization...${colors.reset}`);
    let token;
    
    // Try multiple credentials from our sample data
    const credentials = [
      { email: 'admin@eskore.com', password: 'admin123' },
      { email: 'athlete@example.com', password: 'athlete123' }
    ];
    
    let loggedIn = false;
    
    for (const cred of credentials) {
      try {
        console.log(`Trying login with ${cred.email}...`);
        const loginResponse = await axios.post('http://localhost:5000/api/auth/login', cred);
        
        console.log(`${colors.green}✅ Login succeeded${colors.reset}`);
        token = loginResponse.data.token;
        console.log('User data:', JSON.stringify(loginResponse.data.user, null, 2));
        
        // Verify token was received
        if (token) {
          console.log(`${colors.green}✅ Token received${colors.reset}`);
          loggedIn = true;
          break; // We found a working credential, exit the loop
        } else {
          console.log(`${colors.yellow}⚠️ No token in response${colors.reset}`);
        }
      } catch (error) {
        console.error(`${colors.yellow}⚠️ Login failed with ${cred.email}:${colors.reset}`, error.response?.data || error.message);
        if (error.message.includes('Invalid string length')) {
          console.error('Still experiencing serialization issues!');
        }
      }
    }
    
    if (!loggedIn) {
      console.error(`${colors.red}❌ All login attempts failed${colors.reset}`);
    }
    
    // 2. Test /me endpoint
    if (token) {
      console.log(`\n${colors.cyan}2. Testing /me endpoint...${colors.reset}`);
      try {
        const meResponse = await axios.get('http://localhost:5000/api/auth/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        console.log(`${colors.green}✅ /me endpoint succeeded${colors.reset}`);
        console.log('User data:', JSON.stringify(meResponse.data, null, 2));
      } catch (error) {
        console.error(`${colors.red}❌ /me endpoint failed:${colors.reset}`, error.response?.data || error.message);
        if (error.message.includes('Invalid string length')) {
          console.error('Still experiencing serialization issues!');
        }
      }
    }
    
    console.log(`\n${colors.green}✅ Test completed${colors.reset}`);
    
  } catch (error) {
    console.error(`${colors.red}❌ Test script error:${colors.reset}`, error.message);
  }
}

testSerialization();

/**
 * Tests the serialization functionality directly
 */

console.log('🧪 Testing serialization utilities');
console.log('=================================');

// Create a problem object with circular references, etc.
const circularObj = {};
circularObj.self = circularObj;

const problemObject = {
  circular: circularObj,
  deep: { level1: { level2: { level3: { level4: { level5: {} } } } } },
  binary: Buffer.from('test binary data'),
  longString: 'x'.repeat(1000000),  // 1MB string
  function: () => console.log('This should be skipped'),
  normal: {
    name: 'Test User',
    email: 'test@example.com',
    id: 123
  }
};

console.log('\n1. Testing toSafeObject...');
try {
  const safeResult = toSafeObject(problemObject);
  console.log('✅ toSafeObject succeeded');
  console.log('Preview:', JSON.stringify(safeResult).substring(0, 200) + '...');
} catch (err) {
  console.error('❌ toSafeObject failed:', err);
}

console.log('\n2. Testing makeSafeObject...');
try {
  const safeResult = makeSafeObject(problemObject);
  console.log('✅ makeSafeObject succeeded');
  console.log('Preview:', JSON.stringify(safeResult).substring(0, 200) + '...');
} catch (err) {
  console.error('❌ makeSafeObject failed:', err);
}

console.log('\n3. Testing createSafeJson...');
try {
  const safeJson = createSafeJson(problemObject);
  console.log('✅ createSafeJson succeeded');
  console.log('Preview:', safeJson.substring(0, 200) + '...');
  
  // Verify it's valid JSON by parsing it back
  const parsed = JSON.parse(safeJson);
  console.log('✅ Result is valid JSON that can be parsed back');
} catch (err) {
  console.error('❌ createSafeJson failed:', err);
}

console.log('\n✅ Serialization tests complete');

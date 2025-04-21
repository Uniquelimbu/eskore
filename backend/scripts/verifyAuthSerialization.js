/**
 * Verifies that authentication endpoints don't have serialization issues
 */
require('dotenv').config();
const { createSafeJson } = require('../src/utils/safeSerializer');
const axios = require('axios');

async function verifyAuthSerialization() {
  console.log('🔍 Comprehensive Auth Serialization Test');
  console.log('======================================');
  
  // Test data with known problematic patterns
  const testData = {
    circular: {},
    deepNested: { a: { b: { c: { d: { e: { f: {} } } } } } },
    longString: 'x'.repeat(1000000), // 1MB string
    hugeArray: Array(10000).fill('test'),
    special: undefined,
    fn: function() { return 'test' },
    date: new Date(),
    symbol: Symbol('test'),
    complexMix: {
      user: {
        id: 1,
        name: 'Test',
        data: new Uint8Array(1024).buffer,
        meta: {
          // Make a circular reference
          get self() { return testData.complexMix; }
        }
      }
    }
  };
  
  // Make testData circular
  testData.circular.self = testData;
  
  // Test local serialization
  console.log('\n1. Testing local serialization robustness...');
  
  try {
    const safeJson = createSafeJson(testData);
    console.log('✅ Successfully serialized problematic data structures!');
    console.log(`   JSON length: ${safeJson.length} bytes`);
    
    // Verify it can be parsed back
    const parsed = JSON.parse(safeJson);
    console.log('✅ Successfully parsed back to object!');
    console.log('   Parsed type:', typeof parsed);
  } catch (error) {
    console.error('❌ Local serialization test failed:', error.message);
    process.exit(1);
  }
  
  // Test the API endpoints
  try {
    console.log('\n2. Testing login endpoint...');
    
    // Test with credentials that match your seed data
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@eskore.com', // Match the seeded users
      password: 'admin123'
    });
    
    console.log('✅ Login endpoint succeeded!');
    console.log('   Response status:', loginResponse.status);
    console.log('   Data:', JSON.stringify(loginResponse.data).substring(0, 200) + '...');
    
    const token = loginResponse.data.token;
    
    if (token) {
      console.log('\n3. Testing /me endpoint...');
      
      const meResponse = await axios.get('http://localhost:5000/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      console.log('✅ /me endpoint succeeded!');
      console.log('   Response status:', meResponse.status);
      console.log('   Data:', JSON.stringify(meResponse.data).substring(0, 200) + '...');
    }
    
    console.log('\n✅ All tests passed! Serialization is now robust and safe.');
  } catch (error) {
    console.error('❌ API test failed:', error.message);
    
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
    
    process.exit(1);
  }
}

verifyAuthSerialization();

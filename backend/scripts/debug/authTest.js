/**
 * Authentication testing script
 * Tests critical authentication components to identify issues
 * 
 * Usage: node scripts/debug/authTest.js
 */
require('dotenv').config();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../../src/models/User');
const { generateToken } = require('../../src/utils/authUtils');

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

async function testAuth() {
  console.log(`${colors.blue}🔒 Testing Authentication Components${colors.reset}`);
  console.log('====================================');
  
  // 1. Test JWT secret
  console.log(`\n1. Testing JWT configuration...`);
  const jwtSecret = process.env.JWT_SECRET;
  
  if (!jwtSecret) {
    console.log(`${colors.red}❌ JWT_SECRET is not set in .env file${colors.reset}`);
  } else if (jwtSecret.length < 12) {
    console.log(`${colors.yellow}⚠️ JWT_SECRET is set but may be too short (${jwtSecret.length} chars)${colors.reset}`);
  } else {
    console.log(`${colors.green}✅ JWT_SECRET is properly configured${colors.reset}`);
  }
  
  // 2. Test JWT token generation and validation
  console.log(`\n2. Testing JWT token operations...`);
  try {
    // Create a test token
    const testPayload = { userId: 999, role: 'test' };
    const token = jwt.sign(testPayload, jwtSecret || 'fallback-secret-for-testing');
    console.log(`${colors.green}✅ Token generation successful${colors.reset}`);
    
    // Verify the token
    const decoded = jwt.verify(token, jwtSecret || 'fallback-secret-for-testing');
    console.log(`${colors.green}✅ Token verification successful${colors.reset}`);
    
    if (decoded.userId === testPayload.userId && decoded.role === testPayload.role) {
      console.log(`${colors.green}✅ Token payload correctly preserved${colors.reset}`);
    } else {
      console.log(`${colors.red}❌ Token payload mismatch${colors.reset}`);
      console.log('Expected:', testPayload);
      console.log('Got:', decoded);
    }
  } catch (error) {
    console.log(`${colors.red}❌ JWT operations failed: ${error.message}${colors.reset}`);
  }
  
  // 3. Test bcrypt password hashing
  console.log(`\n3. Testing password hashing...`);
  try {
    const testPassword = 'TestPassword123';
    const hash = await bcrypt.hash(testPassword, 10);
    console.log(`${colors.green}✅ Password hashing successful${colors.reset}`);
    
    const isMatch = await bcrypt.compare(testPassword, hash);
    if (isMatch) {
      console.log(`${colors.green}✅ Password verification successful${colors.reset}`);
    } else {
      console.log(`${colors.red}❌ Password verification failed${colors.reset}`);
    }
  } catch (error) {
    console.log(`${colors.red}❌ bcrypt operations failed: ${error.message}${colors.reset}`);
  }
  
  // 4. Test database connection and user lookup
  console.log(`\n4. Testing user authentication in database...`);
  try {
    // Try to find admin user
    const adminUser = await User.findOne({ where: { email: 'admin@eskore.com' } });
    
    if (!adminUser) {
      console.log(`${colors.red}❌ Admin user not found in database${colors.reset}`);
      console.log(`Try running: node scripts/db/verifySetup.js`);
    } else {
      console.log(`${colors.green}✅ Admin user found: ${adminUser.email}${colors.reset}`);
      
      // Test authentication with known password
      console.log(`Testing login with default password (admin123)...`);
      const isPasswordValid = await adminUser.validatePassword('admin123');
      
      if (isPasswordValid) {
        console.log(`${colors.green}✅ Password validation successful${colors.reset}`);
      } else {
        console.log(`${colors.red}❌ Password validation failed${colors.reset}`);
        console.log(`The admin password may have been changed from the default.`);
        console.log(`Try running: node scripts/db/verifySetup.js to reset test users`);
      }
    }
    
    // Try to find test user
    const testUser = await User.findOne({ where: { email: 'test@eskore.com' } });
    
    if (!testUser) {
      console.log(`${colors.red}❌ Test user not found in database${colors.reset}`);
      console.log(`Try running: node scripts/db/verifySetup.js`);
    } else {
      console.log(`${colors.green}✅ Test user found: ${testUser.email}${colors.reset}`);
      
      // Test authentication with known password
      console.log(`Testing login with default password (Password123)...`);
      const isPasswordValid = await testUser.validatePassword('Password123');
      
      if (isPasswordValid) {
        console.log(`${colors.green}✅ Password validation successful${colors.reset}`);
      } else {
        console.log(`${colors.red}❌ Password validation failed${colors.reset}`);
        console.log(`The test password may have been changed from the default.`);
        console.log(`Try running: node scripts/db/verifySetup.js to reset test users`);
      }
    }
  } catch (error) {
    console.log(`${colors.red}❌ Database test failed: ${error.message}${colors.reset}`);
  }
  
  console.log(`\n${colors.blue}Authentication testing complete${colors.reset}`);
}

// Execute the test
testAuth().catch(error => {
  console.error('Test failed:', error);
  process.exit(1);
}).finally(() => {
  // Close any open connections
  process.exit(0);
});

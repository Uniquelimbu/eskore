require('dotenv').config();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// Debug utility to verify authentication setup
async function debugAuth() {
  console.log('🧪 Authentication Debug Utility');
  console.log('---------------------------------');
  
  // Generate JWT
  const token = jwt.sign(
    { userId: 1, role: 'athlete' },
    process.env.JWT_SECRET || 'your-default-secret',
    { expiresIn: '1h' }
  );

  console.log('Sample JWT Token:', token);
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-default-secret');
    console.log('✅ Token Verification: Success');
    console.log('Decoded token:', decoded);
  } catch (error) {
    console.error('❌ Token Verification Failed:', error.message);
  }

  // Test password handling
  try {
    const password = 'testpass123';
    const hash = await bcrypt.hash(password, 10);
    console.log('Sample Password Hash:', hash);
    
    const validationResult = await bcrypt.compare(password, hash);
    console.log('✅ Password Validation: ', validationResult ? 'Success' : 'Failed');
  } catch (error) {
    console.error('❌ Password Hashing Error:', error.message);
  }

  console.log('\n🔑 Authentication Config:');
  console.log(`JWT Secret (truncated): ${process.env.JWT_SECRET ? process.env.JWT_SECRET.substring(0, 5) + '...' : 'NOT SET'}`);
  console.log(`NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
}

debugAuth();

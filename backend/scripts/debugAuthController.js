/**
 * Debug script for authentication controller
 * This helps diagnose login authentication issues
 */
require('dotenv').config();
const bcrypt = require('bcrypt');
const User = require('../src/models/User');

async function debugAuthController() {
  try {
    console.log('🔍 Debugging Authentication Controller');
    console.log('------------------------------------');
    
    // Try to find the admin user
    console.log('Looking up admin@eskore.com...');
    
    const admin = await User.findOne({ 
      where: { email: 'admin@eskore.com' },
      attributes: ['id', 'email', 'password', 'role']
    });
    
    if (!admin) {
      console.error('❌ Admin user not found in database!');
      process.exit(1);
    }
    
    console.log('✅ Admin user found:');
    console.log('- ID:', admin.id);
    console.log('- Email:', admin.email);
    console.log('- Role:', admin.role);
    console.log('- Password hash exists:', !!admin.password);
    
    if (admin.password) {
      console.log('- Password hash prefix:', admin.password.substring(0, 10) + '...');
    }
    
    // Test password validation with bcrypt
    console.log('\nTesting password validation...');
    const testPassword = 'admin123';
    
    try {
      const isValid = await bcrypt.compare(testPassword, admin.password);
      console.log('Password validation result:', isValid ? '✅ Valid' : '❌ Invalid');
      
      if (!isValid) {
        console.log('\n⚠️ Fixing password hash directly...');
        
        // Generate a new hash
        const newHash = await bcrypt.hash(testPassword, 10);
        console.log('New hash generated:', newHash.substring(0, 10) + '...');
        
        // Update directly in database
        await admin.update({ password: newHash });
        console.log('✅ Password hash updated. Try login again.');
      }
    } catch (error) {
      console.error('❌ Error validating password:', error.message);
    }
    
  } catch (error) {
    console.error('Script error:', error);
  } finally {
    process.exit();
  }
}

debugAuthController();

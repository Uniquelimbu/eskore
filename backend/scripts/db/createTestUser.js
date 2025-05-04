/**
 * Creates a test user account for development and testing
 * 
 * Usage: node scripts/db/createTestUser.js
 */
require('dotenv').config();
const bcrypt = require('bcrypt');
const User = require('../../src/models/User');
const sequelize = require('../../src/config/db');

async function createTestUser() {
  try {
    console.log('🔍 Creating test user account...');
    
    // Check if test user already exists
    const existingUser = await User.findOne({
      where: { email: 'test@eskore.com' }
    });

    if (existingUser) {
      console.log('ℹ️ Test user already exists. Updating password...');
      const passwordHash = await bcrypt.hash('testpass123', 10);
      await existingUser.update({ 
        password: passwordHash,
        status: 'active' // Ensure account is active
      });
      console.log('✅ Test user updated successfully!');
      console.log('  Email: test@eskore.com');
      console.log('  Password: testpass123');
      console.log('  ID: ' + existingUser.id);
      return;
    }

    // Create new test user
    const passwordHash = await bcrypt.hash('testpass123', 10);
    const user = await User.create({
      email: 'test@eskore.com',
      password: passwordHash,
      firstName: 'Test',
      lastName: 'User',
      dob: '2000-01-01',
      height: 175,
      position: 'FW',
      country: 'Canada',
      role: 'user',
      status: 'active'
    });

    console.log('✅ Test user created successfully!');
    console.log('  Email: test@eskore.com');
    console.log('  Password: testpass123');
    console.log('  ID: ' + user.id);
    console.log('\nYou can now log in with these credentials for testing.');

  } catch (error) {
    console.error('❌ Error creating test user:', error.message);
    if (error.name === 'SequelizeValidationError') {
      console.error('Validation errors:');
      error.errors.forEach(err => console.error(`- ${err.path}: ${err.message}`));
    }
  } finally {
    // Close database connection gracefully
    try {
      await sequelize.close();
    } catch (err) {
      console.error('Error closing database connection:', err);
    }
    process.exit(0);
  }
}

// Run the function
createTestUser();

/**
 * Consolidated user management utilities
 * Creates test users.
 *
 * Usage:
 *   node scripts/utils/userManagement.js create-test       # Create or update test user
 *   node scripts/utils/userManagement.js help              # Show help message
 */
require('dotenv').config();
const bcrypt = require('bcrypt');
const User = require('../../src/models/User');
const Team = require('../../src/models/Team'); // Keep if needed for other potential future scripts

const command = process.argv[2] || 'help';

// Create test user function
async function createTestUser() {
  try {
    console.log('Creating or updating test user...');
    const password = 'testpass123';
    const passwordHash = await bcrypt.hash(password, 10);

    // Check if test user exists
    const existingUser = await User.findOne({
      where: { email: 'test@example.com' }
    });

    if (existingUser) {
      console.log('Test user exists - updating password...');
      await existingUser.update({ password: passwordHash });
      console.log('✅ Test user updated successfully!');
      console.log('ID:', existingUser.id);
      console.log('Email: test@example.com');
      console.log('Password: testpass123');
      return;
    }

    // Create a new test user
    const user = await User.create({
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      password: passwordHash,
      dob: '2000-01-01',
      height: 175,
      position: 'FW',
      country: 'Canada',
      role: 'user', // Ensure default role is set
      status: 'active' // Ensure status is set
    });

    console.log('✅ Test user created successfully!');
    console.log('ID:', user.id);
    console.log('Email: test@example.com');
    console.log('Password: testpass123');
  } catch (error) {
    console.error('Error creating/updating test user:', error);
  }
}

// Display help
function showHelp() {
  console.log(`
User Management Utility
======================

Usage:
  node scripts/utils/userManagement.js <command>

Commands:
  create-test    Create or update a test user (test@example.com / testpass123)
  help           Show this help message

Examples:
  node scripts/utils/userManagement.js create-test
  `);
}

// Main function to run the appropriate command
async function main() {
  try {
    switch (command) {
      case 'create-test':
        await createTestUser();
        break;
      case 'help':
      default:
        showHelp();
        break;
    }
  } catch (error) {
    console.error('Error in user management script:', error);
    process.exit(1); // Exit with error code
  }
}

main();

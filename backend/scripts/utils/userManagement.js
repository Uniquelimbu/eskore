/**
 * Consolidated user management utilities
 * Creates test users, links admin accounts to athlete profiles, and fixes auth data
 * 
 * Usage:
 *   node scripts/utils/userManagement.js create-test       # Create test user
 *   node scripts/utils/userManagement.js link-admin        # Link admin users to athlete profiles
 *   node scripts/utils/userManagement.js fix-auth          # Fix authentication data issues
 */
require('dotenv').config();
const bcrypt = require('bcrypt');
const User = require('../../src/models/User');
const Athlete = require('../../src/models/Athlete');
const Team = require('../../src/models/Team');

const command = process.argv[2] || 'help';

// Create test user function
async function createTestUser() {
  try {
    console.log('Creating test user...');
    
    // Create password hash directly (bypassing model hooks to ensure consistency)
    const password = 'testpass123';
    const passwordHash = await bcrypt.hash(password, 10);
    console.log('Generated password hash:', passwordHash);
    
    // Check if test user exists
    const existingUser = await Athlete.findOne({
      where: { email: 'test@example.com' }
    });
    
    if (existingUser) {
      console.log('Test user exists - updating password...');
      // Update password directly in database to ensure it's correct
      await existingUser.update({ passwordHash });
      console.log('✅ Test user updated successfully!');
      console.log('ID:', existingUser.id);
      console.log('Email: test@example.com');
      console.log('Password: testpass123');
      return;
    }
    
    // Create a new test user
    const athlete = await Athlete.create({
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      passwordHash, // Use pre-generated hash to avoid model hooks
      dob: '2000-01-01',
      height: 175,
      position: 'FW',
      country: 'Canada',
      province: 'on',
      city: 'toronto',
    });
    
    console.log('✅ Test user created successfully!');
    console.log('ID:', athlete.id);
    console.log('Email: test@example.com');
    console.log('Password: testpass123');
    
  } catch (error) {
    console.error('Error creating test user:', error);
  }
}

// Link admin users to athlete profiles
async function createAdminAthleteRecords() {
  try {
    console.log('🔄 Checking admin users and creating athlete records...');
    
    // Find all admin users
    const adminUsers = await User.findAll({
      where: {
        role: ['admin', 'athlete_admin']
      }
    });
    
    console.log(`Found ${adminUsers.length} admin users`);
    
    // Process each admin
    for (const admin of adminUsers) {
      console.log(`\nProcessing admin: ${admin.email}`);
      
      // Check if admin has an athlete record
      const athleteRecord = await Athlete.findOne({
        where: { email: admin.email }
      });
      
      if (!athleteRecord) {
        // Create athlete record
        console.log(`Creating athlete record for ${admin.email}...`);
        
        // Create a password hash or use admin's if possible
        const passwordHash = await bcrypt.hash('admin123', 10);
        
        await Athlete.create({
          firstName: 'Admin',
          lastName: admin.email.split('@')[0].charAt(0).toUpperCase() + admin.email.split('@')[0].slice(1),
          email: admin.email,
          passwordHash: passwordHash,
          dob: '1990-01-01',
          height: 175,
          position: 'FW',
          country: 'Nepal'
        });
        
        console.log('✅ Athlete record created successfully');
      } else {
        console.log('✅ Admin already has an athlete record');
      }
    }
    
    console.log('\n✅ All admin users now have athlete records');
    
  } catch (error) {
    console.error('❌ Error creating admin athlete records:', error);
  }
}

// Fix authentication data
async function fixAuthData() {
  try {
    console.log('🔧 Fixing authentication data...');
    
    // Check for athletes
    const athletes = await Athlete.findAll();
    console.log(`Found ${athletes.length} athletes`);
    
    // Check for users
    const users = await User.findAll();
    console.log(`Found ${users.length} users`);
    
    console.log('\nFixing admin account: admin@eskore.com');
    const admin = await User.findOne({ 
      where: { email: 'admin@eskore.com' } 
    });
    
    if (admin) {
      // Generate password hash directly
      const password = 'admin123';
      const passwordHash = await bcrypt.hash(password, 10);
      
      // Update directly using query - change role to allow athlete admin access
      await User.update(
        { 
          password: passwordHash,
          role: 'athlete_admin' // Change role to athlete_admin 
        },
        { where: { id: admin.id } }
      );
      
      console.log('✅ Fixed admin password and set as ATHLETE ADMIN. You can now login with:');
      console.log('   Email: admin@eskore.com');
      console.log('   Password: admin123');
      
      // Check if admin already has an athlete record
      const adminAthlete = await Athlete.findOne({
        where: { email: admin.email }
      });
      
      // Create athlete record if none exists
      if (!adminAthlete) {
        await Athlete.create({
          firstName: 'Admin',
          lastName: 'User',
          email: admin.email,
          passwordHash: passwordHash,
          dob: '1990-01-01',
          height: 175,
          position: 'FW',
          country: 'Nepal'
        });
        console.log('✅ Added athlete profile for admin');
      }
    } else {
      console.log('❌ Admin user not found');
    }
    
    console.log('Try logging in with the credentials above.');
    
  } catch (error) {
    console.error('❌ Error fixing auth data:', error);
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
  create-test    Create or update a test user
  link-admin     Link admin users to athlete profiles
  fix-auth       Fix authentication data issues
  help           Show this help message

Examples:
  node scripts/utils/userManagement.js create-test
  node scripts/utils/userManagement.js link-admin
  `);
}

// Main function to run the appropriate command
async function main() {
  try {
    switch (command) {
      case 'create-test':
        await createTestUser();
        break;
      case 'link-admin':
        await createAdminAthleteRecords();
        break;
      case 'fix-auth':
        await fixAuthData();
        break;
      case 'help':
      default:
        showHelp();
        break;
    }
  } catch (error) {
    console.error('Error in user management script:', error);
  } finally {
    process.exit(0);
  }
}

main();

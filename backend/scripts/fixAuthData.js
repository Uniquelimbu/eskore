/**
 * Script to fix authentication data issues
 * Specifically fixes the password hash for test accounts
 */
require('dotenv').config();
const bcrypt = require('bcrypt');
const User = require('../src/models/User');
const Athlete = require('../src/models/Athlete');
const Team = require('../src/models/Team');

async function fixAuthData() {
  try {
    console.log('🔧 Fixing authentication data...');
    
    // Fix athlete credentials
    console.log('Fixing athlete account: athlete@example.com');
    const athlete = await Athlete.findOne({ 
      where: { email: 'athlete@example.com' } 
    });
    
    if (athlete) {
      // Generate password hash directly - bypass any model hooks
      const password = 'athlete123';
      const passwordHash = await bcrypt.hash(password, 10);
      
      // Update directly using query to avoid any model hooks
      await Athlete.update(
        { passwordHash },
        { where: { id: athlete.id } }
      );
      
      console.log('✅ Fixed athlete password. You can now login with:');
      console.log('   Email: athlete@example.com');
      console.log('   Password: athlete123');
    } else {
      console.log('⚠️ Athlete account not found');
    }
    
    // Fix admin user credentials and make it an athlete admin
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
        where: { email: 'admin@eskore.com' }
      });
      
      if (!adminAthlete) {
        // Create an athlete record for the admin
        await Athlete.create({
          firstName: 'Admin',
          lastName: 'User',
          email: 'admin@eskore.com',
          passwordHash: passwordHash, // Use the same password
          dob: '1990-01-01', // Default values
          height: 175,
          position: 'FW',
          country: 'Nepal',
          province: 'bagmati',
          district: 'kathmandu',
          city: 'kathmandu'
        });
        
        console.log('✅ Created athlete record for admin user');
      } else {
        // Update the existing athlete record with matching password
        await Athlete.update(
          { passwordHash },
          { where: { id: adminAthlete.id } }
        );
        console.log('✅ Updated existing athlete record for admin user');
      }
    } else {
      console.log('⚠️ Admin account not found');
    }
    
    console.log('\n✅ Authentication data fixed successfully!');
    console.log('Try logging in with the credentials above.');
    
  } catch (error) {
    console.error('❌ Error fixing auth data:', error);
  } finally {
    process.exit();
  }
}

fixAuthData();

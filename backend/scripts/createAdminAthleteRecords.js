/**
 * Script to ensure all admin users have corresponding athlete records
 * This is needed to allow admins to use the athlete dashboard
 */
require('dotenv').config();
const bcrypt = require('bcrypt');
const User = require('../src/models/User');
const Athlete = require('../src/models/Athlete');

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
          // province: 'bagmati',
          // district: 'kathmandu',
          // city: 'kathmandu'
        });
        
        console.log('✅ Athlete record created successfully');
      } else {
        console.log('✅ Admin already has an athlete record');
      }
    }
    
    console.log('\n✅ All admin users now have athlete records');
    
  } catch (error) {
    console.error('❌ Error creating admin athlete records:', error);
  } finally {
    process.exit();
  }
}

createAdminAthleteRecords();

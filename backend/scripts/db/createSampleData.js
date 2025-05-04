/**
 * Creates sample data for testing
 * 
 * Usage: node scripts/db/createSampleData.js
 */
require('dotenv').config();
const bcrypt = require('bcrypt');
const sequelize = require('../../src/config/db');
const User = require('../../src/models/User');
const Team = require('../../src/models/Team');
const League = require('../../src/models/League');
const Match = require('../../src/models/Match');
const logger = require('../../src/utils/logger');

async function createSampleData() {
  console.log('📝 Creating sample data for testing...');
  
  try {
    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connection established');
    
    // Create admin user
    const adminExists = await User.findOne({ where: { email: 'admin@eskore.com' } });
    if (!adminExists) {
      const adminHash = await bcrypt.hash('admin123', 10);
      await User.create({
        email: 'admin@eskore.com',
        password: adminHash,
        role: 'admin'
      });
      console.log('✅ Created admin user: admin@eskore.com / admin123');
    } else {
      console.log('ℹ️ Admin user already exists');
    }
    
    // Create test athlete user instead of using Athlete model
    const athleteExists = await User.findOne({ where: { email: 'athlete@example.com' } });
    if (!athleteExists) {
      const athleteHash = await bcrypt.hash('athlete123', 10);
      await User.create({
        firstName: 'Test',
        middleName: null, // Add middleName for consistency
        lastName: 'Athlete',
        email: 'athlete@example.com',
        password: athleteHash,
        dob: '2000-01-01',
        height: 180,
        position: 'FW',
        country: 'Nepal',
        role: 'user'
      });
      console.log('✅ Created test athlete: athlete@example.com / athlete123');
    } else {
      console.log('ℹ️ Test athlete already exists');
    }
    
    // Create test league
    const leagueExists = await League.findOne({ where: { name: 'Test League' } });
    if (!leagueExists) {
      await League.create({
        name: 'Test League',
        startDate: '2023-01-01',
        endDate: '2023-12-31'
      });
      console.log('✅ Created test league');
    } else {
      console.log('ℹ️ Test league already exists');
    }
    
    console.log('\n✅ Sample data creation complete!');
    console.log('🔑 Login with admin@eskore.com / admin123');
    
  } catch (error) {
    console.error('❌ Error creating sample data:', error);
    return false;
  }
  return true;
}

// Run with proper cleanup
createSampleData()
  .then(success => {
    try {
      sequelize.close()
        .then(() => {
          console.log('Database connection closed');
          process.exit(success ? 0 : 1);
        })
        .catch(err => {
          console.error('Error closing database connection:', err);
          process.exit(1);
        });
    } catch (err) {
      console.error('Error during cleanup:', err);
      process.exit(1);
    }
  });

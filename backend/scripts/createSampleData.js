/**
 * Creates sample data for testing
 */
require('dotenv').config();
const bcrypt = require('bcrypt');
const sequelize = require('../src/config/db'); // Fix: Import directly, not as destructured
const User = require('../src/models/User');
const Athlete = require('../src/models/Athlete');
const Team = require('../src/models/Team');
const League = require('../src/models/League');
const Match = require('../src/models/Match');
const logger = require('../src/utils/logger');

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
    
    // Create test athlete
    const athleteExists = await Athlete.findOne({ where: { email: 'athlete@example.com' } });
    if (!athleteExists) {
      const athleteHash = await bcrypt.hash('athlete123', 10);
      await Athlete.create({
        firstName: 'Test',
        lastName: 'Athlete',
        email: 'athlete@example.com',
        passwordHash: athleteHash,
        dob: '2000-01-01',
        height: 180,
        position: 'FW',
        country: 'Nepal',
        province: 'province1',
        district: 'taplejung',
        city: 'phungling'
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
  } finally {
    process.exit();
  }
}

createSampleData();

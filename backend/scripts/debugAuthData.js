require('dotenv').config();
const Athlete = require('../src/models/Athlete');
const User = require('../src/models/User');
const Team = require('../src/models/Team');
const Manager = require('../src/models/Manager');

async function debugAuthData() {
  try {
    console.log('🔍 Checking authentication data in database...');
    
    // Check for athletes
    const athletes = await Athlete.findAll();
    console.log(`Found ${athletes.length} athletes:`);
    athletes.forEach(a => {
      console.log(`- ${a.firstName} ${a.lastName} (${a.email})`);
      console.log(`  Password hash: ${a.passwordHash ? a.passwordHash.substring(0,20) + '...' : 'None'}`);
    });

    // Check for users
    const users = await User.findAll();
    console.log(`\nFound ${users.length} users:`);
    users.forEach(u => {
      console.log(`- ${u.email} (${u.role})`);
    });

    // Check for teams
    const teams = await Team.findAll();
    console.log(`\nFound ${teams.length} teams:`);
    teams.forEach(t => {
      console.log(`- ${t.name} (${t.email || 'No email'})`);
    });

    // End with recommendations
    console.log('\n✅ Authentication data check complete');
    console.log('👉 If no users appear above, run seeders or createTestUser script');
    console.log('👉 If you see users but login fails, check for password hash issues');
  } catch (error) {
    console.error('❌ Error checking auth data:', error);
  } finally {
    process.exit();
  }
}

debugAuthData();

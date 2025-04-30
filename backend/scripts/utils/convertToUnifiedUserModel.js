/**
 * Script to migrate data from separated models (Athlete, Manager) to unified User model
 */
require('dotenv').config();
const bcrypt = require('bcrypt');
const User = require('../../src/models/User');
const Athlete = require('../../src/models/Athlete');
const Manager = require('../../src/models/Manager');
const Team = require('../../src/models/Team');
const Role = require('../../src/models/Role');
const UserRole = require('../../src/models/UserRole');
const UserTeam = require('../../src/models/UserTeam');

async function migrateData() {
  try {
    console.log('🔄 Starting migration to unified user model...');
    
    // Get all roles
    const roles = await Role.findAll();
    const roleMap = roles.reduce((map, role) => {
      map[role.name] = role.id;
      return map;
    }, {});
    
    // Step 1: Migrate athletes to users
    console.log('Migrating athletes...');
    const athletes = await Athlete.findAll();
    
    for (const athlete of athletes) {
      // Check if user already exists
      let user = await User.findOne({ where: { email: athlete.email } });
      
      if (!user) {
        // Create new user from athlete data
        user = await User.create({
          email: athlete.email,
          password: athlete.passwordHash || await bcrypt.hash('temp123', 10), // temporary password if none exists
          firstName: athlete.firstName,
          lastName: athlete.lastName,
          dob: athlete.dob,
          height: athlete.height,
          position: athlete.position,
          country: athlete.country,
          role: 'user'
        });
        
        console.log(`Created user for athlete: ${athlete.email}`);
      } else {
        // Update existing user with athlete data
        await user.update({
          firstName: athlete.firstName || user.firstName,
          lastName: athlete.lastName || user.lastName,
          dob: athlete.dob || user.dob,
          height: athlete.height || user.height,
          position: athlete.position || user.position,
          country: athlete.country || user.country
        });
        
        console.log(`Updated user with athlete data: ${athlete.email}`);
      }
      
      // Assign athlete role
      await UserRole.findOrCreate({
        where: {
          userId: user.id,
          roleId: roleMap.athlete
        }
      });
    }
    
    // Step 2: Migrate managers to users
    console.log('\nMigrating managers...');
    const managers = await Manager.findAll();
    
    for (const manager of managers) {
      // Check if user already exists
      let user = await User.findOne({ where: { email: manager.email } });
      
      if (!user) {
        // Create new user from manager data
        user = await User.create({
          email: manager.email,
          password: manager.passwordHash || await bcrypt.hash('temp123', 10),
          firstName: manager.firstName,
          lastName: manager.lastName,
          role: 'user'
        });
        
        console.log(`Created user for manager: ${manager.email}`);
      } else {
        // Update existing user with manager data
        await user.update({
          firstName: manager.firstName || user.firstName,
          lastName: manager.lastName || user.lastName
        });
        
        console.log(`Updated user with manager data: ${manager.email}`);
      }
      
      // Assign manager role
      await UserRole.findOrCreate({
        where: {
          userId: user.id,
          roleId: roleMap.manager
        }
      });
      
      // Add team relationship if manager has a team
      if (manager.teamId) {
        await UserTeam.findOrCreate({
          where: {
            userId: user.id,
            teamId: manager.teamId,
            role: 'manager'
          }
        });
        
        console.log(`Linked manager to team ID: ${manager.teamId}`);
      }
    }
    
    console.log('\n✅ Migration complete!');
    
  } catch (error) {
    console.error('❌ Migration error:', error);
  }
}

// Run the migration
migrateData()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });

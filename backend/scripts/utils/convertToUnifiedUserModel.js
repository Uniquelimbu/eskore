/**
 * [HISTORICAL REFERENCE ONLY - DO NOT USE]
 * Script that was used to migrate data from separated models (Athlete, Manager) to unified User model
 * 
 * This script is kept for documentation purposes but is no longer needed for regular operations
 * as the data migration has been completed. The models referenced are now deprecated.
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
const { sequelize } = require('../../src/config/db');

async function migrateData() {
  // Use a transaction to ensure data consistency
  const t = await sequelize.transaction();

  try {
    console.log('🔄 Starting migration to unified user model...');
    
    // Get all roles
    const roles = await Role.findAll({}, { transaction: t });
    const roleMap = roles.reduce((map, role) => {
      map[role.name] = role.id;
      return map;
    }, {});
    
    if (!roleMap.athlete || !roleMap.manager) {
      throw new Error('Required roles (athlete, manager) not found in database');
    }
    
    // Step 1: Migrate athletes to users
    console.log('Migrating athletes...');
    const athletes = await Athlete.findAll({}, { transaction: t });
    
    for (const athlete of athletes) {
      // Check if user already exists
      let user = await User.findOne({ 
        where: { email: athlete.email }
      }, { transaction: t });
      
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
        }, { transaction: t });
        
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
        }, { transaction: t });
        
        console.log(`Updated user with athlete data: ${athlete.email}`);
      }
      
      // Assign athlete role
      await UserRole.findOrCreate({
        where: {
          userId: user.id,
          roleId: roleMap.athlete
        },
        transaction: t
      });
    }
    
    // Step 2: Migrate managers to users
    console.log('\nMigrating managers...');
    const managers = await Manager.findAll({}, { transaction: t });
    
    for (const manager of managers) {
      // Check if user already exists
      let user = await User.findOne({ 
        where: { email: manager.email }
      }, { transaction: t });
      
      if (!user) {
        // Create new user from manager data
        user = await User.create({
          email: manager.email,
          password: manager.passwordHash || await bcrypt.hash('temp123', 10),
          firstName: manager.firstName,
          lastName: manager.lastName,
          role: 'user'
        }, { transaction: t });
        
        console.log(`Created user for manager: ${manager.email}`);
      } else {
        // Update existing user with manager data
        await user.update({
          firstName: manager.firstName || user.firstName,
          lastName: manager.lastName || user.lastName
        }, { transaction: t });
        
        console.log(`Updated user with manager data: ${manager.email}`);
      }
      
      // Assign manager role
      await UserRole.findOrCreate({
        where: {
          userId: user.id,
          roleId: roleMap.manager
        },
        transaction: t
      });
      
      // Add team relationship if manager has a team
      if (manager.teamId) {
        await UserTeam.findOrCreate({
          where: {
            userId: user.id,
            teamId: manager.teamId,
            role: 'manager'
          },
          transaction: t
        });
        
        console.log(`Linked manager to team ID: ${manager.teamId}`);
      }
    }
    
    // Commit the transaction
    await t.commit();
    console.log('\n✅ Migration complete!');
    
  } catch (error) {
    // Rollback on error
    await t.rollback();
    console.error('❌ Migration error:', error);
    throw error;
  }
}

// Run the migration if this script is executed directly
if (require.main === module) {
  migrateData()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

// Export for potential use in other scripts
module.exports = { migrateData };

/**
 * Migrate athlete data to unified User model
 * This script moves Athlete records to the User table
 * 
 * Usage: node scripts/utils/migrateAthleteData.js
 */
require('dotenv').config();
const bcrypt = require('bcrypt');
const User = require('../../src/models/User');
const Athlete = require('../../src/models/Athlete');
const { ApiError } = require('../../src/middleware/errorHandler');
const logger = require('../../src/utils/logger');

async function migrateAthleteData() {
  try {
    console.log('🔄 Starting migration of athlete data to user table...');
    
    // Find all athletes that don't have corresponding user records
    const athletes = await Athlete.findAll({
      attributes: ['id', 'firstName', 'lastName', 'email', 'passwordHash', 'dob', 'height', 'position', 'country']
    });
    
    console.log(`Found ${athletes.length} athlete records to process`);
    
    let migrated = 0;
    let skipped = 0;
    
    // Process each athlete
    for (const athlete of athletes) {
      // Check if user already exists
      const existingUser = await User.findOne({ 
        where: { email: athlete.email }
      });
      
      if (existingUser) {
        console.log(`Skipping ${athlete.email}: User record already exists`);
        skipped++;
        continue;
      }
      
      // Create user record
      await User.create({
        firstName: athlete.firstName,
        lastName: athlete.lastName,
        email: athlete.email,
        password: athlete.passwordHash || await bcrypt.hash('defaultPassword123', 10), // Use existing hash or create new one
        role: 'user',
        dob: athlete.dob,
        height: athlete.height,
        position: athlete.position,
        country: athlete.country
      });
      
      console.log(`✅ Migrated athlete ${athlete.email} to user table`);
      migrated++;
    }
    
    console.log('\n✅ Migration complete');
    console.log(`Migrated: ${migrated} records`);
    console.log(`Skipped: ${skipped} records (already exist in user table)`);
    
  } catch (error) {
    console.error('❌ Error during migration:', error);
  }
}

migrateAthleteData();

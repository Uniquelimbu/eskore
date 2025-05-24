/**
 * Database Schema Verification Script
 * 
 * This script checks the actual database schema against model definitions
 * to help identify and fix discrepancies.
 * 
 * Usage: node scripts/db/verifySchema.js
 */
require('dotenv').config();
const sequelize = require('../../src/config/db');
const { Team, User, Tournament } = require('../../src/models');

// ANSI color codes for prettier console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

async function verifySchema() {
  console.log(`${colors.blue}Verifying database schema...${colors.reset}`);
  
  try {
    await sequelize.authenticate();
    console.log(`${colors.green}✅ Database connection successful${colors.reset}`);
    
    // Get the query interface to examine tables
    const queryInterface = sequelize.getQueryInterface();
    
    // Check teams table
    console.log(`\n${colors.blue}Checking 'teams' table:${colors.reset}`);
    try {
      const teamsDescription = await queryInterface.describeTable('teams');
      console.log(`${colors.green}✅ Found 'teams' table${colors.reset}`);
      
      // Check for creatorId and createdBy columns
      if (teamsDescription.creatorId) {
        console.log(`${colors.green}✅ 'creatorId' column exists${colors.reset}`);
      } else {
        console.log(`${colors.red}❌ 'creatorId' column missing${colors.reset}`);
      }
      
      if (teamsDescription.createdBy) {
        console.log(`${colors.yellow}⚠️ 'createdBy' column exists (possible duplicate of creatorId)${colors.reset}`);
      }
      
      // Compare model attributes with table columns
      const teamModelAttributes = Object.keys(Team.rawAttributes);
      const teamTableColumns = Object.keys(teamsDescription);
      
      console.log(`\nComparing Team model attributes with database columns:`);
      
      const missingInDatabase = teamModelAttributes.filter(attr => 
        !teamTableColumns.includes(attr) && 
        !['createdAt', 'updatedAt'].includes(attr) &&
        !Team.rawAttributes[attr].field // Skip if the attribute maps to a different field name
      );
      
      const missingInModel = teamTableColumns.filter(col => 
        !teamModelAttributes.includes(col) && 
        !['createdAt', 'updatedAt'].includes(col)
      );
      
      if (missingInDatabase.length) {
        console.log(`${colors.red}❌ Attributes in model missing from database: ${missingInDatabase.join(', ')}${colors.reset}`);
      } else {
        console.log(`${colors.green}✅ All model attributes exist in database${colors.reset}`);
      }
      
      if (missingInModel.length) {
        console.log(`${colors.yellow}⚠️ Columns in database missing from model: ${missingInModel.join(', ')}${colors.reset}`);
      } else {
        console.log(`${colors.green}✅ All database columns exist in model${colors.reset}`);
      }
      
    } catch (error) {
      console.log(`${colors.red}❌ Error checking 'teams' table: ${error.message}${colors.reset}`);
    }
    
    // Check tournaments table
    console.log(`\n${colors.blue}Checking 'tournaments' table:${colors.reset}`);
    try {
      const tournamentsDescription = await queryInterface.describeTable('tournaments');
      console.log(`${colors.green}✅ Found 'tournaments' table${colors.reset}`);
      
      if (tournamentsDescription.creatorId) {
        console.log(`${colors.green}✅ 'creatorId' column exists${colors.reset}`);
      } else {
        console.log(`${colors.red}❌ 'creatorId' column missing${colors.reset}`);
      }
    } catch (error) {
      console.log(`${colors.red}❌ Error checking 'tournaments' table: ${error.message}${colors.reset}`);
    }
    
    console.log(`\n${colors.blue}Schema verification complete${colors.reset}`);
    
  } catch (error) {
    console.error(`${colors.red}Database connection failed: ${error.message}${colors.reset}`);
  } finally {
    await sequelize.close();
  }
}

// Run if this script is executed directly
if (require.main === module) {
  verifySchema().then(() => process.exit(0)).catch(() => process.exit(1));
}

module.exports = verifySchema;

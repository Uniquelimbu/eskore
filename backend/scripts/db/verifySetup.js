/**
 * Database verification script
 * Checks for common database setup issues and fixes them
 * 
 * Usage: node scripts/db/verifySetup.js
 */
require('dotenv').config();
const { Sequelize } = require('sequelize');
const bcrypt = require('bcrypt');
const User = require('../../src/models/User');
const sequelize = require('../../src/config/db');

// ANSI color codes for prettier console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m'
};

async function verifySetup() {
  console.log(`${colors.blue}🔍 Running eSkore database verification${colors.reset}`);
  console.log('========================================');
  
  // Connect to database
  try {
    await sequelize.authenticate();
    console.log(`${colors.green}✅ Database connection successful${colors.reset}`);
  } catch (error) {
    console.error(`${colors.red}❌ Database connection failed:${colors.reset}`, error.message);
    console.log(`\n${colors.yellow}Suggestions:${colors.reset}`);
    console.log('1. Check your .env file for correct database credentials');
    console.log('2. Make sure PostgreSQL is running');
    console.log('3. Try running: npm run db:migrate');
    process.exit(1);
  }
  
  // Check migrations
  console.log(`\n${colors.blue}Checking database migrations...${colors.reset}`);
  try {
    // Try to query the SequelizeMeta table to check migrations
    const [results] = await sequelize.query('SELECT * FROM "SequelizeMeta" ORDER BY name');
    console.log(`${colors.green}✅ Found ${results.length} applied migrations${colors.reset}`);
    
    // Show the last 3 migrations
    if (results.length > 0) {
      console.log(`${colors.gray}Recent migrations:${colors.reset}`);
      results.slice(-3).forEach(migration => {
        console.log(`${colors.gray}  - ${migration.name}${colors.reset}`);
      });
    }
  } catch (error) {
    if (error.message.includes('relation "SequelizeMeta" does not exist')) {
      console.log(`${colors.yellow}⚠️ No migrations have been applied yet${colors.reset}`);
      console.log('Run: npm run db:migrate');
    } else {
      console.error(`${colors.red}❌ Error checking migrations:${colors.reset}`, error.message);
    }
  }

  // Check for users table
  console.log(`\n${colors.blue}Checking users table...${colors.reset}`);
  try {
    const count = await User.count();
    console.log(`${colors.green}✅ Users table exists with ${count} user(s)${colors.reset}`);
    
    // If no users exist, suggest creating test users
    if (count === 0) {
      console.log(`${colors.yellow}⚠️ No users found in the database${colors.reset}`);
      console.log('Would you like to create test users? (y/n)');
      
      // For this script, we'll automatically create test users
      await createTestUsers();
    }
    
    // Check if standard test users exist
    await checkTestUsers();
    
  } catch (error) {
    handleDatabaseError(error);
  }
  
  // Check for schema mismatches
  console.log(`\n${colors.blue}Checking for schema mismatches...${colors.reset}`);
  await checkSchemaMismatches();
  
  // Close database connection
  await sequelize.close();
  console.log(`\n${colors.green}Verification complete!${colors.reset}`);
}

// Function to create test users
async function createTestUsers() {
  console.log(`\n${colors.blue}Creating test users...${colors.reset}`);
  
  try {
    // Create admin user
    const adminExists = await User.findOne({ 
      where: { email: 'admin@eskore.com' },
      attributes: ['id', 'email', 'role'] // Only select columns that are guaranteed to exist
    });
    
    if (!adminExists) {
      const adminUser = await User.create({
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@eskore.com',
        password: await bcrypt.hash('admin123', 10),
        role: 'admin',
        status: 'active'
      });
      console.log(`${colors.green}✅ Created admin user: admin@eskore.com / admin123${colors.reset}`);
    } else {
      console.log(`${colors.gray}Admin user already exists${colors.reset}`);
    }
    
    // Create test user
    const testExists = await User.findOne({ 
      where: { email: 'test@eskore.com' },
      attributes: ['id', 'email', 'role'] // Only select columns that are guaranteed to exist
    });
    
    if (!testExists) {
      const testUser = await User.create({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@eskore.com',
        password: await bcrypt.hash('Password123', 10),
        role: 'user',
        status: 'active'
      });
      console.log(`${colors.green}✅ Created test user: test@eskore.com / Password123${colors.reset}`);
    } else {
      console.log(`${colors.gray}Test user already exists${colors.reset}`);
    }
    
  } catch (error) {
    handleDatabaseError(error);
  }
}

// Function to check if test users exist and verify their passwords
async function checkTestUsers() {
  console.log(`\n${colors.blue}Checking test user accounts...${colors.reset}`);
  
  const testAccounts = [
    { email: 'admin@eskore.com', password: 'admin123', role: 'admin' },
    { email: 'test@eskore.com', password: 'Password123', role: 'user' }
  ];
  
  for (const account of testAccounts) {
    try {
      // Use a minimal query with only essential fields
      const user = await User.findOne({ 
        where: { email: account.email },
        attributes: ['id', 'email', 'password', 'role']
      });
      
      if (user) {
        console.log(`${colors.green}✓ Found user: ${account.email} (${account.role})${colors.reset}`);
        
        // Verify password
        try {
          const isValid = await user.validatePassword(account.password);
          if (isValid) {
            console.log(`${colors.green}  ✓ Password is correct${colors.reset}`);
          } else {
            console.log(`${colors.yellow}  ⚠️ Password is incorrect${colors.reset}`);
            console.log(`  Would you like to update the password to "${account.password}"? (y/n)`);
            // Auto-fix for this script
            user.password = await bcrypt.hash(account.password, 10);
            await user.save();
            console.log(`${colors.green}  ✓ Password updated${colors.reset}`);
          }
        } catch (error) {
          console.error(`${colors.red}  ❌ Error validating password:${colors.reset}`, error.message);
        }
      } else {
        console.log(`${colors.yellow}⚠️ User not found: ${account.email}${colors.reset}`);
      }
    } catch (error) {
      handleDatabaseError(error);
    }
  }
}

// Function to check for schema mismatches
async function checkSchemaMismatches() {
  try {
    // Check if User model attributes match database columns
    const userModel = User.rawAttributes;
    const queryInterface = sequelize.getQueryInterface();
    const tableDescription = await queryInterface.describeTable('users');
    
    // Find attributes in model but missing in database
    const missingColumns = [];
    for (const [attrName, attrDef] of Object.entries(userModel)) {
      // Skip special fields
      if (attrName === 'createdAt' || attrName === 'updatedAt' || attrName === 'deletedAt') continue;
      
      // Get field name (handle case where field name is different from attribute name)
      const fieldName = attrDef.field || attrName;
      
      if (!tableDescription[fieldName]) {
        missingColumns.push({
          name: fieldName,
          type: attrDef.type.constructor.name
        });
      }
    }
    
    if (missingColumns.length > 0) {
      console.log(`${colors.yellow}⚠️ Found ${missingColumns.length} missing columns in the users table:${colors.reset}`);
      missingColumns.forEach(col => {
        console.log(`   - ${col.name} (${col.type})`);
      });
      
      console.log(`\n${colors.yellow}Run the following to apply the missing migrations:${colors.reset}`);
      console.log(`   npm run db:migrate`);
      
      if (missingColumns.some(col => col.name === 'lastLogin')) {
        console.log(`\n${colors.yellow}The 'lastLogin' column is missing. This is used for tracking user login times.${colors.reset}`);
        console.log(`Apply the included migration: 20250516-add-lastLogin-to-users.js`);
      }
    } else {
      console.log(`${colors.green}✅ Database schema matches model definitions${colors.reset}`);
    }
  } catch (error) {
    handleDatabaseError(error);
  }
}

// Helper function to handle database errors
function handleDatabaseError(error) {
  if (error.message.includes('column') && error.message.includes('does not exist')) {
    console.log(`${colors.yellow}⚠️ Schema mismatch detected: ${error.message}${colors.reset}`);
    console.log(`This indicates your database schema doesn't match your model definitions.`);
    console.log(`Run: npm run db:migrate to apply any pending migrations.`);
  } else if (error.name === 'SequelizeDatabaseError' && error.message.includes('relation "users" does not exist')) {
    console.log(`${colors.red}❌ Users table not found${colors.reset}`);
    console.log(`Try running: npm run db:migrate`);
  } else {
    console.error(`${colors.red}❌ Database error:${colors.reset}`, error.message);
  }
}

// Run the verification
verifySetup().catch(error => {
  console.error(`${colors.red}Verification script error:${colors.reset}`, error);
  process.exit(1);
});

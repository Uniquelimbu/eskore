/**
 * Pre-start health check to verify all critical components are available
 * Useful to run before starting the server to ensure it will start correctly
 * 
 * Usage: node scripts/debug/preStartCheck.js
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { dbReady, sequelize } = require('../../src/config/db');

// Main function to run checks
async function runChecks() {
  console.log('🔍 Running pre-start health check...');
  let allPassed = true;

  // Check for critical files
  const criticalFiles = [
    'src/utils/safeSerializer.js',
    'src/models/init.js',
    'src/middleware/safeResponseMiddleware.js',
    'src/utils/serializationUtils.js',
    'src/utils/userUtils.js',
    'src/models/associations.js'
  ];

  // Check files exist
  console.log('\n1. Checking for required files...');
  criticalFiles.forEach(file => {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      console.log(`✅ ${file} - Found`);
    } else {
      console.error(`❌ ${file} - Missing!`);
      allPassed = false;
    }
  });

  // Check database config
  console.log('\n2. Checking database configuration...');
  try {
    const dbConfig = require('../../src/config/db');
    console.log('✅ Database configuration found');
    
    // Try to connect to database
    console.log('   Attempting database connection...');
    const isConnected = await dbReady;
    
    if (isConnected) {
      console.log('✅ Database connection successful');
    } else {
      console.error('❌ Database connection failed');
      allPassed = false;
    }
    
    // JWT check
    console.log('\n3. Checking JWT configuration...');
    if (process.env.JWT_SECRET && process.env.JWT_SECRET.length >= 8) {
      console.log('✅ JWT_SECRET is set and adequate length');
    } else {
      console.warn('⚠️ JWT_SECRET is missing or too short (< 8 chars)');
    }
    
    // Final result
    console.log('\n📋 Health check summary:');
    if (allPassed) {
      console.log('✅ All critical checks passed! Server should start successfully.');
    } else {
      console.log('❌ Some checks failed. Please address the issues before starting the server.');
    }

    return allPassed;
  } catch (error) {
    console.error('❌ Could not load database configuration:', error.message);
    return false;
  }
}

// Run checks and handle exit properly
runChecks()
  .then(passed => {
    // Close any open connections
    if (sequelize && typeof sequelize.close === 'function') {
      sequelize.close()
        .then(() => {
          process.exit(passed ? 0 : 1);
        })
        .catch(() => {
          process.exit(passed ? 0 : 1);
        });
    } else {
      process.exit(passed ? 0 : 1);
    }
  })
  .catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });

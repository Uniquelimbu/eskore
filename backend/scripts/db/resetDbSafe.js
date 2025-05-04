/**
 * Safely resets the database by undoing all migrations, reapplying them, and reseeding
 * This approach avoids dropping the database, which helps when there are connection issues
 * 
 * Usage: node scripts/db/resetDbSafe.js
 */
require('dotenv').config();
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);
const sequelize = require('../../src/config/db');

async function safeReset() {
  try {
    // Show environment information
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🗄️ Database: ${process.env.DB_NAME || 'postgres'}`);
    console.log(`🖥️ Host: ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '5433'}`);
    console.log('📝 Starting safe database reset (without dropping database)...');
    
    // Running migration undo all to clear schema
    console.log('1️⃣ Undoing all migrations...');
    const { stdout: undoOutput, stderr: undoError } = await execPromise('npx sequelize-cli db:migrate:undo:all');
    if (undoError) {
      console.log('⚠️ Undo migration warnings:');
      console.log(undoError);
    }
    console.log(undoOutput);
    
    // Run migrations again
    console.log('2️⃣ Reapplying migrations...');
    const { stdout: migrateOutput, stderr: migrateError } = await execPromise('npx sequelize-cli db:migrate');
    if (migrateError) {
      console.log('⚠️ Migration warnings:');
      console.log(migrateError);
    }
    console.log(migrateOutput);
    
    // Seed data
    console.log('3️⃣ Seeding database...');
    const { stdout: seedOutput, stderr: seedError } = await execPromise('npx sequelize-cli db:seed:all');
    if (seedError) {
      console.log('⚠️ Seed warnings:');
      console.log(seedError);
    }
    console.log(seedOutput);
    
    console.log('✅ Database safely reset successfully!');
  } catch (error) {
    console.error('❌ Error during safe database reset:', error.message);
    if (error.stdout) console.log(error.stdout);
    if (error.stderr) console.error(error.stderr);
    return false;
  }
  return true;
}

// Run the script with proper cleanup
safeReset()
  .then(success => {
    try {
      // Only try to close connection if we have access to sequelize methods
      if (sequelize && typeof sequelize.close === 'function') {
        sequelize.close()
          .then(() => {
            console.log('Database connection closed');
            process.exit(success ? 0 : 1);
          })
          .catch(err => {
            console.error('Error closing database connection:', err);
            process.exit(1);
          });
      } else {
        process.exit(success ? 0 : 1);
      }
    } catch (err) {
      console.error('Error during cleanup:', err);
      process.exit(1);
    }
  });

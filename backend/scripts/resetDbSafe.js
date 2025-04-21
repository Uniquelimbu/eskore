require('dotenv').config();
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

/**
 * This script provides a safer database reset method by:
 * 1. Undoing all migrations (which drops tables in the right order)
 * 2. Reapplying all migrations (which recreates tables)
 * 3. Reseeding the database
 * 
 * This avoids the need to drop the database itself, which can be problematic
 * when there are active connections.
 */
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
    process.exit(1);
  }
}

safeReset();

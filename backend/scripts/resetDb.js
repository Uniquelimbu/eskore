require('dotenv').config();
const { Pool } = require('pg');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

// Connect to the default postgres database, not our app database
const pgConfig = {
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || 'Authadja$4728',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5433,
  database: 'postgres' // Connect to PostgreSQL's default database instead
};

async function resetDatabase() {
  const pool = new Pool(pgConfig);
  const dbName = process.env.DB_NAME || 'postgres';
  
  try {
    console.log(`Terminating all connections to ${dbName}...`);
    // Terminate all connections to the database
    await pool.query(`
      SELECT pg_terminate_backend(pid)
      FROM pg_stat_activity 
      WHERE datname = $1 
        AND pid <> pg_backend_pid()
        AND state = 'active';
    `, [dbName]);
    
    // Add a small delay to ensure connections are fully closed
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log(`Dropping database ${dbName} if it exists...`);
    // Drop the database if it exists
    await pool.query(`DROP DATABASE IF EXISTS "${dbName}";`);

    console.log(`Creating database ${dbName}...`);
    // Create the database
    await pool.query(`CREATE DATABASE "${dbName}";`);

    console.log('Database created! Now applying migrations...');
  } catch (error) {
    console.error('Error resetting database:', error.message);
    console.log('\nTrying alternative approach with truncate tables...');
    return await truncateAllTables();
  } finally {
    // Close the connection to the postgres database
    await pool.end();
  }

  try {
    console.log('Running migrations...');
    // Run migrations
    await execPromise('npx sequelize-cli db:migrate');

    console.log('Running seeders...');
    // Run seeders
    await execPromise('npx sequelize-cli db:seed:all');

    console.log('✅ Database reset successfully!');
  } catch (error) {
    console.error('Error during migration or seeding:', error.message);
    process.exit(1);
  }
}

// Alternative approach - truncate all tables instead of dropping database
async function truncateAllTables() {
  try {
    console.log('Using fallback method: truncate all tables...');
    
    // Running migration undo all to clear schema
    console.log('Undoing all migrations...');
    await execPromise('npx sequelize-cli db:migrate:undo:all');
    
    // Run migrations again
    console.log('Reapplying migrations...');
    await execPromise('npx sequelize-cli db:migrate');
    
    // Seed data
    console.log('Seeding database...');
    await execPromise('npx sequelize-cli db:seed:all');
    
    console.log('✅ Database reset successfully using truncate method!');
  } catch (error) {
    console.error('Error during alternative reset approach:', error.message);
    process.exit(1);
  }
}

resetDatabase();

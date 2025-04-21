// src/config/db.js
require('dotenv').config();
const { Sequelize } = require('sequelize');

const DB_NAME = process.env.DB_NAME || 'eskore_db';
const DB_USER = process.env.DB_USER || 'postgres';
const DB_PASS = process.env.DB_PASS || 'password'; 
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || 5432;

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
  host: DB_HOST,
  port: DB_PORT,
  dialect: 'postgres',
  logging: process.env.NODE_ENV !== 'production' 
    ? (msg) => console.log(`[DATABASE]: ${msg}`)
    : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  dialectOptions: process.env.NODE_ENV === 'production' 
    ? {
        ssl: {
          require: true,
          rejectUnauthorized: false // For Heroku/AWS RDS
        }
      }
    : {}
});

// Test the connection with retry logic
const MAX_RETRIES = 5;
const RETRY_DELAY = 5000; // 5 seconds

const testConnection = async (retries = 0) => {
  try {
    console.log(`Testing database connection attempt ${retries + 1}/${MAX_RETRIES}...`);
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    
    if (retries < MAX_RETRIES - 1) {
      console.log(`Retrying in ${RETRY_DELAY / 1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return testConnection(retries + 1);
    } else {
      console.error('Max retries reached. Unable to connect to database.');
      // In production, you might want to exit the process or handle this case differently
      if (process.env.NODE_ENV === 'production') {
        process.exit(1);
      }
      return false;
    }
  }
};

// Export promise that resolves when connection is ready
const dbReady = testConnection();

module.exports = sequelize;
module.exports.dbReady = dbReady; // Export promise to allow waiting for connection

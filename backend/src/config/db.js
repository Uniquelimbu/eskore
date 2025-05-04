// src/config/db.js
require('dotenv').config();
const { Sequelize } = require('sequelize');
const logger = require('../utils/logger');

const DB_NAME = process.env.DB_NAME || 'eskore_db';
const DB_USER = process.env.DB_USER || 'postgres';
const DB_PASS = process.env.DB_PASS || ''; // No hardcoded password
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || 5432;

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
  host: DB_HOST,
  port: DB_PORT,
  dialect: 'postgres',
  logging: process.env.NODE_ENV !== 'production' 
    ? (msg) => logger.debug(`[DATABASE]: ${msg}`)
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

const testConnection = async (attempt = 1) => {
  try {
    console.log(`Testing database connection attempt ${attempt}/${MAX_RETRIES}...`);
    await sequelize.authenticate();
    logger.info('Database connection established successfully.');
    return true;
  } catch (error) {
    // Categorize error types for better handling
    const isCredentialsError = error.name === 'SequelizeAccessDeniedError' || 
                               error.message.includes('authentication failed');
    const isNetworkError = error.name === 'SequelizeConnectionRefusedError' || 
                           error.name === 'SequelizeHostNotFoundError' ||
                           error.message.includes('Connection refused');
    
    // Log based on error category
    if (isCredentialsError) {
      logger.error(`Database authentication failed (attempt ${attempt}/${MAX_RETRIES}):`, error);
      // Don't retry auth errors since they will likely fail again
      throw new Error('Database authentication failed. Check your credentials in .env file.');
    } else if (isNetworkError) {
      logger.error(`Database connection failed (attempt ${attempt}/${MAX_RETRIES}):`, error);
      // Only retry network-related errors
      if (attempt < MAX_RETRIES) {
        const delay = RETRY_DELAY * Math.pow(1.5, attempt - 1); // Exponential backoff
        logger.info(`Retrying in ${delay / 1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return testConnection(attempt + 1);
      }
    } else {
      // Other errors
      logger.error(`Database error (attempt ${attempt}/${MAX_RETRIES}):`, error);
    }
    
    if (attempt >= MAX_RETRIES) {
      logger.error('All connection attempts failed. Check your database configuration.');
      throw new Error('Failed to connect to database after multiple attempts');
    }
    
    // If we get here with a non-network error and still have retries, try again
    if (attempt < MAX_RETRIES) {
      const delay = RETRY_DELAY * Math.pow(1.5, attempt - 1);
      logger.info(`Retrying in ${delay / 1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return testConnection(attempt + 1);
    }
  }
};

// Ready promise to be used by server.js
const dbReady = testConnection().catch(err => {
  // Return false to maintain backward compatibility with code checking for boolean
  logger.error('Database connection promise rejected:', err.message);
  return false;
});

module.exports = sequelize;
module.exports.dbReady = dbReady;

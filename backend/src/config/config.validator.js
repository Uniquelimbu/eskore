const Joi = require('joi');
const logger = require('../utils/logger');

// Schema for environment variables
const envSchema = Joi.object({
  // Node environment
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  
  // Server settings
  PORT: Joi.number().default(5000),
  
  // JWT settings
  JWT_SECRET: Joi.string().min(8).default('temporary-jwt-secret-for-development-only'),
  
  // Database settings
  DB_NAME: Joi.string().required(),
  DB_USER: Joi.string().required(),
  DB_PASS: Joi.string().allow('').required(),
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().default(5432),
  
  // CORS settings
  ALLOWED_ORIGINS: Joi.string().default('http://localhost:3000'),
  
  // Feature flags
  DISABLE_CACHE: Joi.boolean().default(false),
  
  // Other optional settings
  LOG_LEVEL: Joi.string().valid('error', 'warn', 'info', 'http', 'debug').default('info')
})
.unknown(); // Allow unknown keys

/**
 * Validate environment variables against schema
 * @returns {Object} validated environment config
 */
function validateConfig() {
  try {
    // For development, create default values if missing
    const devDefaults = process.env.NODE_ENV !== 'production' ? {
      DB_NAME: process.env.DB_NAME || 'postgres',
      DB_USER: process.env.DB_USER || 'postgres',
      DB_PASS: process.env.DB_PASS || '', // Ensure no hardcoded password here
      DB_HOST: process.env.DB_HOST || 'localhost',
      ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS || 'http://localhost:3000',
      JWT_SECRET: process.env.JWT_SECRET || 'temporary-jwt-secret-for-development-only'
    } : {};
    
    // Combine environment with defaults for validation
    const env = { ...process.env, ...devDefaults };
    
    const { value: validatedEnv, error } = envSchema.validate(env);
    
    if (error) {
      logger.error(`Environment validation error: ${error.message}`);
      if (process.env.NODE_ENV === 'production') {
        process.exit(1);
      } else {
        console.warn('Continuing with default values in development mode');
        return env;
      }
    }
    
    // Block use of default JWT secret in production
    if (process.env.NODE_ENV === 'production' && 
        validatedEnv.JWT_SECRET === 'temporary-jwt-secret-for-development-only') {
      logger.error('CRITICAL SECURITY ERROR: Default JWT_SECRET used in production');
      process.exit(1);
    }
    
    return validatedEnv;
  } catch (error) {
    logger.error('Failed to validate environment variables:', error);
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    } else {
      console.warn('Continuing with default values in development mode');
      return process.env;
    }
  }
}

module.exports = validateConfig;

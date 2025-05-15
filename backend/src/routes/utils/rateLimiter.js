/**
 * Rate limiting utility for API request throttling
 * 
 * This utility provides customizable rate limiting for API endpoints to prevent abuse.
 */
const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const { formatError } = require('./responseFormatter');

// Connection details for Redis (if available)
const redisClient = process.env.REDIS_URL ? require('../../config/redis').client : null;

/**
 * Create a rate limiter middleware
 * @param {object} options - Rate limiter options
 * @returns {Function} Express middleware function
 */
const createRateLimiter = (options = {}) => {
  const defaultOptions = {
    windowMs: 15 * 60 * 1000, // 15 minutes by default
    max: 100, // 100 requests per windowMs
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Don't use the `X-RateLimit-*` headers
    message: (req, res) => {
      return formatError('Too many requests, please try again later', 429, 'RATE_LIMIT_EXCEEDED');
    },
    // Use Redis store if available, otherwise use memory store
    store: redisClient ? new RedisStore({
      sendCommand: (...args) => redisClient.sendCommand(args),
      prefix: 'ratelimit:'
    }) : undefined
  };

  // Merge with user options
  const limiterOptions = { ...defaultOptions, ...options };
  
  return rateLimit(limiterOptions);
};

/**
 * Predefined rate limiters for common scenarios
 */
const limiters = {
  // General API limiter
  api: createRateLimiter(),
  
  // Strict limiter for sensitive operations (login, registration)
  auth: createRateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // 10 requests per hour
    message: (req, res) => {
      return formatError('Too many authentication attempts, please try again later', 429, 'AUTH_RATE_LIMIT');
    }
  }),
  
  // Very restrictive limiter (password reset, etc.)
  sensitive: createRateLimiter({
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
    max: 3, // 3 requests per day
    message: (req, res) => {
      return formatError('Too many sensitive operation attempts, please try again tomorrow', 429, 'SENSITIVE_RATE_LIMIT');
    }
  })
};

module.exports = {
  createRateLimiter,
  limiters
};

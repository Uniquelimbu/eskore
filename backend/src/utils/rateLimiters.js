const { createLoginRateLimiter } = require('./customRateLimiter');
const logger = require('./logger');
const rateLimit = require('express-rate-limit');

// Health check limiter
const healthCheckLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // limit each IP to 20 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.status(429).end('{"error":{"message":"Too many health checks","code":"HEALTH_RATE_LIMIT"}}');
  }
});

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { message: 'Too many requests', code: 'RATE_LIMIT_EXCEEDED' } }
});

// Auth routes rate limiter (if needed elsewhere)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // More restrictive
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { message: 'Too many authentication attempts', code: 'AUTH_RATE_LIMIT' } }
});

// Failed login attempts rate limiter
const failedLoginLimiter = createLoginRateLimiter({
  standardHeaders: true,
  legacyHeaders: false,
  message: { 
    error: { 
      message: 'Too many failed login attempts. Please try again later.', 
      code: 'AUTH_RATE_LIMIT' 
    } 
  },
  handler: (req, res, next, options) => {
    logger.warn(`Rate limit reached for login attempts: IP=${req.ip}, email=${req.body?.email?.substring(0,3)}***`);
    res.status(options.statusCode).json(options.message);
  }
});

module.exports = {
  healthCheckLimiter,
  apiLimiter,
  authLimiter,
  failedLoginLimiter
};

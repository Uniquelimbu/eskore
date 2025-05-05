const { rateLimit } = require('express-rate-limit');
const { MemoryStore } = require('express-rate-limit');
const logger = require('./logger');

/**
 * Custom memory store for rate limiting that allows resetting specific keys
 * This extends the default MemoryStore to add methods for resetting on successful login
 */
class LoginAwareMemoryStore extends MemoryStore {
  constructor() {
    super();
    this.successfulLogins = new Map();
  }

  /**
   * Reset the rate limit counter for a specific key (IP address)
   * @param {string} key - The rate limit key (usually IP-based)
   */
  async resetKey(key) {
    // Remove this key from the store
    this.hits.delete(key);
    // Add to our successful logins tracking
    this.successfulLogins.set(key, Date.now());
    logger.debug(`Rate limit counter reset for key: ${key}`);
    return true;
  }

  /**
   * Override the increment method to check if this is a successful login IP
   */
  async increment(key) {
    // If this IP has a successful login recently (last 15 minutes), don't rate limit
    const successTime = this.successfulLogins.get(key);
    if (successTime && Date.now() - successTime < 15 * 60 * 1000) {
      logger.debug(`Skipping rate limit increment for recently successful login key: ${key}`);
      return { totalHits: 0, resetTime: Date.now() + 15 * 60 * 1000 };
    }
    
    // Otherwise use the standard implementation
    return super.increment(key);
  }
}

/**
 * Creates a rate limiter specifically designed for login attempts
 * - Counts only failed login attempts
 * - Resets counter on successful login
 * - Allows multiple login attempts from the same IP if previous attempts were successful
 */
function createLoginRateLimiter(options = {}) {
  const store = new LoginAwareMemoryStore();
  
  return rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // 10 failed attempts per windowMs
    standardHeaders: true, 
    legacyHeaders: false,
    message: { 
      error: { 
        message: 'Too many failed login attempts. Please try again later.', 
        code: 'AUTH_RATE_LIMIT' 
      } 
    },
    store,
    // Custom key generator that can include username for more precise limiting
    keyGenerator: (req) => {
      // Default to IP-based limiting
      const key = req.ip || req.headers['x-forwarded-for'] || 'unknown';
      
      // If we have a username/email in the request, make the key more specific
      // This allows rate limiting per username attempt from a specific IP
      if (req.body && req.body.email) {
        const email = String(req.body.email).toLowerCase().trim();
        // Using IP + masked email creates a balance of security and precision
        return `${key}:${email.substring(0, 3)}***`;
      }
      
      return key;
    },
    // Allow the controller to access the store to reset counters
    skipSuccessfulRequests: false,
    // Merge with any provided options
    ...options
  });
}

module.exports = {
  createLoginRateLimiter,
  LoginAwareMemoryStore
};

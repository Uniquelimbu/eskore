const Redis = require('ioredis');
const logger = require('./logger');

// Configure Redis client
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  db: process.env.REDIS_DB || 0,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  }
};

// Create Redis client
const client = new Redis(redisConfig);

// Add event listeners
client.on('connect', () => {
  logger.info('Redis connected');
});

client.on('error', (err) => {
  logger.error('Redis error', err);
});

/**
 * Cache middleware factory
 * @param {string} prefix - Cache key prefix
 * @param {function} keyGenerator - Function to generate cache key from request
 * @param {number} ttl - Cache TTL in seconds
 */
const cacheMiddleware = (prefix, keyGenerator, ttl = 300) => {
  return async (req, res, next) => {
    if (process.env.DISABLE_CACHE === 'true') {
      return next();
    }

    try {
      // Generate cache key
      const key = `${prefix}:${keyGenerator(req)}`;
      
      // Attempt to get from cache
      const cachedData = await client.get(key);
      
      if (cachedData) {
        logger.debug(`Cache hit: ${key}`);
        return res.json(JSON.parse(cachedData));
      }
      
      // Cache miss - store original send method
      const originalSend = res.send;
      
      // Override res.send to cache successful responses
      res.send = function (body) {
        if (res.statusCode < 400) {
          // Only cache successful responses
          client.setex(key, ttl, JSON.stringify(body))
            .catch(err => logger.error('Redis cache set error', { error: err, key }));
        }
        
        // Call original send
        return originalSend.call(this, body);
      };
      
      logger.debug(`Cache miss: ${key}`);
      next();
    } catch (err) {
      logger.error('Cache error', err);
      next(); // Continue without caching on error
    }
  };
};

// Cache operations
const cache = {
  get: async (key) => {
    try {
      const value = await client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error('Cache get error', { error, key });
      return null;
    }
  },
  
  set: async (key, value, ttl = 300) => {
    try {
      await client.setex(key, ttl, JSON.stringify(value));
      return true;
    } catch (error) {
      logger.error('Cache set error', { error, key });
      return false;
    }
  },
  
  del: async (key) => {
    try {
      await client.del(key);
      return true;
    } catch (error) {
      logger.error('Cache delete error', { error, key });
      return false;
    }
  },
  
  invalidatePattern: async (pattern) => {
    try {
      const keys = await client.keys(pattern);
      if (keys.length) {
        await client.del(keys);
        logger.info(`Invalidated ${keys.length} cache keys matching ${pattern}`);
      }
      return keys.length;
    } catch (error) {
      logger.error('Cache invalidation error', { error, pattern });
      return 0;
    }
  },
  
  client // Expose Redis client for advanced operations
};

module.exports = {
  cache,
  cacheMiddleware
};

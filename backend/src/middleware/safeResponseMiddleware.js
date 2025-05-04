const logger = require('../utils/logger');

/**
 * A more robust middleware to make all JSON responses safe
 * by handling circular references and other problematic data structures
 */
exports.safeJsonMiddleware = (req, res, next) => {
  // CRITICAL: Store original methods before overriding
  const originalJson = res.json;
  const originalSend = res.send;

  // Completely bypass middleware for health check endpoint and other critical routes
  if (req.path === '/api/health' || 
      req.bypassSerialization || 
      req.path === '/api/auth/logout') {
    next();
    return;
  }
  
  // Override the json method
  res.json = function safeJson(data) {
    try {
      // Simple primitive check first
      if (data === null || data === undefined) {
        return originalJson.call(this, data);
      }
      
      // Create a safe version of the data using a replacer function
      const safeData = JSON.parse(JSON.stringify(data, (key, value) => {
        // Handle circular references and complex objects
        if (key && typeof value === 'object' && value !== null) {
          // Very simple cycle detection - if value equals outer object, or key is very long
          if (value === data || key.length > 1000) {
            return '[Circular]';
          }
        }

        // Handle various problematic data types
        if (value instanceof Error) {
          return { message: value.message, name: value.name };
        }
        
        if (typeof value === 'function') {
          return '[Function]';
        }

        if (value instanceof Date) {
          return value.toISOString();
        }
        
        // Handle additional non-serializable types
        if (typeof value === 'symbol') {
          return value.toString();
        }
        
        if (typeof value === 'bigint') {
          return value.toString();
        }
        
        // Handle typed arrays and array buffers
        if (ArrayBuffer.isView(value) || value instanceof ArrayBuffer) {
          return '[Binary data]';
        }

        // For strings, check if they're excessively long and truncate if needed
        if (typeof value === 'string' && value.length > 10000) {
          return value.substring(0, 10000) + '... [truncated]';
        }
        
        return value;
      }));
      
      // Use original json method with safe data
      return originalJson.call(this, safeData);
    } catch (error) {
      // Critical error, fall back to super-safe minimal response
      console.error(`JSON serialization failed for ${req.path}: ${error.message}`);
      
      // Direct response for serialization errors
      res.status(500).setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ 
        success: false, 
        error: {
          message: 'Response serialization failed',
          path: req.path
        }
      }));
    }
  };
  
  // Also patch res.send to safely handle objects
  res.send = function safeSend(data) {
    try {
      // Skip serialization for non-objects or Buffer types
      if (typeof data !== 'object' || data === null || Buffer.isBuffer(data) || typeof data === 'string') {
        return originalSend.call(this, data);
      }

      // For objects, try the patched json method - catch any errors directly
      return this.json(data);
    } catch (error) {
      console.error(`Send serialization failed for ${req.path}: ${error.message}`);
      
      // Direct response for serialization errors
      res.status(500).setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({
        success: false,
        error: {
          message: 'Response processing failed', 
          path: req.path
        }
      }));
    }
  };
  
  next();
};

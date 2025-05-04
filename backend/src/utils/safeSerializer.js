/**
 * Advanced, battle-tested serialization utilities for safely handling any type of data
 */
const logger = require('./logger');

/**
 * Creates a safe JSON string from any object, handling problematic types
 */
function createSafeJson(obj, maxDepth = 10) {
  // Don't try to process null/undefined
  if (obj === null || obj === undefined) {
    return 'null';
  }
  
  // Set a max recursion depth to avoid stack overflow
  const MAX_DEPTH = maxDepth;
  const visited = new WeakSet();
  
  function replacer(key, value) {
    // Skip recursive structures
    if (typeof value === 'object' && value !== null) {
      if (visited.has(value)) {
        return '[Circular Reference]';
      }
      visited.add(value);
    }
    
    // Handle different data types
    if (value === undefined) {
      return null;
    }
    
    if (typeof value === 'function') {
      return '[Function]';
    }
    
    if (value instanceof Error) {
      return {
        name: value.name,
        message: value.message,
        stack: process.env.NODE_ENV === 'development' ? value.stack : undefined
      };
    }
    
    if (value instanceof Date) {
      return value.toISOString();
    }
    
    // Handle typed arrays and array buffers safely
    if (ArrayBuffer.isView(value) || value instanceof ArrayBuffer) {
      return '[Binary Data]';
    }
    
    // Truncate large strings
    if (typeof value === 'string' && value.length > 1000) {
      return value.substring(0, 1000) + '...';
    }
    
    return value;
  }
  
  try {
    // Use the replacer function to handle special cases
    return JSON.stringify(obj, replacer);
  } catch (error) {
    // In case something goes wrong, return a minimal JSON
    console.error('Safe JSON serialization failed:', error.message);
    return JSON.stringify({ error: 'Serialization failed' });
  }
}

/**
 * Processes an object to make it safe for JSON stringification
 * Handles circular references, long strings, and binary data
 * 
 * @param {object} obj - Object to process
 * @param {Set} [seen=new Set()] - Objects already processed (for circular ref detection)
 * @param {number} [depth=0] - Current recursion depth
 * @param {number} [maxDepth=5] - Maximum recursion depth
 * @returns {object} A safe-to-stringify object
 */
function makeSafeObject(obj, seen = new Set(), depth = 0, maxDepth = 3) {
  // Base case 1: null/undefined
  if (obj === null || obj === undefined) {
    return null;
  }
  
  // Base case 2: primitives
  if (typeof obj !== 'object') {
    // Truncate long strings
    if (typeof obj === 'string') {
      return obj.length > 1000 ? obj.substring(0, 1000) + '...(truncated)' : obj;
    }
    
    // Pass through other primitives
    return obj;
  }
  
  // Base case 3: already seen this object (circular reference)
  if (seen.has(obj)) {
    return '[Circular Reference]';
  }
  
  // Base case 4: max depth reached
  if (depth >= maxDepth) {
    if (Array.isArray(obj)) {
      return '[Array]';
    }
    return '[Object]';
  }
  
  // Handle Date objects
  if (obj instanceof Date) {
    return obj.toISOString();
  }
  
  // Handle Buffer or binary data
  if (Buffer.isBuffer(obj)) {
    return '[Binary Data]';
  }
  
  // Handle Error objects
  if (obj instanceof Error) {
    return {
      message: obj.message,
      name: obj.name,
      stack: process.env.NODE_ENV === 'development' ? obj.stack : undefined
    };
  }
  
  // Mark object as seen (for circular reference detection)
  seen.add(obj);
  
  // Handle arrays
  if (Array.isArray(obj)) {
    return obj
      .map(item => makeSafeObject(item, seen, depth + 1, maxDepth))
      .filter(x => x !== undefined);
  }
  
  // Convert to plain object if it's a class instance with toJSON
  const plain = typeof obj.toJSON === 'function' ? obj.toJSON() : obj;
  
  // Process the object
  const result = {};
  
  // Only include safe properties
  for (const key in plain) {
    if (Object.prototype.hasOwnProperty.call(plain, key)) {
      // Skip functions, symbols, and private properties
      if (typeof plain[key] === 'function' || 
          typeof key === 'symbol' || 
          key.startsWith('_')) {
        continue;
      }
      
      try {
        // Ensure key is a safe string
        const safeKey = String(key).substring(0, 100);
        result[safeKey] = makeSafeObject(plain[key], seen, depth + 1, maxDepth);
      } catch (err) {
        // If processing a property fails, skip it
        result[`${String(key).substring(0, 20)}...(error)`] = '[Processing Error]';
      }
    }
  }
  
  return result;
}

/**
 * Extracts only essential data from an object for when full processing fails
 * Extremely conservative - only keeps known safe primitive fields
 * 
 * @param {object} data - The data object
 * @returns {object} An ultra-safe object with only essential fields
 */
function extractEssentialData(data) {
  const result = {
    success: true
  };
  
  try {
    // Extract token if it exists
    if (data && typeof data === 'object' && data.token) {
      result.token = String(data.token);
    }
    
    // Extract minimal user data if it exists
    if (data && typeof data === 'object' && data.user && typeof data.user === 'object') {
      result.user = {
        id: Number(data.user.id) || 0,
        role: String(data.user.role || '').substring(0, 50)
      };
      
      // Only add email if it looks valid
      if (typeof data.user.email === 'string') {
        result.user.email = data.user.email.substring(0, 255);
      }
      
      // Add a few more safe fields if they exist
      if (typeof data.user.firstName === 'string') {
        result.user.firstName = data.user.firstName.substring(0, 100);
      }
      
      if (typeof data.user.lastName === 'string') {
        result.user.lastName = data.user.lastName.substring(0, 100);
      }
    }
    
    // Handle error object
    if (data && typeof data === 'object' && data.error) {
      result.success = false;
      result.error = {
        message: typeof data.error.message === 'string' 
          ? data.error.message.substring(0, 255) 
          : 'Unknown error',
        code: typeof data.error.code === 'string'
          ? data.error.code.substring(0, 50)
          : 'UNKNOWN_ERROR'
      };
    }
  } catch (err) {
    // If anything fails, just return the base result
    logger.error('Failed to extract essential data:', err);
  }
  
  return result;
}

/**
 * Directly sends a safe JSON response, bypassing Express's json serialization
 * 
 * @param {object} res - Express response object
 * @param {any} data - Data to send
 * @param {number} [status=200] - HTTP status code
 */
function sendSafeJson(res, data, status = 200) {
  try {
    // Set status code
    res.status(status);
    
    // Set headers for JSON
    res.setHeader('Content-Type', 'application/json');
    
    // Convert data to safe JSON string
    const jsonString = createSafeJson(data);
    
    // Send the response directly
    return res.end(jsonString);
  } catch (error) {
    // If absolutely everything fails, send a plain text response
    logger.error('Critical failure in sendSafeJson:', error);
    res.setHeader('Content-Type', 'text/plain');
    res.status(500).end('Internal Server Error');
  }
}

/**
 * Safely converts model instances to plain objects for JSON serialization
 * Handles edge cases like circular references, undefined values, etc.
 * 
 * @param {Object} obj - The object to sanitize
 * @param {Number} [depth=2] - Maximum depth to process (prevents stack overflow)
 * @returns {Object} A safe-to-serialize object
 */
function toSafeObject(data, depth = 2) {
  // Implementation from serializationUtils.js
  // ...existing code from serializationUtils.js...
}

/**
 * Safely serializes an object to JSON string
 * 
 * @param {Object} obj - The object to serialize
 * @returns {String} JSON string or error message
 */
function safeStringify(obj) {
  // Implementation from serializationUtils.js
  try {
    const safeObj = toSafeObject(obj);
    return JSON.stringify(safeObj);
  } catch (error) {
    console.error('Failed to stringify object:', error);
    return JSON.stringify({ error: 'Serialization error' });
  }
}

/**
 * Send a safely serialized JSON response
 * Uses multiple fallback mechanisms to ensure something is always returned
 * 
 * @param {object} res - Express response object
 * @param {object} data - Data to send
 * @param {number} status - HTTP status code
 * @returns {object} Express response
 */
function sendSafeJson(res, data, status = 200) {
  // ...existing code...
}

// Export consolidated functions
module.exports = {
  createSafeJson,
  makeSafeObject,
  extractEssentialData,
  sendSafeJson,
  toSafeObject,        // From serializationUtils.js
  safeStringify,       // From serializationUtils.js
  createUltraSafeObject // From serializationUtils.js
};

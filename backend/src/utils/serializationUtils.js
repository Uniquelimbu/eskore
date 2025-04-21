/**
 * Utilities for safely handling serialization of objects
 */

/**
 * Safely converts model instances to plain objects for JSON serialization
 * Handles edge cases like circular references, undefined values, etc.
 * 
 * @param {Object} obj - The object to sanitize
 * @param {Number} [depth=2] - Maximum depth to process (prevents stack overflow)
 * @returns {Object} A safe-to-serialize object
 */
function toSafeObject(data, depth = 2) {
  // Quick return for primitive types
  if (data === null || data === undefined) {
    return null;
  }
  
  if (typeof data !== 'object') {
    return data;
  }
  
  // Return a safe primitive for depth exceeded
  if (depth <= 0) {
    return typeof data === 'string' ? data.substring(0, 100) : 
           Array.isArray(data) ? [] : '[Object]';
  }
  
  // Handle Date objects
  if (data instanceof Date) {
    return data.toISOString();
  }
  
  // Use WeakSet to track objects and avoid circular references
  const visited = new WeakSet();
  
  // Process object or array recursively
  function safeProcess(obj) {
    // Handle null and primitive values directly
    if (obj === null || obj === undefined) {
      return null;
    }
    
    if (typeof obj !== 'object') {
      // For strings, truncate if too long
      if (typeof obj === 'string' && obj.length > 1000) {
        return obj.substring(0, 1000) + '...';
      }
      return obj;
    }
    
    // Handle Date objects
    if (obj instanceof Date) {
      return obj.toISOString();
    }
    
    // Check for circular references
    if (visited.has(obj)) {
      return '[Circular]';
    }
    
    // Add to visited objects
    visited.add(obj);
    
    // Handle arrays
    if (Array.isArray(obj)) {
      return obj.map(item => safeProcess(item)).filter(item => item !== undefined);
    }
    
    // Convert object to plain object if it has a toJSON method
    if (typeof obj.toJSON === 'function') {
      obj = obj.toJSON();
    }
    
    // Process plain object
    const result = {};
    for (const key in obj) {
      // Skip private properties and functions
      if (!key.startsWith('_') && 
          typeof obj[key] !== 'function' && 
          Object.prototype.hasOwnProperty.call(obj, key)) {
        try {
          // Very important: ensure keys are strings and not too long
          const safeKey = String(key).substring(0, 100);
          result[safeKey] = safeProcess(obj[key]);
        } catch (err) {
          // Ignore problematic properties
          continue;
        }
      }
    }
    
    return result;
  }
  
  // Start processing
  try {
    return safeProcess(data);
  } catch (error) {
    console.error('Fatal error in toSafeObject:', error);
    return { error: 'Serialization failed' };
  }
}

/**
 * Safely serializes an object to JSON string
 * 
 * @param {Object} obj - The object to serialize
 * @returns {String} JSON string or error message
 */
function safeStringify(obj) {
  try {
    const safeObj = toSafeObject(obj);
    return JSON.stringify(safeObj);
  } catch (error) {
    console.error('Failed to stringify object:', error);
    return JSON.stringify({ error: 'Serialization error' });
  }
}

/**
 * Create an ultra safe minimal object with only primitive values
 * Use this as a last resort when all other serialization attempts fail
 * 
 * @param {Object} obj - The object to make ultra-safe
 * @returns {Object} An object with only primitive values
 */
function createUltraSafeObject(obj) {
  // Start with empty object
  const safeObj = {};
  
  // Only add known safe primitive values
  if (obj) {
    // Handle ID (convert to number)
    if ('id' in obj) {
      safeObj.id = parseInt(obj.id, 10) || 0;
    }
    
    // Handle email (ensure string)
    if ('email' in obj) {
      safeObj.email = String(obj.email || '').substring(0, 255);
    }
    
    // Handle role (ensure string)
    if ('role' in obj) {
      safeObj.role = String(obj.role || 'user').substring(0, 50);
    }
    
    // Handle firstName (ensure string)
    if ('firstName' in obj) {
      safeObj.firstName = String(obj.firstName || '').substring(0, 100);
    }
    
    // Handle lastName (ensure string)
    if ('lastName' in obj) {
      safeObj.lastName = String(obj.lastName || '').substring(0, 100);
    }
  }
  
  return safeObj;
}

module.exports = {
  toSafeObject,
  safeStringify,
  createUltraSafeObject
};

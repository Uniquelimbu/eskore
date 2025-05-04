/**
 * Utility functions for safe data serialization
 * Used by safeSerializer.js to prevent circular reference and other serialization issues
 */
const logger = require('./logger');

/**
 * Safely stringifies an object by handling circular references
 * @param {any} obj Object to stringify
 * @param {number} [maxDepth=10] Maximum depth to traverse
 * @returns {string} JSON string
 */
const safeStringify = (obj, maxDepth = 10) => {
  const seen = new WeakSet();
  
  return JSON.stringify(obj, (key, value) => {
    // Skip __proto__ properties
    if (key === '__proto__') {
      return undefined;
    }

    // Handle non-object values normally
    if (typeof value !== 'object' || value === null) {
      return value;
    }
    
    // Handle special objects
    if (value instanceof Error) {
      return { 
        name: value.name, 
        message: value.message, 
        stack: value.stack 
      };
    }
    
    if (value instanceof Date) {
      return value.toISOString();
    }
    
    if (value instanceof RegExp) {
      return value.toString();
    }
    
    if (value instanceof Map) {
      return { 
        dataType: 'Map', 
        value: Array.from(value.entries()) 
      };
    }
    
    if (value instanceof Set) {
      return { 
        dataType: 'Set', 
        value: Array.from(value) 
      };
    }
    
    if (ArrayBuffer.isView(value)) {
      return '[Binary data]';
    }
    
    // Check for circular references
    if (seen.has(value)) {
      return '[Circular]';
    }
    
    // Check depth
    if (maxDepth <= 0) {
      return '[Object]';
    }
    
    // For objects, track and recursively process with reduced depth
    seen.add(value);
    
    // Handle arrays
    if (Array.isArray(value)) {
      return value;
    }
    
    // Handle plain objects with reduced depth
    const result = {};
    Object.keys(value).forEach(objKey => {
      try {
        result[objKey] = JSON.parse(JSON.stringify(value[objKey], replacer(maxDepth - 1)));
      } catch (err) {
        result[objKey] = '[Unserializable]';
      }
    });
    
    return result;
  });
};

/**
 * Creates a replacer function for JSON.stringify with depth control
 * @param {number} maxDepth Maximum depth to traverse
 * @returns {function} Replacer function
 */
const replacer = (maxDepth) => {
  const seen = new WeakSet();
  return function(key, value) {
    if (typeof value !== 'object' || value === null) {
      return value;
    }
    
    if (seen.has(value)) {
      return '[Circular]';
    }
    
    if (maxDepth <= 0) {
      if (Array.isArray(value)) {
        return '[Array]';
      }
      return '[Object]';
    }
    
    seen.add(value);
    return value;
  };
};

/**
 * Sanitizes an object by removing sensitive fields
 * @param {object} obj Object to sanitize
 * @param {string[]} sensitiveFields Fields to remove
 * @returns {object} Sanitized object
 */
const sanitizeObject = (obj, sensitiveFields = ['password', 'passwordHash', 'token', 'secret']) => {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }
  
  const result = { ...obj };
  
  sensitiveFields.forEach(field => {
    if (field in result) {
      delete result[field];
    }
  });
  
  return result;
};

/**
 * Safely truncates long strings to a maximum length
 * @param {string} str String to truncate
 * @param {number} maxLength Maximum string length
 * @returns {string} Truncated string
 */
const truncateString = (str, maxLength = 1000) => {
  if (typeof str !== 'string') {
    return str;
  }
  
  if (str.length <= maxLength) {
    return str;
  }
  
  return str.substring(0, maxLength) + `... [${str.length - maxLength} more characters]`;
};

module.exports = {
  safeStringify,
  replacer,
  sanitizeObject,
  truncateString
};

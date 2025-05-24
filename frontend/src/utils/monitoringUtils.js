import apiClient from '../services/apiClient';

/**
 * Check server health and performance
 * @returns {Promise<Object>} Health check result
 */
export const checkServerHealth = async () => {
  try {
    console.log('Checking server health...');
    const start = performance.now();
    const response = await apiClient.get('/health', { timeout: 5000 });
    const end = performance.now();
    
    const responseTime = Math.round(end - start);
    
    // Log warning if response time is high
    if (responseTime > 3000) {
      console.warn(`Server health check took ${responseTime}ms - performance issues detected`);
    }
    
    return {
      status: 'healthy',
      responseTime,
      serverInfo: response,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Server health check failed:', error);
    return {
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
};

/**
 * Monitor performance of API operations
 * @param {string} operation - Name of the operation
 * @param {function} fn - Async function to monitor
 * @param {any[]} args - Arguments to pass to the function
 * @returns {Promise<any>} Result of the function
 */
export const monitorPerformance = async (operation, fn, ...args) => {
  const start = performance.now();
  try {
    const result = await fn(...args);
    const end = performance.now();
    
    const responseTime = Math.round(end - start);
    
    // Log if operation took too long
    if (responseTime > 5000) {
      console.warn(`Operation ${operation} took ${responseTime}ms to complete`);
    } else {
      console.log(`Operation ${operation} completed in ${responseTime}ms`);
    }
    
    return result;
  } catch (error) {
    const end = performance.now();
    console.error(`Operation ${operation} failed after ${Math.round(end - start)}ms:`, error);
    throw error;
  }
};

/**
 * Field validation utilities
 */
export const validators = {
  /**
   * Validate team abbreviation
   * @param {string} value - Abbreviation to validate
   * @returns {boolean|string} true if valid, error message if invalid
   */
  teamAbbreviation: (value) => {
    if (!value) return true; // Optional
    if (value.length < 2 || value.length > 3) {
      return 'Abbreviation must be 2-3 characters';
    }
    if (!/^[a-zA-Z0-9]+$/.test(value)) {
      return 'Abbreviation can only contain letters and numbers';
    }
    return true;
  },
  
  /**
   * Validate founded year
   * @param {string|number} value - Year to validate
   * @returns {boolean|string} true if valid, error message if invalid
   */
  foundedYear: (value) => {
    if (!value) return true; // Optional
    const year = parseInt(value);
    const currentYear = new Date().getFullYear();
    if (isNaN(year) || year < 1800 || year > currentYear) {
      return `Year must be between 1800 and ${currentYear}`;
    }
    return true;
  }
};

export default {
  checkServerHealth,
  monitorPerformance
};

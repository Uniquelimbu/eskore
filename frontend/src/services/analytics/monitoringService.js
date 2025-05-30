/**
 * Check server health and performance
 * @returns {Promise<Object>} Health check result
 */
export const checkServerHealth = async () => {
  // ... existing code ...
};

/**
 * Monitor performance of API operations
 * @param {string} operation - Name of the operation
 * @param {function} fn - Async function to monitor
 * @param {any[]} args - Arguments to pass to the function
 * @returns {Promise<any>} Result of the function
 */
export const monitorApiOperation = async (operation, fn, ...args) => {
  console.log(`Monitoring API operation: ${operation}`);
  const start = performance.now();
  
  try {
    const result = await fn(...args);
    const end = performance.now();
    const duration = Math.round(end - start);
    
    // Log performance data
    console.log(`API operation '${operation}' completed in ${duration}ms`);
    
    // Report slow operations
    if (duration > 1000) {
      console.warn(`Slow API operation detected: '${operation}' took ${duration}ms`);
    }
    
    return result;
  } catch (error) {
    const end = performance.now();
    const duration = Math.round(end - start);
    
    console.error(`API operation '${operation}' failed after ${duration}ms:`, error);
    throw error;
  }
}

// Create a named object for the default export instead of anonymous export
const monitoringService = {
  checkServerHealth,
  monitorApiOperation
};

export default monitoringService;

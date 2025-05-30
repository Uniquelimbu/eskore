import { circuitBreaker } from '../utils/circuitBreaker';

// Constants for error categorization
const ERROR_CATEGORIES = {
  NETWORK: 'network',
  SERVER: 'server',
  CLIENT: 'client',
  AUTH: 'auth',
  TIMEOUT: 'timeout',
  UNKNOWN: 'unknown'
};

// Helper to categorize errors for better handling
const categorizeError = (error) => {
  if (!error) return ERROR_CATEGORIES.UNKNOWN;
  
  // Network connectivity issues
  if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
    return ERROR_CATEGORIES.TIMEOUT;
  }
  
  if (error.code === 'ECONNREFUSED' || !error.response || error.message?.includes('Network Error')) {
    return ERROR_CATEGORIES.NETWORK;
  }
  
  // Server errors (5xx)
  if (error.response?.status >= 500) {
    return ERROR_CATEGORIES.SERVER;
  }
  
  // Auth errors
  if (error.response?.status === 401 || error.response?.status === 403) {
    return ERROR_CATEGORIES.AUTH;
  }
  
  // Client errors (4xx)
  if (error.response?.status >= 400 && error.response?.status < 500) {
    return ERROR_CATEGORIES.CLIENT;
  }
  
  return ERROR_CATEGORIES.UNKNOWN;
};

// Track repeated server errors to provide better diagnostics
const serverErrorTracker = {
  errors: new Map(),
  addError: function(url) {
    const count = this.errors.get(url) || 0;
    this.errors.set(url, count + 1);
    return count + 1;
  },
  getErrorCount: function(url) {
    return this.errors.get(url) || 0;
  },
  reset: function(url) {
    if (url) {
      this.errors.delete(url);
    } else {
      this.errors.clear();
    }
  }
};

// Reset error tracking every hour
setInterval(() => {
  serverErrorTracker.reset();
}, 3600000);

// Helper to enhance errors with additional context
const enrichError = (error, config = {}) => {
  const category = categorizeError(error);
  const status = error.response?.status || 0;
  const timestamp = new Date().toISOString();
  const requestId = `req-${timestamp}-${Math.random().toString(36).slice(2, 11)}`;
  
  // Create a standardized error object
  const enrichedError = {
    status,
    originalError: error,
    message: error.response?.data?.message || error.message || 'Unknown error occurred',
    category,
    timestamp,
    requestId,
    url: config.url,
    method: config.method?.toUpperCase(),
    retryable: [ERROR_CATEGORIES.NETWORK, ERROR_CATEGORIES.SERVER, ERROR_CATEGORIES.TIMEOUT].includes(category)
  };

  // Attach original error details
  if (error.response?.data) {
    enrichedError.data = error.response.data;
    
    // Map common REST error formats
    if (error.response.data.errors) {
      enrichedError.validationErrors = error.response.data.errors;
    }
  }
  
  // Track repeated server errors
  let errorCount = 0;
  if (category === ERROR_CATEGORIES.SERVER && config.url) {
    errorCount = serverErrorTracker.addError(config.url);
    enrichedError.repeatCount = errorCount;
    
    // Add more server context for debugging
    enrichedError.serverErrorContext = {
      traceId: error.response?.headers?.['x-trace-id'] || 'unknown',
      endpoint: config.baseURL + config.url,
      params: config.params || {},
      repeatCount: errorCount,
      lastErrorTime: new Date().toISOString()
    };
  }
  
  // For 500 errors, enhance with even more context
  if (status === 500) {
    // Notify circuit breaker about server error
    circuitBreaker.recordFailure();
    
    // Add guidance for common 500 error causes
    enrichedError.possibleCauses = [
      'Server-side exception not handled properly',
      'Database connection issue',
      'Server resource constraints',
      'API endpoint implementation error'
    ];
    
    // Add recommended client actions
    enrichedError.recommendedActions = [
      'Retry with exponential backoff',
      'Try alternative endpoint if available',
      'Use cached data if possible',
      'Fall back to default/mock data'
    ];
  }
  
  return enrichedError;
};

export const applyErrorInterceptor = (apiClient) => {
  apiClient.interceptors.response.use(
    (response) => {
      // Success handler - extract data from response
      
      // Validate response structure
      if (response && response.data !== undefined) {
        // Add diagnostics information
        if (process.env.NODE_ENV !== 'production') {
          console.debug(`API Success: ${response.config.method} ${response.config.url}`, {
            status: response.status,
            timing: response.headers['x-response-time'] || 'N/A',
            size: JSON.stringify(response.data).length
          });
        }
        
        return response.data;
      }
      
      // Handle empty responses
      if (!response || response.data === undefined) {
        console.warn('Empty response received:', response);
        return { success: true, warning: 'Empty response', data: null };
      }
      
      return response;
    },
    (error) => {
      // Error handler with enhanced diagnostics and recovery options
      
      // Capture diagnostic information
      const config = error.config || {};
      const requestUrl = config.url || 'unknown URL';
      const requestMethod = config.method || 'unknown method';
      
      // Determine if this is a critical endpoint that needs special handling
      const isCriticalEndpoint = 
        requestUrl.includes('/members') || 
        requestUrl.includes('/users') ||
        requestUrl.includes('/roster');
      
      // Enrich error with useful information for debugging and handling
      const enrichedError = enrichError(error, config);
      
      // Special handling for server errors
      if (enrichedError.category === ERROR_CATEGORIES.SERVER) {
        console.error(`Server error in ${requestMethod} ${requestUrl}:`, enrichedError);
        
        // For 500 errors, add information that helps debug server issues
        if (enrichedError.status === 500) {
          console.error('Additional 500 error context:', {
            serverErrorContext: enrichedError.serverErrorContext,
            requestId: enrichedError.requestId,
            url: enrichedError.url
          });
          
          // Auto-reset circuit breaker after delay for critical endpoints
          if (isCriticalEndpoint) {
            setTimeout(() => {
              circuitBreaker.reset();
              console.log(`Circuit breaker reset for critical endpoint: ${requestUrl}`);
            }, 15000); // Reset after 15 seconds for critical endpoints
          } else {
            setTimeout(() => {
              circuitBreaker.reset();
            }, 30000); // Reset after 30 seconds for other endpoints
          }
        }
      } else {
        // Handle other error types
        switch (enrichedError.category) {
          case ERROR_CATEGORIES.NETWORK:
            console.error(`Network error in ${requestMethod} ${requestUrl}:`, enrichedError.message);
            break;
            
          case ERROR_CATEGORIES.AUTH:
            console.warn(`Auth error in ${requestMethod} ${requestUrl}:`, enrichedError.message);
            
            // Add potential auth recovery logic here - refresh token, etc.
            break;
            
          case ERROR_CATEGORIES.TIMEOUT:
            console.warn(`Request timeout for ${requestMethod} ${requestUrl} after ${config.timeout || 'unknown'}ms`);
            break;
            
          default:
            console.error(`API Error (${enrichedError.category}) in ${requestMethod} ${requestUrl}:`, enrichedError);
        }
      }
      
      // Return the enriched error
      return Promise.reject(enrichedError);
    }
  );
  
  return apiClient;
};

export default applyErrorInterceptor;

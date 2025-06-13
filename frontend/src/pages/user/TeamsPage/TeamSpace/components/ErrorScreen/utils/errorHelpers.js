/**
 * Error Helper Utilities
 * Common helper functions for error handling and tracking
 */

import { ANALYTICS_EVENTS } from '../constants';

/**
 * Format error message for display
 * @param {*} error - Error object or string
 * @returns {string} Formatted error message
 */
export const formatErrorMessage = (error) => {
  if (!error) return 'An unknown error occurred';
  
  if (typeof error === 'string') {
    return error;
  }
  
  if (error instanceof Error) {
    return error.message || 'An unexpected error occurred';
  }
  
  if (error.message) {
    return error.message;
  }
  
  if (error.error) {
    return typeof error.error === 'string' ? error.error : error.error.message;
  }
  
  return 'An unknown error occurred';
};

/**
 * Generate unique error ID
 * @returns {string} Unique error identifier
 */
export const generateErrorId = () => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `err_${timestamp}_${random}`;
};

/**
 * Extract error type from error object
 * @param {*} error - Error object
 * @returns {string} Error type
 */
export const extractErrorType = (error) => {
  if (!error) return 'generic';
  
  // Check for specific error types
  if (error.code === 'NETWORK_ERROR' || error.name === 'NetworkError') {
    return 'network';
  }
  
  if (error.status === 403 || error.code === 'FORBIDDEN') {
    return 'permission';
  }
  
  if (error.status === 404 || error.code === 'NOT_FOUND') {
    return 'notFound';
  }
  
  if (error.status >= 500 || error.code === 'INTERNAL_ERROR') {
    return 'server';
  }
  
  if (error.code === 'TIMEOUT' || error.name === 'TimeoutError') {
    return 'timeout';
  }
  
  if (error.code === 'VALIDATION_ERROR' || error.name === 'ValidationError') {
    return 'validation';
  }
  
  if (error.status === 401 || error.code === 'UNAUTHORIZED') {
    return 'authentication';
  }
  
  if (error.status === 429 || error.code === 'RATE_LIMIT') {
    return 'rateLimit';
  }
  
  // Check error message for patterns
  const message = formatErrorMessage(error).toLowerCase();
  
  if (message.includes('network') || message.includes('connection')) {
    return 'network';
  }
  
  if (message.includes('timeout') || message.includes('took too long')) {
    return 'timeout';
  }
  
  if (message.includes('permission') || message.includes('access denied')) {
    return 'permission';
  }
  
  if (message.includes('not found') || message.includes('does not exist')) {
    return 'notFound';
  }
  
  if (message.includes('server error') || message.includes('internal error')) {
    return 'server';
  }
  
  return 'generic';
};

/**
 * Check if error is retryable
 * @param {*} error - Error object
 * @param {string} errorType - Error type
 * @returns {boolean} Whether error is retryable
 */
export const isErrorRetryable = (error, errorType) => {
  const nonRetryableTypes = ['permission', 'notFound', 'validation', 'authentication'];
  
  if (nonRetryableTypes.includes(errorType)) {
    return false;
  }
  
  // Check specific error codes
  if (error?.status === 403 || error?.status === 404 || error?.status === 401) {
    return false;
  }
  
  if (error?.code === 'PERMANENT_ERROR' || error?.permanent === true) {
    return false;
  }
  
  return true;
};

/**
 * Track error event for analytics
 * @param {string} eventName - Analytics event name
 * @param {Object} eventData - Event data
 */
export const trackErrorEvent = (eventName, eventData = {}) => {
  try {
    // Google Analytics 4
    if (window.gtag) {
      window.gtag('event', eventName, {
        ...eventData,
        timestamp: Date.now(),
        user_agent: navigator.userAgent,
        page_url: window.location.href
      });
    }
    
    // Custom analytics
    if (window.analytics) {
      window.analytics.track(eventName, eventData);
    }
    
    // Console logging in development
    if (process.env.NODE_ENV === 'development') {
      console.group('🔍 Error Analytics Event');
      console.log('Event:', eventName);
      console.log('Data:', eventData);
      console.groupEnd();
    }
  } catch (analyticsError) {
    console.warn('Failed to track error event:', analyticsError);
  }
};

/**
 * Sanitize error data for logging/analytics
 * @param {*} error - Error object
 * @returns {Object} Sanitized error data
 */
export const sanitizeErrorData = (error) => {
  const sanitized = {
    message: formatErrorMessage(error),
    type: extractErrorType(error),
    timestamp: new Date().toISOString(),
    url: window.location.href,
    userAgent: navigator.userAgent
  };
  
  // Add safe properties
  if (error?.status) sanitized.status = error.status;
  if (error?.code) sanitized.code = error.code;
  if (error?.name) sanitized.name = error.name;
  
  // Remove sensitive information
  const sensitiveKeys = ['password', 'token', 'key', 'secret', 'auth'];
  const cleanError = { ...error };
  
  sensitiveKeys.forEach(key => {
    if (cleanError[key]) {
      cleanError[key] = '[REDACTED]';
    }
  });
  
  return sanitized;
};

/**
 * Create error report data
 * @param {*} error - Error object
 * @param {Object} context - Additional context
 * @returns {Object} Error report data
 */
export const createErrorReport = (error, context = {}) => {
  const report = {
    id: generateErrorId(),
    ...sanitizeErrorData(error),
    context: {
      component: context.component,
      action: context.action,
      userId: context.userId,
      teamId: context.teamId,
      sessionId: context.sessionId,
      buildVersion: process.env.REACT_APP_VERSION,
      environment: process.env.NODE_ENV,
      ...context
    },
    browser: {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine
    },
    page: {
      url: window.location.href,
      referrer: document.referrer,
      title: document.title
    },
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height
    }
  };
  
  return report;
};

/**
 * Send error report to server
 * @param {Object} errorReport - Error report data
 * @returns {Promise} Report submission promise
 */
export const sendErrorReport = async (errorReport) => {
  try {
    const response = await fetch('/api/error-reports', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(errorReport)
    });
    
    if (!response.ok) {
      throw new Error(`Failed to send error report: ${response.status}`);
    }
    
    return await response.json();
  } catch (reportError) {
    console.error('Failed to send error report:', reportError);
    throw reportError;
  }
};

/**
 * Retry function with exponential backoff
 * @param {Function} fn - Function to retry
 * @param {Object} options - Retry options
 * @returns {Promise} Promise that resolves when function succeeds
 */
export const retryWithBackoff = async (fn, options = {}) => {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    backoffMultiplier = 2,
    maxDelay = 30000,
    onRetry = null
  } = options;
  
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxRetries) {
        break;
      }
      
      // Check if error is retryable
      const errorType = extractErrorType(error);
      if (!isErrorRetryable(error, errorType)) {
        break;
      }
      
      // Calculate delay with exponential backoff
      const delay = Math.min(
        baseDelay * Math.pow(backoffMultiplier, attempt),
        maxDelay
      );
      
      // Call retry callback
      if (onRetry) {
        await onRetry(attempt + 1, delay, error);
      }
      
      // Wait before next attempt
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
};

/**
 * Debounced error handler
 * @param {Function} handler - Error handler function
 * @param {number} delay - Debounce delay
 * @returns {Function} Debounced handler
 */
export const debounceErrorHandler = (handler, delay = 1000) => {
  let timeoutId;
  
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => handler(...args), delay);
  };
};

/**
 * Error boundary helper
 * @param {Error} error - Error object
 * @param {Object} errorInfo - Error info from React
 * @returns {Object} Processed error data
 */
export const processErrorBoundaryError = (error, errorInfo) => {
  const errorReport = createErrorReport(error, {
    component: 'ErrorBoundary',
    action: 'componentDidCatch',
    stack: errorInfo.componentStack,
    errorBoundary: true
  });
  
  // Track error boundary activation
  trackErrorEvent(ANALYTICS_EVENTS.ERROR_DISPLAYED, {
    errorType: 'boundary',
    errorMessage: error.message,
    componentStack: errorInfo.componentStack
  });
  
  return errorReport;
};

/**
 * Network error detector
 * @returns {boolean} Whether user is online
 */
export const isOnline = () => {
  return navigator.onLine;
};

/**
 * Check if error is due to network issues
 * @param {*} error - Error object
 * @returns {boolean} Whether error is network-related
 */
export const isNetworkError = (error) => {
  if (!isOnline()) return true;
  
  const errorType = extractErrorType(error);
  if (errorType === 'network') return true;
  
  const message = formatErrorMessage(error).toLowerCase();
  const networkKeywords = [
    'network',
    'connection',
    'offline',
    'internet',
    'dns',
    'timeout',
    'unreachable'
  ];
  
  return networkKeywords.some(keyword => message.includes(keyword));
};

/**
 * Get error recovery suggestions
 * @param {string} errorType - Error type
 * @param {*} error - Error object
 * @returns {Array} Array of recovery suggestions
 */
export const getErrorRecoverySuggestions = (errorType, error) => {
  const suggestions = {
    network: [
      'Check your internet connection',
      'Try refreshing the page',
      'Verify your network settings',
      'Contact your network administrator'
    ],
    permission: [
      'Contact your team administrator',
      'Check your account permissions',
      'Try signing out and back in',
      'Verify your team membership'
    ],
    notFound: [
      'Check the URL for typos',
      'Navigate using the menu',
      'Return to the homepage',
      'Search for the content'
    ],
    server: [
      'Try again in a few minutes',
      'Check the status page',
      'Clear your browser cache',
      'Contact support if issue persists'
    ],
    timeout: [
      'Try again with a slower connection',
      'Reduce the amount of data being processed',
      'Check your internet speed',
      'Try during off-peak hours'
    ],
    validation: [
      'Check the required fields',
      'Verify data format requirements',
      'Review validation messages',
      'Contact support for assistance'
    ]
  };
  
  return suggestions[errorType] || [
    'Try refreshing the page',
    'Clear your browser cache',
    'Try again later',
    'Contact support if the problem persists'
  ];
};

// Export all utilities
export default {
  formatErrorMessage,
  generateErrorId,
  extractErrorType,
  isErrorRetryable,
  trackErrorEvent,
  sanitizeErrorData,
  createErrorReport,
  sendErrorReport,
  retryWithBackoff,
  debounceErrorHandler,
  processErrorBoundaryError,
  isOnline,
  isNetworkError,
  getErrorRecoverySuggestions
};
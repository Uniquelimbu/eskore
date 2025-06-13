/**
 * Error Utility Functions
 * Common helper functions for error handling
 */

/**
 * Generate unique error event ID
 * @returns {string} Unique event ID
 */
export const generateEventId = () => {
  return `ts_error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Create detailed error information object
 * @param {Error} error - The error that was thrown
 * @param {Object} errorInfo - React error info
 * @param {Object} context - Additional context
 * @returns {Object} Detailed error information
 */
export const createErrorDetails = (error, errorInfo, context = {}) => {
  return {
    error: error.toString(),
    message: error.message,
    stack: error.stack,
    name: error.name,
    componentStack: errorInfo.componentStack,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href,
    pathname: window.location.pathname,
    search: window.location.search,
    referrer: document.referrer,
    userId: context.userId || 'unknown',
    teamId: context.teamId || 'unknown',
    section: context.section || 'unknown',
    sessionId: getSessionId(),
    buildVersion: process.env.REACT_APP_VERSION || 'unknown',
    errorType: classifyError(error),
    severity: getErrorSeverity(error),
    retryable: isRetryableError(error)
  };
};

/**
 * Classify error type automatically
 * @param {Error} error - Error to classify
 * @returns {string} Error type
 */
export const classifyError = (error) => {
  const message = error.message?.toLowerCase() || '';
  const name = error.name?.toLowerCase() || '';
  
  if (message.includes('network') || message.includes('fetch')) {
    return 'network_error';
  }
  
  if (message.includes('permission') || message.includes('unauthorized')) {
    return 'permission_error';
  }
  
  if (message.includes('timeout')) {
    return 'timeout_error';
  }
  
  if (message.includes('validation') || name.includes('validation')) {
    return 'validation_error';
  }
  
  if (name.includes('chunkerror') || message.includes('loading chunk')) {
    return 'chunk_load_error';
  }
  
  return 'component_error';
};

/**
 * Get or create session ID
 * @returns {string} Session identifier
 */
export const getSessionId = () => {
  let sessionId = sessionStorage.getItem('teamspace_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('teamspace_session_id', sessionId);
  }
  return sessionId;
};

/**
 * Sanitize error for logging
 * @param {Error} error - Error to sanitize
 * @returns {Object} Sanitized error object
 */
export const sanitizeError = (error) => {
  // Remove sensitive information from error messages
  const sensitivePatterns = [
    /password/gi,
    /token/gi,
    /key/gi,
    /secret/gi,
    /auth/gi,
    /api[_-]?key/gi,
    /bearer/gi
  ];

  let sanitizedMessage = error.message || '';
  let sanitizedStack = error.stack || '';

  sensitivePatterns.forEach(pattern => {
    sanitizedMessage = sanitizedMessage.replace(pattern, '[REDACTED]');
    sanitizedStack = sanitizedStack.replace(pattern, '[REDACTED]');
  });

  return {
    name: error.name,
    message: sanitizedMessage,
    stack: sanitizedStack
  };
};

/**
 * Check if error is retryable
 * @param {Error} error - Error to check
 * @returns {boolean} Whether error is retryable
 */
export const isRetryableError = (error) => {
  const retryablePatterns = [
    /network/i,
    /timeout/i,
    /fetch/i,
    /connection/i,
    /temporarily/i,
    /server.*error/i,
    /5\d\d/i // 5xx status codes
  ];

  const nonRetryablePatterns = [
    /permission/i,
    /unauthorized/i,
    /forbidden/i,
    /not.*found/i,
    /4\d\d/i // 4xx status codes (except timeout)
  ];

  const errorString = `${error.message} ${error.name}`;
  
  // Check non-retryable first
  if (nonRetryablePatterns.some(pattern => pattern.test(errorString))) {
    return false;
  }
  
  return retryablePatterns.some(pattern => pattern.test(errorString));
};

/**
 * Get error severity level
 * @param {Error} error - Error to evaluate
 * @returns {string} Severity level (low, medium, high, critical)
 */
export const getErrorSeverity = (error) => {
  const criticalPatterns = [
    /chunk.*load/i,
    /script.*error/i,
    /network.*error/i,
    /out.*of.*memory/i,
    /maximum.*call.*stack/i
  ];

  const highPatterns = [
    /reference.*error/i,
    /type.*error/i,
    /syntax.*error/i,
    /cannot.*read.*property/i,
    /undefined.*is.*not.*a.*function/i
  ];

  const mediumPatterns = [
    /validation/i,
    /permission/i,
    /unauthorized/i,
    /timeout/i
  ];

  const errorString = `${error.message} ${error.name}`;

  if (criticalPatterns.some(pattern => pattern.test(errorString))) {
    return 'critical';
  }

  if (highPatterns.some(pattern => pattern.test(errorString))) {
    return 'high';
  }

  if (mediumPatterns.some(pattern => pattern.test(errorString))) {
    return 'medium';
  }

  return 'low';
};

/**
 * Format error for display
 * @param {Error} error - Error to format
 * @returns {string} Formatted error message
 */
export const formatErrorMessage = (error) => {
  if (!error) return 'Unknown error occurred';
  
  // Remove technical stack trace info for user display
  let message = error.message || error.toString();
  
  // Clean up common React error messages
  message = message.replace(/^Error:\s*/i, '');
  message = message.replace(/\s*at\s+.*$/gm, ''); // Remove "at Component" parts
  
  // Capitalize first letter
  message = message.charAt(0).toUpperCase() + message.slice(1);
  
  return message;
};

/**
 * Check if error is a development error
 * @param {Error} error - Error to check
 * @returns {boolean} Whether error is development-related
 */
export const isDevelopmentError = (error) => {
  const devPatterns = [
    /hot.*reload/i,
    /webpack/i,
    /hmr/i,
    /dev.*server/i,
    /source.*map/i
  ];
  
  const errorString = `${error.message} ${error.stack}`;
  return devPatterns.some(pattern => pattern.test(errorString));
};
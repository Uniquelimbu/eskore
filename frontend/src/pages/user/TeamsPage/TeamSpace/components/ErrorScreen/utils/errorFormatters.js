/**
 * Error Formatters
 * Functions to format error messages and data for different contexts
 */

import { ERROR_TYPES, DEFAULT_ERROR_MESSAGES } from '../constants';
import { formatErrorMessage, generateErrorId } from './errorHelpers';

/**
 * Format error for user display
 * @param {*} error - Error object or message
 * @param {string} errorType - Error type
 * @param {Object} options - Formatting options
 * @returns {Object} Formatted error display data
 */
export const formatErrorForDisplay = (error, errorType = ERROR_TYPES.GENERIC, options = {}) => {
  const {
    includeErrorId = true,
    includeTimestamp = false,
    includeDetails = false,
    customTitle = null,
    customDescription = null,
    context = {},
    maxDescriptionLength = 500,
    sanitizeHtml = true
  } = options;

  const errorConfig = DEFAULT_ERROR_MESSAGES[errorType] || DEFAULT_ERROR_MESSAGES[ERROR_TYPES.GENERIC];
  const errorMessage = formatErrorMessage(error);
  const errorId = includeErrorId ? generateErrorId() : null;

  // Sanitize HTML if needed
  const sanitizeText = (text) => {
    if (!sanitizeHtml || typeof text !== 'string') return text;
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
  };

  // Truncate description if too long
  const truncateDescription = (text) => {
    if (!text || text.length <= maxDescriptionLength) return text;
    return text.substring(0, maxDescriptionLength - 3) + '...';
  };

  return {
    title: sanitizeText(customTitle || errorConfig.title),
    description: sanitizeText(truncateDescription(customDescription || errorConfig.description)),
    errorMessage: errorMessage !== (customDescription || errorConfig.description) ? sanitizeText(errorMessage) : null,
    errorId,
    timestamp: includeTimestamp ? new Date().toISOString() : null,
    errorType,
    severity: getSeverityLevel(errorType),
    category: getErrorCategory(errorType),
    icon: getErrorIcon(errorType),
    color: getErrorColor(errorType),
    details: includeDetails ? formatErrorDetails(error, context) : null,
    context: Object.keys(context).length > 0 ? context : null,
    actionText: errorConfig.actionText || 'Try Again',
    helpLink: getHelpLink(errorType),
    isRetryable: isErrorRetryable(errorType),
    userFriendly: true
  };
};

/**
 * Format error for logging
 * @param {*} error - Error object
 * @param {Object} context - Additional context
 * @returns {Object} Formatted error log data
 */
export const formatErrorForLogging = (error, context = {}) => {
  const timestamp = new Date().toISOString();
  const errorId = generateErrorId();
  
  return {
    errorId,
    timestamp,
    level: 'error',
    message: formatErrorMessage(error),
    error: {
      name: error?.name || 'Unknown',
      message: error?.message || 'No message',
      stack: error?.stack || null,
      code: error?.code || null,
      status: error?.status || null,
      type: error?.constructor?.name || 'Unknown'
    },
    context: {
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: Date.now(),
      performance: {
        timing: performance.now(),
        memory: getMemoryInfo()
      },
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      connection: getConnectionInfo(),
      ...context
    },
    structured: true
  };
};

/**
 * Format error for analytics
 * @param {*} error - Error object
 * @param {string} errorType - Error type
 * @param {Object} context - Additional context
 * @returns {Object} Formatted analytics data
 */
export const formatErrorForAnalytics = (error, errorType = ERROR_TYPES.GENERIC, context = {}) => {
  return {
    event_category: 'error',
    event_action: errorType,
    event_label: error?.message || formatErrorMessage(error),
    value: getSeverityScore(errorType),
    custom_parameters: {
      error_id: generateErrorId(),
      error_type: errorType,
      error_code: error?.code || null,
      error_status: error?.status || null,
      page_url: window.location.href,
      page_title: document.title,
      user_agent: navigator.userAgent,
      timestamp: Date.now(),
      session_id: getSessionId(),
      browser_info: getBrowserInfo(),
      device_info: getDeviceInfo(),
      ...context
    },
    send_to: 'google_analytics'
  };
};

/**
 * Format error details for technical display
 * @param {*} error - Error object
 * @param {Object} context - Additional context
 * @returns {Object} Formatted technical details
 */
export const formatErrorDetails = (error, context = {}) => {
  const details = {
    timestamp: new Date().toISOString(),
    error: null,
    browser: getBrowserInfo(),
    device: getDeviceInfo(),
    network: getNetworkInfo(),
    performance: getPerformanceInfo(),
    context
  };

  // Format error object
  if (error) {
    if (typeof error === 'string') {
      details.error = {
        type: 'string',
        message: error,
        serialized: error
      };
    } else if (error instanceof Error) {
      details.error = {
        type: error.constructor.name,
        name: error.name,
        message: error.message,
        stack: error.stack,
        code: error.code,
        status: error.status,
        serialized: JSON.stringify(error, Object.getOwnPropertyNames(error), 2)
      };
    } else {
      details.error = {
        type: typeof error,
        serialized: JSON.stringify(error, null, 2),
        toString: error.toString ? error.toString() : String(error)
      };
    }
  }

  return details;
};

/**
 * Format error for API reporting
 * @param {*} error - Error object
 * @param {Object} metadata - Additional metadata
 * @returns {Object} API-ready error report
 */
export const formatErrorForAPI = (error, metadata = {}) => {
  return {
    id: generateErrorId(),
    timestamp: new Date().toISOString(),
    version: process.env.REACT_APP_VERSION || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    error: {
      message: formatErrorMessage(error),
      type: error?.constructor?.name || 'Unknown',
      name: error?.name || 'Unknown',
      stack: error?.stack || null,
      code: error?.code || null,
      status: error?.status || null
    },
    browser: getBrowserInfo(),
    device: getDeviceInfo(),
    page: {
      url: window.location.href,
      title: document.title,
      referrer: document.referrer
    },
    user: {
      id: metadata.userId || null,
      sessionId: getSessionId(),
      teamId: metadata.teamId || null
    },
    performance: getPerformanceInfo(),
    network: getNetworkInfo(),
    metadata
  };
};

/**
 * Format error message for different audiences
 * @param {*} error - Error object
 * @param {string} audience - Target audience (user, developer, support)
 * @param {Object} options - Formatting options
 * @returns {string} Formatted error message
 */
export const formatErrorMessageForAudience = (error, audience = 'user', options = {}) => {
  const {
    includeErrorCode = false,
    includeTimestamp = false,
    maxLength = null
  } = options;

  let message = formatErrorMessage(error);
  
  switch (audience) {
    case 'user':
      // User-friendly, non-technical message
      message = getUserFriendlyMessage(error) || message;
      break;
      
    case 'developer':
      // Technical message with stack trace
      if (error?.stack) {
        message = `${message}\n\nStack Trace:\n${error.stack}`;
      }
      if (error?.code && includeErrorCode) {
        message = `[${error.code}] ${message}`;
      }
      break;
      
    case 'support':
      // Detailed message for support team
      const details = [];
      if (error?.code) details.push(`Code: ${error.code}`);
      if (error?.status) details.push(`Status: ${error.status}`);
      if (includeTimestamp) details.push(`Time: ${new Date().toISOString()}`);
      
      if (details.length > 0) {
        message = `${message} (${details.join(', ')})`;
      }
      break;
  }

  // Truncate if needed
  if (maxLength && message.length > maxLength) {
    message = message.substring(0, maxLength - 3) + '...';
  }

  return message;
};

/**
 * Format validation errors
 * @param {Array|Object} validationErrors - Validation error data
 * @param {Object} options - Formatting options
 * @returns {Object} Formatted validation errors
 */
export const formatValidationErrors = (validationErrors, options = {}) => {
  const {
    groupByField = true,
    includeFieldLabels = true,
    maxErrorsPerField = 3
  } = options;

  if (!validationErrors) return null;

  // Handle different input formats
  let errors = [];
  if (Array.isArray(validationErrors)) {
    errors = validationErrors;
  } else if (typeof validationErrors === 'object') {
    errors = Object.entries(validationErrors).map(([field, messages]) => ({
      field,
      messages: Array.isArray(messages) ? messages : [messages]
    }));
  }

  if (groupByField) {
    const grouped = {};
    errors.forEach(error => {
      const field = error.field || 'general';
      if (!grouped[field]) {
        grouped[field] = {
          field,
          label: includeFieldLabels ? getFieldLabel(field) : field,
          messages: []
        };
      }
      
      const messages = Array.isArray(error.messages) ? error.messages : [error.messages || error.message];
      grouped[field].messages.push(...messages);
      
      // Limit messages per field
      if (grouped[field].messages.length > maxErrorsPerField) {
        grouped[field].messages = grouped[field].messages.slice(0, maxErrorsPerField);
        grouped[field].hasMore = true;
      }
    });
    
    return {
      hasErrors: Object.keys(grouped).length > 0,
      errorCount: Object.values(grouped).reduce((count, field) => count + field.messages.length, 0),
      fieldCount: Object.keys(grouped).length,
      fields: grouped,
      summary: generateValidationSummary(grouped)
    };
  }

  return {
    hasErrors: errors.length > 0,
    errorCount: errors.length,
    errors: errors.map(error => ({
      field: error.field,
      message: error.message || error.messages?.[0],
      messages: Array.isArray(error.messages) ? error.messages : [error.message]
    }))
  };
};

// Helper functions

/**
 * Get severity level for error type
 */
const getSeverityLevel = (errorType) => {
  const severityMap = {
    [ERROR_TYPES.NETWORK]: 'medium',
    [ERROR_TYPES.PERMISSION]: 'high',
    [ERROR_TYPES.NOT_FOUND]: 'low',
    [ERROR_TYPES.SERVER]: 'high',
    [ERROR_TYPES.TIMEOUT]: 'medium',
    [ERROR_TYPES.VALIDATION]: 'medium',
    [ERROR_TYPES.GENERIC]: 'medium'
  };
  return severityMap[errorType] || 'medium';
};

/**
 * Get error category
 */
const getErrorCategory = (errorType) => {
  const categoryMap = {
    [ERROR_TYPES.NETWORK]: 'connectivity',
    [ERROR_TYPES.PERMISSION]: 'authorization',
    [ERROR_TYPES.NOT_FOUND]: 'client',
    [ERROR_TYPES.SERVER]: 'server',
    [ERROR_TYPES.TIMEOUT]: 'connectivity',
    [ERROR_TYPES.VALIDATION]: 'client',
    [ERROR_TYPES.GENERIC]: 'unknown'
  };
  return categoryMap[errorType] || 'unknown';
};

/**
 * Get error icon
 */
const getErrorIcon = (errorType) => {
  const iconMap = {
    [ERROR_TYPES.NETWORK]: '🌐',
    [ERROR_TYPES.PERMISSION]: '🔒',
    [ERROR_TYPES.NOT_FOUND]: '🔍',
    [ERROR_TYPES.SERVER]: '⚠️',
    [ERROR_TYPES.TIMEOUT]: '⏱️',
    [ERROR_TYPES.VALIDATION]: '📝',
    [ERROR_TYPES.GENERIC]: '❗'
  };
  return iconMap[errorType] || '❗';
};

/**
 * Get error color
 */
const getErrorColor = (errorType) => {
  const colorMap = {
    [ERROR_TYPES.NETWORK]: '#4299e1',
    [ERROR_TYPES.PERMISSION]: '#ed8936',
    [ERROR_TYPES.NOT_FOUND]: '#a0aec0',
    [ERROR_TYPES.SERVER]: '#e53e3e',
    [ERROR_TYPES.TIMEOUT]: '#d69e2e',
    [ERROR_TYPES.VALIDATION]: '#9f7aea',
    [ERROR_TYPES.GENERIC]: '#718096'
  };
  return colorMap[errorType] || '#718096';
};

/**
 * Get help link for error type
 */
const getHelpLink = (errorType) => {
  const helpMap = {
    [ERROR_TYPES.NETWORK]: '/help/network-issues',
    [ERROR_TYPES.PERMISSION]: '/help/permissions',
    [ERROR_TYPES.NOT_FOUND]: '/help/navigation',
    [ERROR_TYPES.SERVER]: '/help/server-issues',
    [ERROR_TYPES.TIMEOUT]: '/help/performance',
    [ERROR_TYPES.VALIDATION]: '/help/data-validation',
    [ERROR_TYPES.GENERIC]: '/help/general'
  };
  return helpMap[errorType] || '/help';
};

/**
 * Check if error is retryable
 */
const isErrorRetryable = (errorType) => {
  const retryableTypes = [
    ERROR_TYPES.NETWORK,
    ERROR_TYPES.SERVER,
    ERROR_TYPES.TIMEOUT,
    ERROR_TYPES.GENERIC
  ];
  return retryableTypes.includes(errorType);
};

/**
 * Get severity score for analytics
 */
const getSeverityScore = (errorType) => {
  const scoreMap = {
    [ERROR_TYPES.SERVER]: 3,
    [ERROR_TYPES.PERMISSION]: 3,
    [ERROR_TYPES.NETWORK]: 2,
    [ERROR_TYPES.TIMEOUT]: 2,
    [ERROR_TYPES.VALIDATION]: 2,
    [ERROR_TYPES.NOT_FOUND]: 1,
    [ERROR_TYPES.GENERIC]: 1
  };
  return scoreMap[errorType] || 1;
};

/**
 * Get user-friendly message
 */
const getUserFriendlyMessage = (error) => {
  if (!error) return null;
  
  const message = formatErrorMessage(error).toLowerCase();
  
  const friendlyMessages = {
    'network error': 'Please check your internet connection',
    'timeout': 'The request is taking longer than expected',
    'not found': 'The requested resource could not be found',
    'unauthorized': 'You need to sign in to access this feature',
    'forbidden': 'You don\'t have permission to perform this action',
    'server error': 'Our servers are experiencing issues',
    'validation': 'Please check the information you entered'
  };
  
  for (const [key, friendlyMessage] of Object.entries(friendlyMessages)) {
    if (message.includes(key)) {
      return friendlyMessage;
    }
  }
  
  return null;
};

/**
 * Get browser information safely
 */
const getBrowserInfo = () => {
  try {
    return {
      userAgent: navigator.userAgent,
      language: navigator.language,
      languages: navigator.languages || [navigator.language],
      platform: navigator.platform,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      vendor: navigator.vendor || '',
      hardwareConcurrency: navigator.hardwareConcurrency || 1
    };
  } catch (error) {
    console.warn('Failed to get browser info:', error);
    return {
      userAgent: 'unknown',
      language: 'unknown',
      platform: 'unknown',
      cookieEnabled: false,
      onLine: true
    };
  }
};

/**
 * Get device information safely
 */
const getDeviceInfo = () => {
  try {
    return {
      screen: {
        width: screen.width,
        height: screen.height,
        colorDepth: screen.colorDepth,
        pixelDepth: screen.pixelDepth
      },
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      devicePixelRatio: window.devicePixelRatio || 1,
      touchSupport: 'ontouchstart' in window,
      orientation: screen.orientation ? {
        angle: screen.orientation.angle,
        type: screen.orientation.type
      } : null
    };
  } catch (error) {
    console.warn('Failed to get device info:', error);
    return {
      screen: { width: 0, height: 0 },
      viewport: { width: 0, height: 0 },
      devicePixelRatio: 1,
      touchSupport: false,
      orientation: null
    };
  }
};

/**
 * Get network information safely
 */
const getNetworkInfo = () => {
  try {
    const connection = navigator.connection || 
                      navigator.mozConnection || 
                      navigator.webkitConnection;
    
    return connection ? {
      effectiveType: connection.effectiveType,
      downlink: connection.downlink,
      rtt: connection.rtt,
      saveData: connection.saveData
    } : null;
  } catch (error) {
    console.warn('Failed to get network info:', error);
    return null;
  }
};

/**
 * Get connection information safely
 */
const getConnectionInfo = () => {
  return getNetworkInfo();
};

/**
 * Get memory information safely
 */
const getMemoryInfo = () => {
  try {
    if (performance && performance.memory) {
      return {
        used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
        total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
        limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
      };
    }
  } catch (error) {
    console.warn('Failed to get memory info:', error);
  }
  return null;
};

/**
 * Get performance information safely
 */
const getPerformanceInfo = () => {
  try {
    const navigationEntries = performance.getEntriesByType('navigation');
    return {
      timing: performance.now(),
      memory: getMemoryInfo(),
      navigation: navigationEntries.length > 0 ? {
        domContentLoadedEventEnd: navigationEntries[0].domContentLoadedEventEnd,
        domContentLoadedEventStart: navigationEntries[0].domContentLoadedEventStart,
        loadEventEnd: navigationEntries[0].loadEventEnd,
        loadEventStart: navigationEntries[0].loadEventStart,
        responseEnd: navigationEntries[0].responseEnd,
        responseStart: navigationEntries[0].responseStart
      } : null
    };
  } catch (error) {
    console.warn('Failed to get performance info:', error);
    return {
      timing: Date.now(),
      memory: null,
      navigation: null
    };
  }
};

/**
 * Get session ID safely
 */
const getSessionId = () => {
  try {
    let sessionId = sessionStorage.getItem('teamspace_session_id');
    if (!sessionId) {
      sessionId = generateErrorId();
      sessionStorage.setItem('teamspace_session_id', sessionId);
    }
    return sessionId;
  } catch (error) {
    console.warn('Failed to get session ID:', error);
    return generateErrorId();
  }
};

/**
 * Get field label for validation errors
 */
const getFieldLabel = (fieldName) => {
  const labelMap = {
    email: 'Email Address',
    password: 'Password',
    firstName: 'First Name',
    lastName: 'Last Name',
    teamName: 'Team Name',
    phoneNumber: 'Phone Number'
  };
  
  return labelMap[fieldName] || fieldName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
};

/**
 * Generate validation summary
 */
const generateValidationSummary = (groupedErrors) => {
  const fieldCount = Object.keys(groupedErrors).length;
  const totalErrors = Object.values(groupedErrors).reduce((count, field) => count + field.messages.length, 0);
  
  if (fieldCount === 1) {
    return `1 field has ${totalErrors === 1 ? '1 error' : `${totalErrors} errors`}`;
  }
  
  return `${fieldCount} fields have ${totalErrors} errors total`;
};

// Export all functions
export default {
  formatErrorForDisplay,
  formatErrorForLogging,
  formatErrorForAnalytics,
  formatErrorDetails,
  formatErrorForAPI,
  formatErrorMessageForAudience,
  formatValidationErrors,
  getSeverityLevel,
  getErrorCategory,
  getErrorIcon,
  getErrorColor,
  getHelpLink,
  isErrorRetryable,
  getUserFriendlyMessage,
  getBrowserInfo,
  getDeviceInfo,
  getNetworkInfo,
  getPerformanceInfo
};
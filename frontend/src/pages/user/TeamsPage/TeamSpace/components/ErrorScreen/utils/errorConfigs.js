/**
 * Error Configuration Utilities
 * Provides configuration objects for different error types
 */

import {
  ERROR_TYPES,
  ERROR_ICONS,
  ERROR_COLORS,
  DEFAULT_ERROR_MESSAGES,
  RETRY_CONFIGS,
  HELP_LINKS
} from '../constants';

/**
 * Get complete error configuration for a specific error type
 * @param {string} errorType - Type of error
 * @returns {Object} Complete error configuration
 */
export const getErrorConfig = (errorType = ERROR_TYPES.GENERIC) => {
  const baseConfig = {
    type: errorType,
    icon: ERROR_ICONS[errorType] || ERROR_ICONS[ERROR_TYPES.GENERIC],
    color: ERROR_COLORS[errorType] || ERROR_COLORS[ERROR_TYPES.GENERIC],
    messages: DEFAULT_ERROR_MESSAGES[errorType] || DEFAULT_ERROR_MESSAGES[ERROR_TYPES.GENERIC],
    retryConfig: RETRY_CONFIGS[errorType] || RETRY_CONFIGS[ERROR_TYPES.GENERIC] || {},
    helpLink: HELP_LINKS[errorType] || HELP_LINKS[ERROR_TYPES.GENERIC],
    category: getErrorCategory(errorType),
    severity: getErrorSeverity(errorType),
    userActionRequired: getUserActionRequired(errorType),
    canAutoRecover: getCanAutoRecover(errorType)
  };

  return {
    ...baseConfig,
    retryable: baseConfig.retryConfig.maxRetries > 0,
    autoRetry: baseConfig.retryConfig.autoRetry || false
  };
};

/**
 * Get error category for classification
 * @param {string} errorType - Type of error
 * @returns {string} Error category
 */
export const getErrorCategory = (errorType) => {
  const categoryMap = {
    [ERROR_TYPES.NETWORK]: 'connectivity',
    [ERROR_TYPES.TIMEOUT]: 'connectivity',
    [ERROR_TYPES.PERMISSION]: 'authorization',
    [ERROR_TYPES.AUTHENTICATION]: 'authorization',
    [ERROR_TYPES.NOT_FOUND]: 'client',
    [ERROR_TYPES.VALIDATION]: 'client',
    [ERROR_TYPES.SERVER]: 'server',
    [ERROR_TYPES.RATE_LIMIT]: 'server',
    [ERROR_TYPES.MAINTENANCE]: 'server',
    [ERROR_TYPES.GENERIC]: 'unknown'
  };

  return categoryMap[errorType] || 'unknown';
};

/**
 * Get error severity level
 * @param {string} errorType - Type of error
 * @returns {string} Severity level
 */
export const getErrorSeverity = (errorType) => {
  const severityMap = {
    [ERROR_TYPES.NETWORK]: 'medium',
    [ERROR_TYPES.TIMEOUT]: 'medium',
    [ERROR_TYPES.PERMISSION]: 'high',
    [ERROR_TYPES.AUTHENTICATION]: 'high',
    [ERROR_TYPES.NOT_FOUND]: 'low',
    [ERROR_TYPES.VALIDATION]: 'medium',
    [ERROR_TYPES.SERVER]: 'high',
    [ERROR_TYPES.RATE_LIMIT]: 'medium',
    [ERROR_TYPES.MAINTENANCE]: 'high',
    [ERROR_TYPES.GENERIC]: 'medium'
  };

  return severityMap[errorType] || 'medium';
};

/**
 * Determine if user action is required
 * @param {string} errorType - Type of error
 * @returns {boolean} Whether user action is required
 */
export const getUserActionRequired = (errorType) => {
  const actionRequiredMap = {
    [ERROR_TYPES.NETWORK]: true,
    [ERROR_TYPES.TIMEOUT]: false,
    [ERROR_TYPES.PERMISSION]: true,
    [ERROR_TYPES.AUTHENTICATION]: true,
    [ERROR_TYPES.NOT_FOUND]: true,
    [ERROR_TYPES.VALIDATION]: true,
    [ERROR_TYPES.SERVER]: false,
    [ERROR_TYPES.RATE_LIMIT]: false,
    [ERROR_TYPES.MAINTENANCE]: false,
    [ERROR_TYPES.GENERIC]: true
  };

  return actionRequiredMap[errorType] !== false;
};

/**
 * Determine if error can auto-recover
 * @param {string} errorType - Type of error
 * @returns {boolean} Whether error can auto-recover
 */
export const getCanAutoRecover = (errorType) => {
  const autoRecoverMap = {
    [ERROR_TYPES.NETWORK]: true,
    [ERROR_TYPES.TIMEOUT]: true,
    [ERROR_TYPES.PERMISSION]: false,
    [ERROR_TYPES.AUTHENTICATION]: false,
    [ERROR_TYPES.NOT_FOUND]: false,
    [ERROR_TYPES.VALIDATION]: false,
    [ERROR_TYPES.SERVER]: true,
    [ERROR_TYPES.RATE_LIMIT]: true,
    [ERROR_TYPES.MAINTENANCE]: true,
    [ERROR_TYPES.GENERIC]: false
  };

  return autoRecoverMap[errorType] === true;
};

/**
 * Get retry configuration with exponential backoff
 * @param {string} errorType - Type of error
 * @param {number} retryCount - Current retry count
 * @returns {Object} Retry configuration
 */
export const getRetryConfigWithBackoff = (errorType, retryCount = 0) => {
  const baseConfig = RETRY_CONFIGS[errorType] || RETRY_CONFIGS[ERROR_TYPES.GENERIC] || {};
  const backoffMultiplier = baseConfig.backoffMultiplier || 1;
  
  return {
    ...baseConfig,
    retryDelay: Math.min(
      baseConfig.retryDelay * Math.pow(backoffMultiplier, retryCount),
      30000 // Max 30 seconds
    )
  };
};

/**
 * Create custom error configuration
 * @param {Object} customConfig - Custom configuration options
 * @returns {Object} Merged error configuration
 */
export const createCustomErrorConfig = (customConfig = {}) => {
  const baseConfig = getErrorConfig(customConfig.type || ERROR_TYPES.GENERIC);
  
  return {
    ...baseConfig,
    ...customConfig,
    messages: {
      ...baseConfig.messages,
      ...(customConfig.messages || {})
    },
    retryConfig: {
      ...baseConfig.retryConfig,
      ...(customConfig.retryConfig || {})
    }
  };
};

/**
 * Validate error configuration
 * @param {Object} config - Error configuration to validate
 * @returns {Object} Validation result
 */
export const validateErrorConfig = (config) => {
  const errors = [];
  const warnings = [];

  // Required fields
  if (!config.type) {
    errors.push('Error type is required');
  }

  if (!config.messages?.title) {
    errors.push('Error title is required');
  }

  if (!config.messages?.description) {
    errors.push('Error description is required');
  }

  // Retry configuration validation
  if (config.retryConfig) {
    if (config.retryConfig.maxRetries < 0 || config.retryConfig.maxRetries > 10) {
      warnings.push('maxRetries should be between 0 and 10');
    }

    if (config.retryConfig.retryDelay < 100 || config.retryConfig.retryDelay > 60000) {
      warnings.push('retryDelay should be between 100ms and 60s');
    }
  }

  // Accessibility validation
  if (config.messages?.title?.length > 100) {
    warnings.push('Title should be under 100 characters for accessibility');
  }

  if (config.messages?.description?.length > 500) {
    warnings.push('Description should be under 500 characters for accessibility');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Get all available error types with their configurations
 * @returns {Object} All error type configurations
 */
export const getAllErrorConfigs = () => {
  return Object.values(ERROR_TYPES).reduce((configs, errorType) => {
    configs[errorType] = getErrorConfig(errorType);
    return configs;
  }, {});
};

/**
 * Get error configurations by category
 * @param {string} category - Error category
 * @returns {Object} Error configurations in the category
 */
export const getErrorConfigsByCategory = (category) => {
  const allConfigs = getAllErrorConfigs();
  
  return Object.entries(allConfigs)
    .filter(([, config]) => config.category === category)
    .reduce((configs, [type, config]) => {
      configs[type] = config;
      return configs;
    }, {});
};

/**
 * Get error configurations by severity
 * @param {string} severity - Error severity level
 * @returns {Object} Error configurations with the severity
 */
export const getErrorConfigsBySeverity = (severity) => {
  const allConfigs = getAllErrorConfigs();
  
  return Object.entries(allConfigs)
    .filter(([, config]) => config.severity === severity)
    .reduce((configs, [type, config]) => {
      configs[type] = config;
      return configs;
    }, {});
};

// Export for convenience
export default {
  getErrorConfig,
  getErrorCategory,
  getErrorSeverity,
  getUserActionRequired,
  getCanAutoRecover,
  getRetryConfigWithBackoff,
  createCustomErrorConfig,
  validateErrorConfig,
  getAllErrorConfigs,
  getErrorConfigsByCategory,
  getErrorConfigsBySeverity
};
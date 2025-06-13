/**
 * Error Boundary Constants
 */

export const ERROR_TYPES = {
  JAVASCRIPT_ERROR: 'javascript_error',
  COMPONENT_ERROR: 'component_error',
  NETWORK_ERROR: 'network_error',
  PERMISSION_ERROR: 'permission_error',
  VALIDATION_ERROR: 'validation_error',
  TIMEOUT_ERROR: 'timeout_error',
  CHUNK_LOAD_ERROR: 'chunk_load_error',
  MEMORY_ERROR: 'memory_error',
  UNKNOWN_ERROR: 'unknown_error'
};

export const ERROR_SEVERITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

export const RETRY_STRATEGIES = {
  IMMEDIATE: 'immediate',
  EXPONENTIAL_BACKOFF: 'exponential_backoff',
  LINEAR_BACKOFF: 'linear_backoff',
  NONE: 'none'
};

export const DEFAULT_ERROR_MESSAGES = {
  GENERIC: 'We encountered an unexpected error in the TeamSpace. Our team has been notified and is working on a fix.',
  NETWORK: 'Unable to connect to our servers. Please check your internet connection and try again.',
  PERMISSION: 'You don\'t have permission to access this resource.',
  VALIDATION: 'The provided data is invalid. Please check your inputs and try again.',
  TIMEOUT: 'The request took too long to complete. Please try again.',
  CHUNK_LOAD: 'Failed to load application resources. Please refresh the page.',
  MEMORY: 'The application is running low on memory. Please close other tabs and refresh.'
};

export const ERROR_TRACKING_CONFIG = {
  MAX_STACK_TRACE_LENGTH: 5000,
  MAX_ERROR_MESSAGE_LENGTH: 1000,
  DEBOUNCE_TIME: 1000, // ms
  MAX_ERRORS_PER_SESSION: 50,
  SAMPLING_RATE: 0.1 // Report 10% of errors to reduce noise
};

export const ERROR_ICONS = {
  [ERROR_TYPES.NETWORK_ERROR]: '🌐',
  [ERROR_TYPES.PERMISSION_ERROR]: '🔒',
  [ERROR_TYPES.VALIDATION_ERROR]: '📝',
  [ERROR_TYPES.TIMEOUT_ERROR]: '⏱️',
  [ERROR_TYPES.CHUNK_LOAD_ERROR]: '📦',
  [ERROR_TYPES.MEMORY_ERROR]: '💾',
  [ERROR_TYPES.COMPONENT_ERROR]: '⚛️',
  [ERROR_TYPES.JAVASCRIPT_ERROR]: '🐛',
  [ERROR_TYPES.UNKNOWN_ERROR]: '❓'
};
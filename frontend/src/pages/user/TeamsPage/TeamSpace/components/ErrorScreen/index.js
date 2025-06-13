/**
 * ErrorScreen Module - Main Exports
 * 
 * Comprehensive error display system for TeamSpace with multiple error types,
 * retry mechanisms, and accessibility features.
 * 
 * @version 1.0.0
 * @author TeamSpace Development Team
 * @since 2024
 */

// ============================================================================
// CORE COMPONENTS
// ============================================================================

/**
 * Main ErrorScreen component with full functionality
 */
export { default as ErrorScreen } from './ErrorScreen';

/**
 * Specialized error screen components for specific error types
 */
export {
  NetworkErrorScreen,
  PermissionErrorScreen,
  NotFoundErrorScreen,
  ServerErrorScreen,
  TimeoutErrorScreen,
  ValidationErrorScreen
} from './ErrorScreen';

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/**
 * Modular error screen components for custom implementations
 */
export { default as ErrorIcon } from './components/ErrorIcon';
export { default as ErrorContent } from './components/ErrorContent';
export { default as ErrorActions } from './components/ErrorActions';
export { default as RetryButton } from './components/RetryButton';

// ============================================================================
// CUSTOM HOOKS
// ============================================================================

/**
 * React hooks for error screen functionality
 */
export { default as useErrorScreen } from './hooks/useErrorScreen';
export { default as useRetryLogic } from './hooks/useRetryLogic';
export { default as useErrorTracking } from './hooks/useErrorTracking';

// ============================================================================
// UTILITIES AND CONSTANTS
// ============================================================================

/**
 * Utility functions and configurations
 */
export * from './utils/errorConfigs';
export * from './utils/errorHelpers';
export * from './utils/errorFormatters';
export * from './constants';
export * from './types';

// ============================================================================
// COMPONENT COLLECTIONS
// ============================================================================

/**
 * Error Type Components Collection
 * Grouped by error categories for easy access
 */
export const ErrorTypeComponents = {
  Network: require('./ErrorScreen').NetworkErrorScreen,
  Permission: require('./ErrorScreen').PermissionErrorScreen,
  NotFound: require('./ErrorScreen').NotFoundErrorScreen,
  Server: require('./ErrorScreen').ServerErrorScreen,
  Timeout: require('./ErrorScreen').TimeoutErrorScreen,
  Validation: require('./ErrorScreen').ValidationErrorScreen,
  Generic: require('./ErrorScreen').default
};

/**
 * Component Parts Collection
 * Individual components for custom error screens
 */
export const ErrorScreenParts = {
  Icon: require('./components/ErrorIcon').default,
  Content: require('./components/ErrorContent').default,
  Actions: require('./components/ErrorActions').default,
  RetryButton: require('./components/RetryButton').default
};

/**
 * Hooks Collection
 * All custom hooks grouped together
 */
export const ErrorScreenHooks = {
  useErrorScreen: require('./hooks/useErrorScreen').default,
  useRetryLogic: require('./hooks/useRetryLogic').default,
  useErrorTracking: require('./hooks/useErrorTracking').default
};

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

/**
 * Create a custom error screen with specific configuration
 * @param {Object} config - Error screen configuration
 * @returns {React.Component} Configured error screen component
 */
export const createErrorScreen = (config = {}) => {
  const ErrorScreen = require('./ErrorScreen').default;
  
  return (props) => <ErrorScreen {...config} {...props} />;
};

/**
 * Get error screen component by error type
 * @param {string} errorType - Type of error
 * @returns {React.Component} Appropriate error screen component
 */
export const getErrorScreenByType = (errorType) => {
  const typeMap = {
    'network': require('./ErrorScreen').NetworkErrorScreen,
    'permission': require('./ErrorScreen').PermissionErrorScreen,
    'notFound': require('./ErrorScreen').NotFoundErrorScreen,
    'server': require('./ErrorScreen').ServerErrorScreen,
    'timeout': require('./ErrorScreen').TimeoutErrorScreen,
    'validation': require('./ErrorScreen').ValidationErrorScreen
  };
  
  return typeMap[errorType] || require('./ErrorScreen').default;
};

/**
 * Create error screen with analytics tracking
 * @param {Object} trackingConfig - Analytics configuration
 * @returns {React.Component} Error screen with tracking
 */
export const createTrackedErrorScreen = (trackingConfig = {}) => {
  const ErrorScreen = require('./ErrorScreen').default;
  
  return (props) => (
    <ErrorScreen 
      trackError={true}
      {...trackingConfig}
      {...props}
    />
  );
};

// ============================================================================
// ERROR SCREEN PRESETS
// ============================================================================

/**
 * Pre-configured error screens for common scenarios
 */
export const ErrorScreenPresets = {
  /**
   * Loading timeout error
   */
  LoadingTimeout: createErrorScreen({
    errorType: 'timeout',
    title: 'Loading Timeout',
    description: 'The page is taking longer than expected to load.',
    autoRetry: true,
    retryDelay: 2000,
    maxRetries: 3
  }),
  
  /**
   * Network connectivity error
   */
  NetworkError: createErrorScreen({
    errorType: 'network',
    title: 'Connection Problem',
    description: 'Please check your internet connection and try again.',
    autoRetry: true,
    retryDelay: 5000,
    maxRetries: 5
  }),
  
  /**
   * Team access denied error
   */
  TeamAccessDenied: createErrorScreen({
    errorType: 'permission',
    title: 'Team Access Denied',
    description: 'You don\'t have permission to access this team.',
    retryable: false
  }),
  
  /**
   * Team not found error
   */
  TeamNotFound: createErrorScreen({
    errorType: 'notFound',
    title: 'Team Not Found',
    description: 'The team you\'re looking for doesn\'t exist or has been removed.',
    retryable: false
  }),
  
  /**
   * Server maintenance error
   */
  ServerMaintenance: createErrorScreen({
    errorType: 'server',
    title: 'Server Maintenance',
    description: 'Our servers are currently undergoing maintenance. Please try again later.',
    autoRetry: true,
    retryDelay: 30000,
    maxRetries: 10
  })
};

// ============================================================================
// COMPONENT METADATA
// ============================================================================

/**
 * Component registry for development and testing
 */
export const ERROR_SCREEN_REGISTRY = {
  'ErrorScreen': {
    description: 'Main error screen component with full functionality',
    props: ['error', 'errorType', 'onRetry', 'onGoBack', 'showDetails'],
    examples: ['Generic error', 'Network error', 'Permission error'],
    category: 'Core'
  },
  'NetworkErrorScreen': {
    description: 'Specialized error screen for network connectivity issues',
    props: ['onRetry', 'onGoBack', 'autoRetry'],
    examples: ['Connection timeout', 'DNS resolution failed'],
    category: 'Network'
  },
  'PermissionErrorScreen': {
    description: 'Error screen for access permission issues',
    props: ['onGoBack', 'customMessage'],
    examples: ['Team access denied', 'Feature not available'],
    category: 'Permission'
  },
  'NotFoundErrorScreen': {
    description: 'Error screen for missing resources',
    props: ['onGoBack', 'resourceType'],
    examples: ['Team not found', 'Page not found'],
    category: 'NotFound'
  },
  'ServerErrorScreen': {
    description: 'Error screen for server-side issues',
    props: ['onRetry', 'autoRetry', 'retryDelay'],
    examples: ['Internal server error', 'Service unavailable'],
    category: 'Server'
  },
  'TimeoutErrorScreen': {
    description: 'Error screen for request timeout issues',
    props: ['onRetry', 'timeoutDuration'],
    examples: ['Request timeout', 'Loading timeout'],
    category: 'Timeout'
  },
  'ValidationErrorScreen': {
    description: 'Error screen for data validation issues',
    props: ['validationErrors', 'onRetry'],
    examples: ['Form validation failed', 'Invalid data format'],
    category: 'Validation'
  }
};

/**
 * Development utilities
 */
export const ErrorScreenDevUtils = {
  registry: ERROR_SCREEN_REGISTRY,
  presets: ErrorScreenPresets,
  typeComponents: ErrorTypeComponents,
  parts: ErrorScreenParts,
  hooks: ErrorScreenHooks,
  
  /**
   * Get all available error types
   */
  getErrorTypes: () => Object.keys(ErrorTypeComponents).map(key => key.toLowerCase()),
  
  /**
   * Get component info by name
   */
  getComponentInfo: (componentName) => ERROR_SCREEN_REGISTRY[componentName],
  
  /**
   * List all available presets
   */
  listPresets: () => Object.keys(ErrorScreenPresets),
  
  /**
   * Get preset configuration
   */
  getPresetConfig: (presetName) => ErrorScreenPresets[presetName]
};

// ============================================================================
// VERSION INFORMATION
// ============================================================================

export const ERROR_SCREEN_VERSION = {
  version: '1.0.0',
  buildDate: new Date().toISOString(),
  components: Object.keys(ERROR_SCREEN_REGISTRY).length,
  presets: Object.keys(ErrorScreenPresets).length,
  features: [
    'Multiple error types',
    'Automatic retry logic',
    'Analytics tracking',
    'Accessibility support',
    'Responsive design',
    'Customizable styling',
    'Development tools'
  ]
};

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

/**
 * Default export for most common use case
 */
export { default } from './ErrorScreen';

// ============================================================================
// DEVELOPMENT LOGGING
// ============================================================================

if (process.env.NODE_ENV === 'development') {
  console.group('🚨 ErrorScreen Module Loaded');
  console.log('📦 Components:', Object.keys(ERROR_SCREEN_REGISTRY).length);
  console.log('🎯 Presets:', Object.keys(ErrorScreenPresets).length);
  console.log('🔧 Dev Utils:', Object.keys(ErrorScreenDevUtils).length);
  console.log('📋 Version:', ERROR_SCREEN_VERSION.version);
  console.groupEnd();
}
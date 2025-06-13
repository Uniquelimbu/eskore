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
  Network: NetworkErrorScreen,
  Permission: PermissionErrorScreen,
  NotFound: NotFoundErrorScreen,
  Server: ServerErrorScreen,
  Timeout: TimeoutErrorScreen,
  Validation: ValidationErrorScreen
};

/**
 * Utility Components Collection
 * Individual building blocks for custom error screens
 */
export const ErrorUtilityComponents = {
  ErrorIcon,
  ErrorContent,
  ErrorActions,
  RetryButton
};

/**
 * Hooks Collection
 * All error-related hooks grouped together
 */
export const ErrorHooks = {
  useErrorScreen,
  useRetryLogic,
  useErrorTracking
};

// ============================================================================
// PRESETS AND FACTORIES
// ============================================================================

/**
 * Helper function to create error screen with preset configurations
 */
const createErrorScreen = (config) => (props) => (
  <ErrorScreen {...config} {...props} />
);

/**
 * Pre-configured error screen instances for common scenarios
 */
export const ErrorScreenPresets = {
  /**
   * Network connectivity error
   */
  NetworkError: createErrorScreen({
    errorType: 'network',
    title: 'Connection Error',
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
  }),

  /**
   * Session timeout error
   */
  SessionTimeout: createErrorScreen({
    errorType: 'timeout',
    title: 'Session Timeout',
    description: 'Your session has expired. Please sign in again.',
    retryable: false,
    onRetry: () => window.location.href = '/login'
  }),

  /**
   * Validation error
   */
  ValidationError: createErrorScreen({
    errorType: 'validation',
    title: 'Validation Error',
    description: 'Please check your input and try again.',
    retryable: true,
    maxRetries: 3
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
  },
  'ErrorIcon': {
    description: 'Icon component for error screens',
    props: ['errorType', 'size', 'animated'],
    examples: ['Network icon', 'Permission icon'],
    category: 'Utility'
  },
  'ErrorContent': {
    description: 'Content component for error screens',
    props: ['title', 'description', 'error', 'showDetails'],
    examples: ['Error title and description', 'Technical details'],
    category: 'Utility'
  },
  'ErrorActions': {
    description: 'Action buttons component for error screens',
    props: ['onRetry', 'onGoBack', 'canRetry', 'isRetrying'],
    examples: ['Retry button', 'Go back button'],
    category: 'Utility'
  },
  'RetryButton': {
    description: 'Specialized retry button with countdown and loading states',
    props: ['onRetry', 'isRetrying', 'retryCount', 'maxRetries'],
    examples: ['Simple retry', 'Retry with countdown'],
    category: 'Utility'
  }
};

/**
 * Development utilities
 */
export const ErrorScreenDevUtils = {
  registry: ERROR_SCREEN_REGISTRY,
  presets: ErrorScreenPresets,
  
  /**
   * Get component information
   */
  getComponentInfo: (componentName) => ERROR_SCREEN_REGISTRY[componentName],
  
  /**
   * List all available components
   */
  listComponents: () => Object.keys(ERROR_SCREEN_REGISTRY),
  
  /**
   * Get components by category
   */
  getComponentsByCategory: (category) => 
    Object.entries(ERROR_SCREEN_REGISTRY)
      .filter(([, info]) => info.category === category)
      .map(([name]) => name),
  
  /**
   * Validate component props (development only)
   */
  validateProps: (componentName, props) => {
    if (process.env.NODE_ENV !== 'development') return;
    
    const componentInfo = ERROR_SCREEN_REGISTRY[componentName];
    if (!componentInfo) {
      console.warn(`Unknown ErrorScreen component: ${componentName}`);
      return;
    }
    
    const requiredProps = componentInfo.props || [];
    const missingProps = requiredProps.filter(prop => !(prop in props));
    
    if (missingProps.length > 0) {
      console.warn(`Missing props for ${componentName}:`, missingProps);
    }
  }
};

// ============================================================================
// VERSION AND METADATA
// ============================================================================

/**
 * Module version information
 */
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
/**
 * ErrorScreen Constants and Configurations
 * Centralized configuration for all error screen components
 */

// ============================================================================
// ERROR TYPES
// ============================================================================

export const ERROR_TYPES = {
  NETWORK: 'network',
  PERMISSION: 'permission',
  NOT_FOUND: 'notFound',
  SERVER: 'server',
  TIMEOUT: 'timeout',
  VALIDATION: 'validation',
  GENERIC: 'generic',
  AUTHENTICATION: 'authentication',
  RATE_LIMIT: 'rateLimit',
  MAINTENANCE: 'maintenance'
};

// ============================================================================
// ERROR ICONS
// ============================================================================

export const ERROR_ICONS = {
  [ERROR_TYPES.NETWORK]: '🌐',
  [ERROR_TYPES.PERMISSION]: '🔒',
  [ERROR_TYPES.NOT_FOUND]: '🔍',
  [ERROR_TYPES.SERVER]: '⚠️',
  [ERROR_TYPES.TIMEOUT]: '⏱️',
  [ERROR_TYPES.VALIDATION]: '📝',
  [ERROR_TYPES.GENERIC]: '❗',
  [ERROR_TYPES.AUTHENTICATION]: '🔐',
  [ERROR_TYPES.RATE_LIMIT]: '⏸️',
  [ERROR_TYPES.MAINTENANCE]: '🔧'
};

// ============================================================================
// ERROR COLORS
// ============================================================================

export const ERROR_COLORS = {
  [ERROR_TYPES.NETWORK]: '#4299e1',
  [ERROR_TYPES.PERMISSION]: '#ed8936',
  [ERROR_TYPES.NOT_FOUND]: '#a0aec0',
  [ERROR_TYPES.SERVER]: '#e53e3e',
  [ERROR_TYPES.TIMEOUT]: '#d69e2e',
  [ERROR_TYPES.VALIDATION]: '#9f7aea',
  [ERROR_TYPES.GENERIC]: '#718096',
  [ERROR_TYPES.AUTHENTICATION]: '#38b2ac',
  [ERROR_TYPES.RATE_LIMIT]: '#f56565',
  [ERROR_TYPES.MAINTENANCE]: '#4299e1'
};

// ============================================================================
// DEFAULT ERROR CONFIGURATION
// ============================================================================

export const DEFAULT_ERROR_CONFIG = {
  [ERROR_TYPES.NETWORK]: {
    title: 'Connection Error',
    description: 'Unable to connect to the server. Please check your internet connection.',
    actionText: 'Try Again',
    severity: 'medium',
    category: 'connectivity',
    retryable: true,
    autoRetry: false
  },
  [ERROR_TYPES.PERMISSION]: {
    title: 'Access Denied',
    description: 'You don\'t have permission to access this resource.',
    actionText: 'Go Back',
    severity: 'high',
    category: 'authorization',
    retryable: false,
    autoRetry: false
  },
  [ERROR_TYPES.NOT_FOUND]: {
    title: 'Not Found',
    description: 'The requested resource could not be found.',
    actionText: 'Go Back',
    severity: 'low',
    category: 'client',
    retryable: false,
    autoRetry: false
  },
  [ERROR_TYPES.SERVER]: {
    title: 'Server Error',
    description: 'An internal server error occurred. Please try again later.',
    actionText: 'Try Again',
    severity: 'high',
    category: 'server',
    retryable: true,
    autoRetry: true
  },
  [ERROR_TYPES.TIMEOUT]: {
    title: 'Request Timeout',
    description: 'The request took too long to complete. Please try again.',
    actionText: 'Try Again',
    severity: 'medium',
    category: 'connectivity',
    retryable: true,
    autoRetry: false
  },
  [ERROR_TYPES.VALIDATION]: {
    title: 'Validation Error',
    description: 'The submitted data contains errors. Please check and try again.',
    actionText: 'Try Again',
    severity: 'medium',
    category: 'client',
    retryable: true,
    autoRetry: false
  },
  [ERROR_TYPES.AUTHENTICATION]: {
    title: 'Authentication Required',
    description: 'You need to sign in to access this feature.',
    actionText: 'Sign In',
    severity: 'medium',
    category: 'authorization',
    retryable: false,
    autoRetry: false
  },
  [ERROR_TYPES.RATE_LIMIT]: {
    title: 'Too Many Requests',
    description: 'You\'ve made too many requests. Please wait a moment.',
    actionText: 'Wait',
    severity: 'medium',
    category: 'server',
    retryable: true,
    autoRetry: true
  },
  [ERROR_TYPES.MAINTENANCE]: {
    title: 'Maintenance Mode',
    description: 'The system is currently under maintenance. Please try again later.',
    actionText: 'Check Status',
    severity: 'low',
    category: 'server',
    retryable: true,
    autoRetry: true
  },
  [ERROR_TYPES.GENERIC]: {
    title: 'Something went wrong',
    description: 'We encountered an unexpected error. Please try again or contact support.',
    actionText: 'Try Again',
    severity: 'medium',
    category: 'unknown',
    retryable: true,
    autoRetry: false
  }
};

// ============================================================================
// RETRY CONFIGURATIONS
// ============================================================================

export const RETRY_CONFIGS = {
  [ERROR_TYPES.NETWORK]: {
    maxRetries: 5,
    retryDelay: 2000,
    autoRetry: true,
    backoffMultiplier: 1.5,
    maxRetryDelay: 10000
  },
  [ERROR_TYPES.SERVER]: {
    maxRetries: 3,
    retryDelay: 3000,
    autoRetry: true,
    backoffMultiplier: 2,
    maxRetryDelay: 15000
  },
  [ERROR_TYPES.TIMEOUT]: {
    maxRetries: 3,
    retryDelay: 1000,
    autoRetry: false,
    backoffMultiplier: 1.5,
    maxRetryDelay: 5000
  },
  [ERROR_TYPES.VALIDATION]: {
    maxRetries: 2,
    retryDelay: 500,
    autoRetry: false,
    backoffMultiplier: 1,
    maxRetryDelay: 500
  },
  [ERROR_TYPES.RATE_LIMIT]: {
    maxRetries: 1,
    retryDelay: 60000,
    autoRetry: true,
    backoffMultiplier: 1,
    maxRetryDelay: 60000
  },
  [ERROR_TYPES.MAINTENANCE]: {
    maxRetries: 10,
    retryDelay: 30000,
    autoRetry: true,
    backoffMultiplier: 1,
    maxRetryDelay: 30000
  },
  [ERROR_TYPES.GENERIC]: {
    maxRetries: 3,
    retryDelay: 1000,
    autoRetry: false,
    backoffMultiplier: 1.5,
    maxRetryDelay: 5000
  }
};

// ============================================================================
// SCREEN SIZES
// ============================================================================

export const SCREEN_SIZES = {
  SMALL: 'small',
  DEFAULT: 'default',
  LARGE: 'large'
};

export const SCREEN_SIZE_CONFIG = {
  [SCREEN_SIZES.SMALL]: {
    iconSize: '3rem',
    titleSize: '1.3rem',
    descriptionSize: '0.9rem',
    padding: '20px 15px',
    maxWidth: '400px'
  },
  [SCREEN_SIZES.DEFAULT]: {
    iconSize: '4rem',
    titleSize: '1.5rem',
    descriptionSize: '1rem',
    padding: '40px 20px',
    maxWidth: '500px'
  },
  [SCREEN_SIZES.LARGE]: {
    iconSize: '5rem',
    titleSize: '1.8rem',
    descriptionSize: '1.1rem',
    padding: '50px 30px',
    maxWidth: '600px'
  }
};

// ============================================================================
// ANIMATION CONFIGURATIONS
// ============================================================================

export const ANIMATION_CONFIG = {
  fadeInDuration: '0.5s',
  pulseAnimationDuration: '2s',
  shakeAnimationDuration: '0.5s',
  spinAnimationDuration: '1s',
  enableAnimations: true,
  respectReducedMotion: true
};

// ============================================================================
// ACCESSIBILITY CONFIGURATIONS
// ============================================================================

export const A11Y_CONFIG = {
  roles: {
    errorScreen: 'alert',
    errorContent: 'main',
    retryButton: 'button',
    backButton: 'button'
  },
  ariaLive: 'assertive',
  announceErrors: true,
  keyboardNavigation: true,
  focusManagement: true,
  screenReaderSupport: true
};

// ============================================================================
// ANALYTICS EVENTS
// ============================================================================

export const ANALYTICS_EVENTS = {
  ERROR_DISPLAYED: 'error_displayed',
  ERROR_DISMISSED: 'error_dismissed',
  RETRY_CLICKED: 'retry_clicked',
  RETRY_SUCCESS: 'retry_success',
  RETRY_FAILED: 'retry_failed',
  GO_BACK_CLICKED: 'go_back_clicked',
  HELP_CLICKED: 'help_clicked',
  REPORT_CLICKED: 'report_clicked',
  DETAILS_TOGGLED: 'details_toggled',
  AUTO_RETRY_STARTED: 'auto_retry_started',
  AUTO_RETRY_PAUSED: 'auto_retry_paused',
  MAX_RETRIES_REACHED: 'max_retries_reached'
};

// ============================================================================
// DEFAULT ERROR MESSAGES
// ============================================================================

export const DEFAULT_ERROR_MESSAGES = {
  [ERROR_TYPES.NETWORK]: {
    title: 'Connection Error',
    description: 'Unable to connect to the server. Please check your internet connection.',
    actionText: 'Try Again'
  },
  [ERROR_TYPES.PERMISSION]: {
    title: 'Access Denied',
    description: 'You don\'t have permission to access this resource.',
    actionText: 'Go Back'
  },
  [ERROR_TYPES.NOT_FOUND]: {
    title: 'Not Found',
    description: 'The requested resource could not be found.',
    actionText: 'Go Back'
  },
  [ERROR_TYPES.SERVER]: {
    title: 'Server Error',
    description: 'An internal server error occurred. Please try again later.',
    actionText: 'Try Again'
  },
  [ERROR_TYPES.TIMEOUT]: {
    title: 'Request Timeout',
    description: 'The request took too long to complete. Please try again.',
    actionText: 'Try Again'
  },
  [ERROR_TYPES.VALIDATION]: {
    title: 'Validation Error',
    description: 'The submitted data contains errors. Please check and try again.',
    actionText: 'Try Again'
  },
  [ERROR_TYPES.AUTHENTICATION]: {
    title: 'Authentication Required',
    description: 'You need to sign in to access this feature.',
    actionText: 'Sign In'
  },
  [ERROR_TYPES.RATE_LIMIT]: {
    title: 'Too Many Requests',
    description: 'Too many requests. Please wait a moment before trying again.',
    actionText: 'Wait'
  },
  [ERROR_TYPES.MAINTENANCE]: {
    title: 'Maintenance Mode',
    description: 'The system is currently under maintenance. Please try again later.',
    actionText: 'Check Status'
  },
  [ERROR_TYPES.GENERIC]: {
    title: 'Something went wrong',
    description: 'We encountered an unexpected error. Please try again or contact support.',
    actionText: 'Try Again'
  }
};

// ============================================================================
// THEME CONFIGURATIONS
// ============================================================================

export const THEME_CONFIG = {
  DARK: 'dark',
  LIGHT: 'light',
  AUTO: 'auto'
};

export const THEME_VARIABLES = {
  [THEME_CONFIG.DARK]: {
    '--error-bg': '#1a202c',
    '--error-text': '#e2e8f0',
    '--error-text-muted': '#a0aec0',
    '--error-border': '#2d3748',
    '--error-card-bg': '#232b3a',
    '--error-danger': '#e53e3e',
    '--error-warning': '#d69e2e',
    '--error-info': '#4299e1',
    '--error-success': '#48bb78',
    '--error-primary': '#4a6cf7',
    '--error-secondary': '#718096'
  },
  [THEME_CONFIG.LIGHT]: {
    '--error-bg': '#ffffff',
    '--error-text': '#2d3748',
    '--error-text-muted': '#718096',
    '--error-border': '#e2e8f0',
    '--error-card-bg': '#f7fafc',
    '--error-danger': '#e53e3e',
    '--error-warning': '#d69e2e',
    '--error-info': '#4299e1',
    '--error-success': '#48bb78',
    '--error-primary': '#4a6cf7',
    '--error-secondary': '#718096'
  },
  [THEME_CONFIG.AUTO]: {
    '--error-bg': 'var(--bg-primary, #1a202c)',
    '--error-text': 'var(--text-primary, #e2e8f0)',
    '--error-text-muted': 'var(--text-muted, #a0aec0)',
    '--error-border': 'var(--border-color, #2d3748)',
    '--error-card-bg': 'var(--secondary-color, #232b3a)',
    '--error-danger': 'var(--danger-color, #e53e3e)',
    '--error-warning': 'var(--warning-color, #d69e2e)',
    '--error-info': 'var(--info-color, #4299e1)',
    '--error-success': 'var(--success-color, #48bb78)',
    '--error-primary': 'var(--primary-color, #4a6cf7)',
    '--error-secondary': 'var(--secondary-text, #718096)'
  }
};

// ============================================================================
// RESPONSIVE BREAKPOINTS
// ============================================================================

export const BREAKPOINTS = {
  mobile: '480px',
  tablet: '768px',
  desktop: '1024px',
  wide: '1200px'
};

// ============================================================================
// ERROR CATEGORIES
// ============================================================================

export const ERROR_CATEGORIES = {
  NETWORK: [ERROR_TYPES.NETWORK, ERROR_TYPES.TIMEOUT],
  SECURITY: [ERROR_TYPES.PERMISSION, ERROR_TYPES.AUTHENTICATION],
  CLIENT: [ERROR_TYPES.NOT_FOUND, ERROR_TYPES.VALIDATION],
  SERVER: [ERROR_TYPES.SERVER, ERROR_TYPES.MAINTENANCE, ERROR_TYPES.RATE_LIMIT],
  GENERIC: [ERROR_TYPES.GENERIC]
};

// ============================================================================
// HELP LINKS
// ============================================================================

export const HELP_LINKS = {
  [ERROR_TYPES.NETWORK]: '/help/network-issues',
  [ERROR_TYPES.PERMISSION]: '/help/permissions',
  [ERROR_TYPES.NOT_FOUND]: '/help/navigation',
  [ERROR_TYPES.SERVER]: '/help/server-issues',
  [ERROR_TYPES.TIMEOUT]: '/help/performance',
  [ERROR_TYPES.VALIDATION]: '/help/data-validation',
  [ERROR_TYPES.AUTHENTICATION]: '/help/sign-in',
  [ERROR_TYPES.RATE_LIMIT]: '/help/rate-limits',
  [ERROR_TYPES.MAINTENANCE]: '/status',
  [ERROR_TYPES.GENERIC]: '/help/general'
};

// ============================================================================
// FEATURE FLAGS
// ============================================================================

export const FEATURE_FLAGS = {
  ENABLE_AUTO_RETRY: true,
  ENABLE_ERROR_REPORTING: true,
  ENABLE_ANALYTICS: true,
  ENABLE_HELP_LINKS: true,
  ENABLE_ERROR_DETAILS: process.env.NODE_ENV === 'development',
  ENABLE_RETRY_ANIMATION: true,
  ENABLE_SOUND_EFFECTS: false,
  ENABLE_HAPTIC_FEEDBACK: false,
  ENABLE_OFFLINE_DETECTION: true,
  ENABLE_PERFORMANCE_TRACKING: true,
  ENABLE_A11Y_ANNOUNCEMENTS: true,
  ENABLE_THEME_DETECTION: true
};

// ============================================================================
// VALIDATION RULES
// ============================================================================

export const VALIDATION_RULES = {
  maxRetries: {
    min: 0,
    max: 10,
    default: 3
  },
  retryDelay: {
    min: 100,
    max: 60000,
    default: 1000
  },
  titleMaxLength: 100,
  descriptionMaxLength: 500,
  errorIdPattern: /^[a-zA-Z0-9-_]{8,32}$/,
  errorMessageMaxLength: 1000,
  contextKeyMaxLength: 50,
  contextValueMaxLength: 200
};

// ============================================================================
// PERFORMANCE THRESHOLDS
// ============================================================================

export const PERFORMANCE_THRESHOLDS = {
  RETRY_TIMEOUT: 30000, // 30 seconds
  AUTO_RETRY_MAX_TIME: 300000, // 5 minutes
  ANALYTICS_BATCH_SIZE: 10,
  ANALYTICS_FLUSH_INTERVAL: 30000, // 30 seconds
  LOCAL_STORAGE_MAX_EVENTS: 1000,
  MEMORY_USAGE_WARNING: 50 * 1024 * 1024, // 50MB
  NETWORK_TIMEOUT: 10000 // 10 seconds
};

// ============================================================================
// SECURITY SETTINGS
// ============================================================================

export const SECURITY_SETTINGS = {
  SANITIZE_ERROR_MESSAGES: true,
  REDACT_SENSITIVE_DATA: true,
  SENSITIVE_KEYS: [
    'password', 'token', 'key', 'secret', 'auth', 'authorization',
    'cookie', 'session', 'credential', 'private', 'secure'
  ],
  MAX_STACK_TRACE_LENGTH: 2000,
  ENABLE_ERROR_REPORTING_CONSENT: true,
  ANONYMIZE_USER_DATA: true
};

// ============================================================================
// COMPONENT DEFAULTS
// ============================================================================

export const COMPONENT_DEFAULTS = {
  ERROR_SCREEN: {
    fullScreen: false,
    showDetails: process.env.NODE_ENV === 'development',
    trackError: true,
    autoRetry: false,
    maxRetries: 3,
    retryDelay: 1000,
    size: SCREEN_SIZES.DEFAULT,
    theme: THEME_CONFIG.AUTO
  },
  ERROR_ICON: {
    size: 'large',
    animated: true,
    showPulse: false
  },
  ERROR_CONTENT: {
    showErrorId: true,
    showRetryInfo: false,
    showDetails: false
  },
  ERROR_ACTIONS: {
    actionAlignment: 'center',
    actionSize: 'medium',
    showGoBack: true,
    showHelp: true,
    showReport: true
  },
  RETRY_BUTTON: {
    size: 'medium',
    variant: 'primary',
    showIcon: true,
    countdown: 0
  }
};

// ============================================================================
// EXPORT GROUPS
// ============================================================================

// Core error types and configurations
export const CORE_CONSTANTS = {
  ERROR_TYPES,
  ERROR_ICONS,
  ERROR_COLORS,
  DEFAULT_ERROR_CONFIG
};

// Retry and timing configurations
export const RETRY_CONSTANTS = {
  RETRY_CONFIGS,
  PERFORMANCE_THRESHOLDS
};

// UI and display configurations
export const UI_CONSTANTS = {
  SCREEN_SIZES,
  SCREEN_SIZE_CONFIG,
  THEME_CONFIG,
  THEME_VARIABLES,
  BREAKPOINTS
};

// Accessibility and interaction configurations
export const A11Y_CONSTANTS = {
  A11Y_CONFIG,
  ANIMATION_CONFIG
};

// Analytics and tracking configurations
export const ANALYTICS_CONSTANTS = {
  ANALYTICS_EVENTS,
  FEATURE_FLAGS
};

// Security and validation configurations
export const SECURITY_CONSTANTS = {
  VALIDATION_RULES,
  SECURITY_SETTINGS
};

// ============================================================================
// NAMED EXPORTS
// ============================================================================

export {
  ERROR_ICONS,
  ERROR_COLORS,
  DEFAULT_ERROR_CONFIG,
  RETRY_CONFIGS,
  SCREEN_SIZES,
  SCREEN_SIZE_CONFIG,
  ANIMATION_CONFIG,
  A11Y_CONFIG,
  ANALYTICS_EVENTS,
  DEFAULT_ERROR_MESSAGES,
  THEME_CONFIG,
  THEME_VARIABLES,
  BREAKPOINTS,
  ERROR_CATEGORIES,
  HELP_LINKS,
  FEATURE_FLAGS,
  VALIDATION_RULES,
  PERFORMANCE_THRESHOLDS,
  SECURITY_SETTINGS,
  COMPONENT_DEFAULTS,
  CORE_CONSTANTS,
  RETRY_CONSTANTS,
  UI_CONSTANTS,
  A11Y_CONSTANTS,
  ANALYTICS_CONSTANTS,
  SECURITY_CONSTANTS
};

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default {
  ERROR_TYPES,
  ERROR_ICONS,
  ERROR_COLORS,
  DEFAULT_ERROR_CONFIG,
  RETRY_CONFIGS,
  SCREEN_SIZES,
  SCREEN_SIZE_CONFIG,
  ANIMATION_CONFIG,
  A11Y_CONFIG,
  ANALYTICS_EVENTS,
  DEFAULT_ERROR_MESSAGES,
  THEME_CONFIG,
  THEME_VARIABLES,
  BREAKPOINTS,
  ERROR_CATEGORIES,
  HELP_LINKS,
  FEATURE_FLAGS,
  VALIDATION_RULES,
  PERFORMANCE_THRESHOLDS,
  SECURITY_SETTINGS,
  COMPONENT_DEFAULTS,
  CORE_CONSTANTS,
  RETRY_CONSTANTS,
  UI_CONSTANTS,
  A11Y_CONSTANTS,
  ANALYTICS_CONSTANTS,
  SECURITY_CONSTANTS
};
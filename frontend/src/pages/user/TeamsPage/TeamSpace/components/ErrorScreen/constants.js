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
  [ERROR_TYPES.RATE_LIMIT]: '🚦',
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
  [ERROR_TYPES.AUTHENTICATION]: '#e53e3e',
  [ERROR_TYPES.RATE_LIMIT]: '#d69e2e',
  [ERROR_TYPES.MAINTENANCE]: '#4299e1'
};

// ============================================================================
// DEFAULT CONFIGURATIONS
// ============================================================================

export const DEFAULT_ERROR_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000,
  autoRetry: false,
  showDetails: process.env.NODE_ENV === 'development',
  trackError: true,
  fullScreen: true,
  enableKeyboardNavigation: true,
  showRetryCount: true,
  showErrorId: true,
  enableAnalytics: true
};

// ============================================================================
// RETRY CONFIGURATIONS
// ============================================================================

export const RETRY_CONFIGS = {
  [ERROR_TYPES.NETWORK]: {
    maxRetries: 5,
    retryDelay: 2000,
    autoRetry: true,
    backoffMultiplier: 1.5
  },
  [ERROR_TYPES.SERVER]: {
    maxRetries: 3,
    retryDelay: 5000,
    autoRetry: true,
    backoffMultiplier: 2
  },
  [ERROR_TYPES.TIMEOUT]: {
    maxRetries: 3,
    retryDelay: 3000,
    autoRetry: false,
    backoffMultiplier: 1.2
  },
  [ERROR_TYPES.RATE_LIMIT]: {
    maxRetries: 1,
    retryDelay: 60000,
    autoRetry: true,
    backoffMultiplier: 1
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
  ERROR_DISPLAYED: 'error_screen_displayed',
  RETRY_ATTEMPTED: 'error_retry_attempted',
  RETRY_SUCCEEDED: 'error_retry_succeeded',
  RETRY_FAILED: 'error_retry_failed',
  GO_BACK_CLICKED: 'error_go_back_clicked',
  DETAILS_VIEWED: 'error_details_viewed',
  ERROR_REPORTED: 'error_reported',
  AUTO_RETRY_TRIGGERED: 'error_auto_retry_triggered'
};

// ============================================================================
// ERROR MESSAGES
// ============================================================================

export const DEFAULT_ERROR_MESSAGES = {
  [ERROR_TYPES.NETWORK]: {
    title: 'Network Connection Error',
    description: 'Unable to connect to our servers. Please check your internet connection and try again.',
    actionText: 'Check Connection'
  },
  [ERROR_TYPES.PERMISSION]: {
    title: 'Access Denied',
    description: 'You don\'t have permission to access this resource. Please contact your team administrator.',
    actionText: 'Contact Admin'
  },
  [ERROR_TYPES.NOT_FOUND]: {
    title: 'Resource Not Found',
    description: 'The resource you\'re looking for doesn\'t exist or has been removed.',
    actionText: 'Go Home'
  },
  [ERROR_TYPES.SERVER]: {
    title: 'Server Error',
    description: 'Our servers are experiencing issues. Please try again in a few moments.',
    actionText: 'Try Again'
  },
  [ERROR_TYPES.TIMEOUT]: {
    title: 'Request Timeout',
    description: 'The request took too long to complete. Please try again.',
    actionText: 'Retry'
  },
  [ERROR_TYPES.VALIDATION]: {
    title: 'Validation Error',
    description: 'There was an issue with the provided data. Please check and try again.',
    actionText: 'Fix Issues'
  },
  [ERROR_TYPES.AUTHENTICATION]: {
    title: 'Authentication Required',
    description: 'Please sign in to access this resource.',
    actionText: 'Sign In'
  },
  [ERROR_TYPES.RATE_LIMIT]: {
    title: 'Rate Limit Exceeded',
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
    '--error-info': '#4299e1'
  },
  [THEME_CONFIG.LIGHT]: {
    '--error-bg': '#ffffff',
    '--error-text': '#2d3748',
    '--error-text-muted': '#718096',
    '--error-border': '#e2e8f0',
    '--error-card-bg': '#f7fafc',
    '--error-danger': '#e53e3e',
    '--error-warning': '#d69e2e',
    '--error-info': '#4299e1'
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
  ENABLE_HAPTIC_FEEDBACK: false
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
  errorIdPattern: /^[a-zA-Z0-9-_]{8,32}$/
};

// ============================================================================
// EXPORT ALL CONSTANTS
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
  VALIDATION_RULES
};
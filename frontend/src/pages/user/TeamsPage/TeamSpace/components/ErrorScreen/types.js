/**
 * TypeScript-style type definitions for JavaScript PropTypes
 * Provides type documentation and validation for ErrorScreen components
 */

import PropTypes from 'prop-types';
import { ERROR_TYPES } from './constants';

/**
 * Error object shape
 */
export const ErrorShape = PropTypes.oneOfType([
  PropTypes.string,
  PropTypes.shape({
    message: PropTypes.string,
    name: PropTypes.string,
    code: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    status: PropTypes.number,
    stack: PropTypes.string,
    type: PropTypes.string
  }),
  PropTypes.instanceOf(Error)
]);

/**
 * Error type enum
 */
export const ErrorTypeEnum = PropTypes.oneOf(Object.values(ERROR_TYPES));

/**
 * Retry configuration shape
 */
export const RetryConfigShape = PropTypes.shape({
  maxRetries: PropTypes.number,
  retryDelay: PropTypes.number,
  backoffMultiplier: PropTypes.number,
  maxRetryDelay: PropTypes.number,
  autoRetry: PropTypes.bool,
  retryCondition: PropTypes.func
});

/**
 * Error context shape
 */
export const ErrorContextShape = PropTypes.shape({
  component: PropTypes.string,
  action: PropTypes.string,
  userId: PropTypes.string,
  teamId: PropTypes.string,
  sessionId: PropTypes.string,
  timestamp: PropTypes.number,
  metadata: PropTypes.object
});

/**
 * Tracking configuration shape
 */
export const TrackingConfigShape = PropTypes.shape({
  enableAnalytics: PropTypes.bool,
  enableConsoleLogging: PropTypes.bool,
  enableLocalStorage: PropTypes.bool,
  trackUserActions: PropTypes.bool,
  trackPerformance: PropTypes.bool,
  batchSize: PropTypes.number,
  flushInterval: PropTypes.number,
  maxStorageSize: PropTypes.number
});

/**
 * Error screen props shape
 */
export const ErrorScreenPropsShape = PropTypes.shape({
  error: ErrorShape,
  errorType: ErrorTypeEnum,
  errorId: PropTypes.string,
  title: PropTypes.string,
  description: PropTypes.string,
  onRetry: PropTypes.func,
  onGoBack: PropTypes.func,
  onReport: PropTypes.func,
  showDetails: PropTypes.bool,
  retryCount: PropTypes.number,
  maxRetries: PropTypes.number,
  retryDelay: PropTypes.number,
  autoRetry: PropTypes.bool,
  fullScreen: PropTypes.bool,
  className: PropTypes.string,
  actions: PropTypes.node,
  trackError: PropTypes.bool,
  userId: PropTypes.string,
  teamId: PropTypes.string,
  metadata: PropTypes.object
});

/**
 * Error actions props shape
 */
export const ErrorActionsPropsShape = PropTypes.shape({
  onRetry: PropTypes.func,
  onGoBack: PropTypes.func,
  onHelp: PropTypes.func,
  onReport: PropTypes.func,
  canRetry: PropTypes.bool,
  isRetrying: PropTypes.bool,
  retryCount: PropTypes.number,
  maxRetries: PropTypes.number,
  retryButtonText: PropTypes.string,
  showGoBack: PropTypes.bool,
  showHelp: PropTypes.bool,
  showReport: PropTypes.bool,
  errorType: ErrorTypeEnum,
  actionAlignment: PropTypes.oneOf(['left', 'center', 'right']),
  actionSize: PropTypes.oneOf(['small', 'medium', 'large']),
  customActions: PropTypes.node,
  className: PropTypes.string
});

/**
 * Error content props shape
 */
export const ErrorContentPropsShape = PropTypes.shape({
  title: PropTypes.string,
  description: PropTypes.string,
  error: ErrorShape,
  errorId: PropTypes.string,
  errorType: ErrorTypeEnum,
  showErrorId: PropTypes.bool,
  showRetryInfo: PropTypes.bool,
  showDetails: PropTypes.bool,
  retryCount: PropTypes.number,
  maxRetries: PropTypes.number,
  onToggleDetails: PropTypes.func,
  className: PropTypes.string,
  titleId: PropTypes.string,
  descriptionId: PropTypes.string
});

/**
 * Error icon props shape
 */
export const ErrorIconPropsShape = PropTypes.shape({
  errorType: ErrorTypeEnum,
  size: PropTypes.oneOf(['small', 'medium', 'large', 'xlarge']),
  animated: PropTypes.bool,
  className: PropTypes.string,
  ariaLabel: PropTypes.string,
  showPulse: PropTypes.bool,
  color: PropTypes.string
});

/**
 * Retry button props shape
 */
export const RetryButtonPropsShape = PropTypes.shape({
  onRetry: PropTypes.func,
  isRetrying: PropTypes.bool,
  retryCount: PropTypes.number,
  maxRetries: PropTypes.number,
  retryButtonText: PropTypes.string,
  disabled: PropTypes.bool,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  variant: PropTypes.oneOf(['primary', 'secondary', 'ghost']),
  countdown: PropTypes.number,
  errorType: PropTypes.string,
  showIcon: PropTypes.bool,
  className: PropTypes.string
});

/**
 * Validation error shape
 */
export const ValidationErrorShape = PropTypes.shape({
  field: PropTypes.string,
  message: PropTypes.string,
  messages: PropTypes.arrayOf(PropTypes.string),
  code: PropTypes.string,
  value: PropTypes.any
});

/**
 * Formatted error shape
 */
export const FormattedErrorShape = PropTypes.shape({
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  errorMessage: PropTypes.string,
  errorId: PropTypes.string,
  timestamp: PropTypes.string,
  errorType: ErrorTypeEnum.isRequired,
  severity: PropTypes.oneOf(['low', 'medium', 'high']),
  category: PropTypes.string,
  icon: PropTypes.string,
  color: PropTypes.string,
  details: PropTypes.object,
  context: PropTypes.object,
  actionText: PropTypes.string,
  helpLink: PropTypes.string,
  isRetryable: PropTypes.bool,
  userFriendly: PropTypes.bool
});

/**
 * Error tracking event shape
 */
export const ErrorTrackingEventShape = PropTypes.shape({
  id: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  sessionId: PropTypes.string.isRequired,
  errorId: PropTypes.string,
  timestamp: PropTypes.number.isRequired,
  errorType: ErrorTypeEnum,
  userId: PropTypes.string,
  teamId: PropTypes.string,
  url: PropTypes.string,
  userAgent: PropTypes.string,
  customData: PropTypes.object
});

/**
 * Component size enum
 */
export const ComponentSizeEnum = PropTypes.oneOf(['small', 'medium', 'large', 'xlarge']);

/**
 * Component variant enum
 */
export const ComponentVariantEnum = PropTypes.oneOf(['primary', 'secondary', 'ghost', 'danger', 'warning', 'success']);

/**
 * Alignment enum
 */
export const AlignmentEnum = PropTypes.oneOf(['left', 'center', 'right', 'justify']);

/**
 * Hook return types for documentation
 */
export const UseErrorScreenReturnShape = PropTypes.shape({
  error: ErrorShape,
  errorType: ErrorTypeEnum,
  errorId: PropTypes.string,
  isVisible: PropTypes.bool,
  hasBeenShown: PropTypes.bool,
  showDetails: PropTypes.bool,
  errorContext: PropTypes.object,
  retryCount: PropTypes.number,
  isRetrying: PropTypes.bool,
  retryTimer: PropTypes.number,
  canRetry: PropTypes.bool,
  retryStats: PropTypes.object,
  retryButtonText: PropTypes.string,
  retry: PropTypes.func,
  cancelRetry: PropTypes.func,
  resetRetries: PropTypes.func,
  handleGoBack: PropTypes.func,
  handleToggleDetails: PropTypes.func,
  handleDismiss: PropTypes.func,
  updateError: PropTypes.func,
  clearError: PropTypes.func,
  getErrorSummary: PropTypes.func,
  isTracking: PropTypes.bool,
  trackUserAction: PropTypes.func
});

export const UseRetryLogicReturnShape = PropTypes.shape({
  retryCount: PropTypes.number,
  isRetrying: PropTypes.bool,
  retryTimer: PropTypes.number,
  lastRetryTime: PropTypes.number,
  retryHistory: PropTypes.array,
  isAutoRetryPaused: PropTypes.bool,
  hasReachedMaxRetries: PropTypes.bool,
  canRetry: PropTypes.bool,
  nextRetryDelay: PropTypes.number,
  retryStats: PropTypes.object,
  retryButtonText: PropTypes.string,
  retry: PropTypes.func,
  executeRetry: PropTypes.func,
  cancelRetry: PropTypes.func,
  resetRetries: PropTypes.func,
  toggleAutoRetry: PropTypes.func,
  shouldRetry: PropTypes.func,
  clearTimers: PropTypes.func,
  errorConfig: PropTypes.object,
  maxRetries: PropTypes.number,
  initialRetryDelay: PropTypes.number,
  backoffMultiplier: PropTypes.number,
  maxRetryDelay: PropTypes.number
});

export const UseErrorTrackingReturnShape = PropTypes.shape({
  isTracking: PropTypes.bool,
  trackingSession: PropTypes.object,
  eventQueue: PropTypes.array,
  totalEvents: PropTypes.number,
  trackingStats: PropTypes.object,
  trackError: PropTypes.func,
  trackUserAction: PropTypes.func,
  trackPerformance: PropTypes.func,
  trackCustomEvent: PropTypes.func,
  flushEvents: PropTypes.func,
  clearTrackingData: PropTypes.func,
  toggleTracking: PropTypes.func,
  getTrackingSummary: PropTypes.func,
  saveToLocalStorage: PropTypes.func,
  loadFromLocalStorage: PropTypes.func,
  errorConfig: PropTypes.object,
  currentSessionId: PropTypes.string,
  currentErrorId: PropTypes.string,
  queueSize: PropTypes.number,
  sessionDuration: PropTypes.number,
  isQueueFull: PropTypes.bool
});

/**
 * Default prop values
 */
export const DefaultProps = {
  errorType: ERROR_TYPES.GENERIC,
  showDetails: false,
  trackError: true,
  maxRetries: 3,
  retryDelay: 1000,
  autoRetry: false,
  fullScreen: false,
  size: 'medium',
  variant: 'primary',
  alignment: 'center',
  animated: true,
  showIcon: true,
  className: '',
  metadata: {}
};

/**
 * Export all type shapes for use in components
 */
export default {
  ErrorShape,
  ErrorTypeEnum,
  RetryConfigShape,
  ErrorContextShape,
  TrackingConfigShape,
  ErrorScreenPropsShape,
  ErrorActionsPropsShape,
  ErrorContentPropsShape,
  ErrorIconPropsShape,
  RetryButtonPropsShape,
  ValidationErrorShape,
  FormattedErrorShape,
  ErrorTrackingEventShape,
  ComponentSizeEnum,
  ComponentVariantEnum,
  AlignmentEnum,
  UseErrorScreenReturnShape,
  UseRetryLogicReturnShape,
  UseErrorTrackingReturnShape,
  DefaultProps
};
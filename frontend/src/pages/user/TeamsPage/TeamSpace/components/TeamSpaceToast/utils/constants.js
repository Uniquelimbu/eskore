/**
 * Toast Constants and Default Values
 */

export const TOAST_CONSTANTS = {
  // Timing
  DEFAULT_DURATION: 5000,
  MIN_DURATION: 1000,
  MAX_DURATION: 30000,
  ANIMATION_DURATION: 300,
  
  // Container limits
  MAX_TOASTS: 5,
  TOAST_SPACING: 8,
  
  // Z-index
  TOAST_Z_INDEX: 10000,
  CONTAINER_Z_INDEX: 9999,
  
  // Responsive breakpoints
  MOBILE_BREAKPOINT: 768,
  SMALL_MOBILE_BREAKPOINT: 480,
  
  // Touch targets
  MIN_TOUCH_TARGET: 44,
  
  // Progress update interval
  PROGRESS_UPDATE_INTERVAL: 50
};

export const ACCESSIBILITY_LABELS = {
  dismiss: 'Dismiss notification',
  progress: 'Notification timer',
  container: 'Notifications container'
};

export const ANALYTICS_EVENTS = {
  DISPLAYED: 'toast_displayed',
  DISMISSED: 'toast_dismissed',
  ACTION_CLICKED: 'toast_action_clicked',
  CONTAINER_OVERFLOW: 'toast_container_overflow'
};

export const CSS_CLASSES = {
  // Base classes
  TOAST: 'team-space-toast',
  CONTAINER: 'toast-container',
  CONTENT: 'toast-content',
  
  // State classes
  VISIBLE: 'toast-visible',
  EXITING: 'toast-exiting',
  ANIMATED: 'toast-animated',
  PAUSED: 'toast-paused',
  DISMISSIBLE: 'toast-dismissible',
  
  // Component classes
  ICON: 'toast-icon',
  MESSAGE: 'toast-message',
  TITLE: 'toast-title',
  TEXT: 'toast-text',
  ACTION_BTN: 'toast-action-btn',
  DISMISS_BTN: 'toast-dismiss-btn',
  PROGRESS_BAR: 'toast-progress-bar',
  PROGRESS_FILL: 'toast-progress-fill',
  
  // Special classes
  LOADING_ICON: 'loading-icon',
  LOADING_SPINNER: 'loading-spinner-small'
};
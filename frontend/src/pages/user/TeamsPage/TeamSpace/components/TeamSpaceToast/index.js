/**
 * TeamSpaceToast Module - Simplified Re-exports
 * Lightweight module - complex features moved to main index.js
 */

// ============================================================================
// CORE COMPONENTS EXPORTS (SIMPLIFIED)
// ============================================================================

// Re-export main component as default
export { default } from './TeamSpaceToast';

// Re-export ToastContainer
export { default as ToastContainer } from './ToastContainer';

// Named export for main component
export { default as TeamSpaceToast } from './TeamSpaceToast';

// ============================================================================
// HOOKS EXPORTS
// ============================================================================

export { useTeamSpaceToast } from './hooks/useTeamSpaceToast';
export { useToastTimer } from './hooks/useToastTimer';

// ============================================================================
// MANAGER FUNCTIONS EXPORTS
// ============================================================================

export {
  showToast,
  hideToast,
  clearAllToasts,
  showSuccessToast,
  showErrorToast,
  showWarningToast,
  showInfoToast,
  showLoadingToast,
  setGlobalToastManager
} from './ToastManager';

// ============================================================================
// UTILITIES EXPORTS
// ============================================================================

export { TOAST_CONFIGS, TOAST_DEFAULTS } from './utils/toastConfig';
export { TOAST_CONSTANTS } from './utils/constants';
export { playNotificationSound, isSoundEnabled, setSoundEnabled } from './utils/soundUtils';

// ============================================================================
// SIMPLE COLLECTIONS (Lightweight)
// ============================================================================

/**
 * Basic component collections - Advanced features in main index.js
 */
export const ToastComponents = {
  TeamSpaceToast: require('./TeamSpaceToast').default,
  ToastContainer: require('./ToastContainer').default
};

export const ToastHooks = {
  useTeamSpaceToast: require('./hooks/useTeamSpaceToast').useTeamSpaceToast,
  useToastTimer: require('./hooks/useToastTimer').useToastTimer
};

// ============================================================================
// CONVENIENCE EXPORTS
// ============================================================================

/**
 * Quick access methods - simplified version
 */
export const toast = {
  success: require('./ToastManager').showSuccessToast,
  error: require('./ToastManager').showErrorToast,
  warning: require('./ToastManager').showWarningToast,
  info: require('./ToastManager').showInfoToast,
  loading: require('./ToastManager').showLoadingToast,
  show: require('./ToastManager').showToast,
  hide: require('./ToastManager').hideToast,
  clear: require('./ToastManager').clearAllToasts
};
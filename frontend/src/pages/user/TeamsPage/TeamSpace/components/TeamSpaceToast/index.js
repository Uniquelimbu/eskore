/**
 * TeamSpaceToast Module Exports
 * CRITICAL: Must export TeamSpaceToast as default
 */

// Import components first
import TeamSpaceToastComponent from './TeamSpaceToast';
import ToastContainerComponent from './ToastContainer';
import {
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

// ✅ CRITICAL: Export TeamSpaceToast as DEFAULT
export default TeamSpaceToastComponent;

// Named exports
export { default as TeamSpaceToast } from './TeamSpaceToast';
export { default as ToastContainer } from './ToastContainer';

// Manager functions
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

// Hooks (if they exist)
export { useTeamSpaceToast } from './hooks/useTeamSpaceToast';
export { useToastTimer } from './hooks/useToastTimer';

// Utilities (if they exist)
export { TOAST_CONFIGS, TOAST_DEFAULTS } from './utils/toastConfig';
export { TOAST_CONSTANTS } from './utils/constants';
export { playNotificationSound, isSoundEnabled, setSoundEnabled } from './utils/soundUtils';
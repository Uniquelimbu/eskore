/**
 * Global Toast Manager
 * Provides global toast functionality without requiring a provider
 */

let globalToastManager = null;

/**
 * Set the global toast manager instance
 */
export const setGlobalToastManager = (manager) => {
  globalToastManager = manager;
};

/**
 * Global toast functions
 */
export const showToast = (config) => {
  if (globalToastManager) {
    return globalToastManager.addToast(config);
  }
  console.warn('Toast manager not initialized. Use ToastProvider first.');
  return null;
};

export const hideToast = (id) => {
  if (globalToastManager) {
    return globalToastManager.removeToast(id);
  }
  console.warn('Toast manager not initialized. Use ToastProvider first.');
};

export const clearAllToasts = () => {
  if (globalToastManager) {
    return globalToastManager.clearAllToasts();
  }
  console.warn('Toast manager not initialized. Use ToastProvider first.');
};

// Convenience functions
export const showSuccessToast = (message, options = {}) => {
  return showToast({ type: 'success', message, ...options });
};

export const showErrorToast = (message, options = {}) => {
  return showToast({ type: 'error', message, persistent: true, ...options });
};

export const showWarningToast = (message, options = {}) => {
  return showToast({ type: 'warning', message, ...options });
};

export const showInfoToast = (message, options = {}) => {
  return showToast({ type: 'info', message, ...options });
};

export const showLoadingToast = (message, options = {}) => {
  return showToast({ 
    type: 'loading', 
    message, 
    persistent: true, 
    dismissible: false, 
    showProgress: false,
    ...options 
  });
};
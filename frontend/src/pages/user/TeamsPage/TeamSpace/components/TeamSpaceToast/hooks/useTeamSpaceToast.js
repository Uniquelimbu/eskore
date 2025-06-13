import { useState, useCallback } from 'react';
import { TOAST_CONSTANTS } from '../utils/constants';

/**
 * Main hook for managing toast state and operations
 */
export const useTeamSpaceToast = () => {
  const [toasts, setToasts] = useState([]);

  /**
   * Add a new toast
   */
  const addToast = useCallback((toastConfig) => {
    const id = toastConfig.id || `toast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newToast = { ...toastConfig, id };
    
    setToasts(prev => {
      const updated = [...prev, newToast];
      
      // Limit number of toasts
      if (updated.length > TOAST_CONSTANTS.MAX_TOASTS) {
        // Remove oldest toasts
        return updated.slice(-TOAST_CONSTANTS.MAX_TOASTS);
      }
      
      return updated;
    });
    
    return id;
  }, []);

  /**
   * Remove a toast by ID
   */
  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  /**
   * Clear all toasts
   */
  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  /**
   * Update a toast
   */
  const updateToast = useCallback((id, updates) => {
    setToasts(prev => prev.map(toast => 
      toast.id === id ? { ...toast, ...updates } : toast
    ));
  }, []);

  // Convenience methods
  const success = useCallback((message, options = {}) => {
    return addToast({ type: 'success', message, ...options });
  }, [addToast]);

  const error = useCallback((message, options = {}) => {
    return addToast({ type: 'error', message, persistent: true, ...options });
  }, [addToast]);

  const warning = useCallback((message, options = {}) => {
    return addToast({ type: 'warning', message, ...options });
  }, [addToast]);

  const info = useCallback((message, options = {}) => {
    return addToast({ type: 'info', message, ...options });
  }, [addToast]);

  const loading = useCallback((message, options = {}) => {
    return addToast({ 
      type: 'loading', 
      message, 
      persistent: true, 
      dismissible: false, 
      showProgress: false,
      ...options 
    });
  }, [addToast]);

  return {
    toasts,
    addToast,
    removeToast,
    updateToast,
    clearAllToasts,
    success,
    error,
    warning,
    info,
    loading
  };
};
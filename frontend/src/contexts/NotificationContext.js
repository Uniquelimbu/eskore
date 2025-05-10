import React, { createContext, useContext, useReducer, useCallback } from 'react';

// Action types
const ADD_NOTIFICATION = 'ADD_NOTIFICATION';
const REMOVE_NOTIFICATION = 'REMOVE_NOTIFICATION';
const CLEAR_ALL_NOTIFICATIONS = 'CLEAR_ALL_NOTIFICATIONS';

// Initial state
const initialState = {
  notifications: []
};

// Reducer to manage notifications
const notificationReducer = (state, action) => {
  switch (action.type) {
    case ADD_NOTIFICATION:
      return {
        ...state,
        notifications: [...state.notifications, action.payload]
      };
    case REMOVE_NOTIFICATION:
      return {
        ...state,
        notifications: state.notifications.filter(
          notification => notification.id !== action.payload
        )
      };
    case CLEAR_ALL_NOTIFICATIONS:
      return {
        ...state,
        notifications: []
      };
    default:
      return state;
  }
};

// Create the context
const NotificationContext = createContext();

// Provider component
export const NotificationProvider = ({ children }) => {
  const [state, dispatch] = useReducer(notificationReducer, initialState);
  
  // Generate a unique ID for notifications
  const generateId = () => `notification-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  
  // Remove a notification
  const removeNotification = useCallback((id) => {
    dispatch({ type: REMOVE_NOTIFICATION, payload: id });
  }, []);
  
  // Add a notification
  const addNotification = useCallback((notification) => {
    const id = notification.id || generateId();
    const type = notification.type || 'info';
    const autoHide = notification.autoHide !== false;
    const autoHideDuration = notification.autoHideDuration || 5000;
    
    const newNotification = {
      ...notification,
      id,
      type,
      timestamp: Date.now()
    };
    
    dispatch({ type: ADD_NOTIFICATION, payload: newNotification });
    
    // Auto hide after duration if enabled
    if (autoHide) {
      setTimeout(() => {
        removeNotification(id);
      }, autoHideDuration);
    }
    
    return id;
  }, [removeNotification]);
  
  // Show different types of notifications
  const showSuccess = useCallback((message, options = {}) => {
    return addNotification({ message, type: 'success', ...options });
  }, [addNotification]);
  
  const showError = useCallback((message, options = {}) => {
    return addNotification({ 
      message, 
      type: 'error', 
      autoHide: false, // Errors don't auto-hide by default
      ...options 
    });
  }, [addNotification]);
  
  const showInfo = useCallback((message, options = {}) => {
    return addNotification({ message, type: 'info', ...options });
  }, [addNotification]);
  
  const showWarning = useCallback((message, options = {}) => {
    return addNotification({ message, type: 'warning', ...options });
  }, [addNotification]);
  
  // Clear all notifications
  const clearAllNotifications = useCallback(() => {
    dispatch({ type: CLEAR_ALL_NOTIFICATIONS });
  }, []);
  
  // Value to be provided
  const value = {
    notifications: state.notifications,
    addNotification,
    removeNotification,
    clearAllNotifications,
    showSuccess,
    showError,
    showInfo,
    showWarning
  };
  
  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

// Custom hook to use the notification context
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export default NotificationContext;

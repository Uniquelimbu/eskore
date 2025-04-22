import React from 'react';
import { useNotification } from '../../../contexts/NotificationContext';
import './Notifications.css';

const NotificationItem = ({ notification, onClose }) => {
  const { id, message, type } = notification;
  
  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
      default:
        return 'ℹ';
    }
  };
  
  return (
    <div className={`notification-item ${type}`} role="alert">
      <div className="notification-icon">{getIcon()}</div>
      <div className="notification-content">{message}</div>
      <button 
        className="notification-close" 
        onClick={() => onClose(id)}
        aria-label="Close notification"
      >
        ×
      </button>
    </div>
  );
};

const Notifications = () => {
  const { notifications, removeNotification } = useNotification();
  
  if (notifications.length === 0) {
    return null;
  }
  
  return (
    <div className="notifications-container">
      {notifications.map(notification => (
        <NotificationItem 
          key={notification.id}
          notification={notification}
          onClose={removeNotification}
        />
      ))}
    </div>
  );
};

export default Notifications;

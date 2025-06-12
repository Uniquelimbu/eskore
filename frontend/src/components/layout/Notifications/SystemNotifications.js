import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, formatDistanceToNow } from 'date-fns';
import { apiClient } from '../../../services';
import './SystemNotifications.css';

const SystemNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const lastFetchRef = useRef(0);

  // Debounced fetch function to prevent excessive API calls
  const debouncedFetchNotifications = useCallback(
    debounce(async () => {
      const now = Date.now();
      // Prevent fetching more than once every 5 seconds
      if (now - lastFetchRef.current < 5000) {
        return;
      }
      
      lastFetchRef.current = now;
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await apiClient.getNotifications({ 
          limit: 10, 
          status: 'all' 
        });
        
        const countResponse = await apiClient.getUnreadNotificationCount();
        
        setNotifications(response?.notifications || []);
        setUnreadCount(countResponse || 0);
      } catch (err) {
        console.error('Error fetching notifications:', err);
        setError('Failed to load notifications');
      } finally {
        setIsLoading(false);
      }
    }, 1000),
    [setNotifications, setUnreadCount, setIsLoading, setError]
  );

  // Debounced unread count fetch for polling
  const debouncedFetchUnreadCount = useCallback(
    debounce(async () => {
      try {
        const countResponse = await apiClient.getUnreadNotificationCount();
        setUnreadCount(countResponse || 0);
      } catch (err) {
        console.error('Error fetching unread count:', err);
      }
    }, 2000),
    [setUnreadCount]
  );

  // Toggle dropdown
  const toggleDropdown = () => {
    setIsOpen(prev => !prev);
    if (!isOpen) {
      debouncedFetchNotifications();
    }
  };

  // Handle clicking outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch initial notifications and set up less aggressive polling
  useEffect(() => {
    debouncedFetchNotifications();
    
    // Reduce polling frequency to every 60 seconds
    const intervalId = setInterval(async () => {
      if (document.visibilityState === 'visible') {
        debouncedFetchUnreadCount();
        
        // Only refresh full notifications if dropdown is open
        if (isOpen) {
          debouncedFetchNotifications();
        }
      }
    }, 60000); // Increased from 30 seconds to 60 seconds
    
    return () => clearInterval(intervalId);
  }, [isOpen, debouncedFetchNotifications, debouncedFetchUnreadCount]);

  // Handle notification click based on type
  const handleNotificationClick = async (notification) => {
    // Mark as read
    if (notification.status === 'unread') {
      await apiClient.markNotificationRead(notification.id);
      
      // Update local state to reflect the change
      setNotifications(prevNotifications => 
        prevNotifications.map(n => 
          n.id === notification.id ? { ...n, status: 'read' } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
    
    // Handle different notification types
    switch (notification.type) {
      case 'invitation':
        // Navigate to notification details for invitations
        navigate(`/notifications/${notification.id}`);
        break;
      case 'join_request':
        // Navigate to team requests page
        navigate(`/teams/${notification.teamId}/requests`);
        break;
      case 'request_accepted':
        // Navigate to the team page
        navigate(`/teams/${notification.teamId}/space`);
        break;
      case 'request_denied':
        // Just acknowledge
        break;
      default:
        // Default handling
        break;
    }
    
    setIsOpen(false);
  };

  // Handle marking all as read
  const handleMarkAllRead = async () => {
    try {
      await apiClient.markAllNotificationsRead();
      setNotifications(prevNotifications => 
        prevNotifications.map(n => ({ ...n, status: 'read' }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  // Format notification time
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return formatDistanceToNow(date, { addSuffix: true });
    } else {
      return format(date, 'MMM d, yyyy');
    }
  };

  // Helper function to get icons for different notification types
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'invitation':
        return '✉️';
      case 'join_request':
        return '👥';
      case 'request_accepted':
        return '✓';
      case 'request_denied':
        return '✕';
      default:
        return 'ℹ️';
    }
  };

  return (
    <div className="system-notifications-container" ref={dropdownRef}>
      <div className="system-notifications-bell" onClick={toggleDropdown}>
        <span role="img" aria-label="notifications">🔔</span>
        {unreadCount > 0 && (
          <span className="system-notifications-badge">{unreadCount}</span>
        )}
      </div>
      
      {isOpen && (
        <div className="system-notifications-dropdown">
          <div className="system-notifications-header">
            <h3>Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={handleMarkAllRead} className="system-notifications-mark-all-read">
                Mark all as read
              </button>
            )}
          </div>
          
          <div className="system-notifications-list">
            {isLoading ? (
              <div className="system-notification-loading">Loading notifications...</div>
            ) : error ? (
              <div className="system-notification-error">
                {error}
                <button onClick={debouncedFetchNotifications} className="system-notification-retry-button">
                  Retry
                </button>
              </div>
            ) : notifications.length === 0 ? (
              <div className="system-notification-empty">No notifications</div>
            ) : (
              notifications.map(notification => (
                <div 
                  key={notification.id}
                  className={`system-notification-item ${notification.status === 'unread' ? 'unread' : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="system-notification-icon">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="system-notification-content">
                    <p className="system-notification-message">{notification.message}</p>
                    <p className="system-notification-time">
                      {formatTime(notification.createdAt)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemNotifications;

// Helper debounce function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
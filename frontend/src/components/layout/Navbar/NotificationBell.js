import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, formatDistanceToNow } from 'date-fns';
import { apiClient } from '../../../services';
import './NotificationBell.css';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Fetch notifications and unread count
  const fetchNotifications = async () => {
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
  };

  // Toggle dropdown
  const toggleDropdown = () => {
    setIsOpen(prev => !prev);
    if (!isOpen) {
      fetchNotifications();
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

  // Fetch initial notifications and set up polling
  useEffect(() => {
    fetchNotifications();
    
    // Set up polling for notifications every 30 seconds
    const intervalId = setInterval(async () => {
      if (document.visibilityState === 'visible') {
        const countResponse = await apiClient.getUnreadNotificationCount();
        setUnreadCount(countResponse || 0);
        
        // If dropdown is open, refresh notifications too
        if (isOpen) {
          fetchNotifications();
        }
      }
    }, 30000);
    
    return () => clearInterval(intervalId);
  }, [isOpen]);

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
        // Navigate to invitations view
        navigate(`/invitations/${notification.id}`);
        break;
      case 'join_request':
        // Navigate to team management page
        navigate(`/teams/${notification.teamId}/space/squad`);
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
    <div className="notification-bell-container" ref={dropdownRef}>
      <div className="notification-bell" onClick={toggleDropdown}>
        <span role="img" aria-label="notifications">🔔</span>
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </div>
      
      {isOpen && (
        <div className="notifications-dropdown">
          <div className="notifications-header">
            <h3>Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={handleMarkAllRead} className="mark-all-read">
                Mark all as read
              </button>
            )}
          </div>
          
          <div className="notifications-list">
            {isLoading ? (
              <div className="notification-loading">Loading notifications...</div>
            ) : error ? (
              <div className="notification-error">
                {error}
                <button onClick={fetchNotifications} className="retry-button">
                  Retry
                </button>
              </div>
            ) : notifications.length === 0 ? (
              <div className="notification-empty">No notifications</div>
            ) : (
              notifications.map(notification => (
                <div 
                  key={notification.id}
                  className={`notification-item ${notification.status === 'unread' ? 'unread' : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="notification-icon">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="notification-content">
                    <p className="notification-message">{notification.message}</p>
                    <p className="notification-time">
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

export default NotificationBell;

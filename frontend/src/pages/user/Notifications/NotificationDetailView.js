import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageLayout from '../../../components/layout/PageLayout/PageLayout';
import { apiClient } from '../../../services';
import { toast } from 'react-toastify';
import './NotificationDetailView.css';

const NotificationDetailView = () => {
  const [notification, setNotification] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const { notificationId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNotification = async () => {
      try {
        // Fetch the specific notification
        const response = await apiClient.get(`/notifications/${notificationId}`);
        
        if (response && response.notification) {
          setNotification(response.notification);
          
          // Mark as read if it's not already
          if (response.notification.status === 'unread') {
            await apiClient.markNotificationRead(notificationId);
          }
        } else {
          toast.error('Notification not found');
        }
      } catch (error) {
        console.error('Error fetching notification:', error);
        toast.error('Failed to load notification details');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchNotification();
  }, [notificationId]);

  const handleAccept = async () => {
    setIsProcessing(true);
    try {
      const response = await apiClient.acceptNotification(notificationId);
      toast.success(response.message || 'Notification accepted');
      
      // Navigate based on the notification type
      if (notification.teamId) {
        navigate(`/teams/${notification.teamId}/space`);
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error accepting notification:', error);
      toast.error('Failed to accept: ' + (error.message || 'Unknown error'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    const reason = window.prompt('Reason for declining (optional):');
    
    setIsProcessing(true);
    try {
      const response = await apiClient.rejectNotification(notificationId, reason);
      toast.info(response.message || 'Notification rejected');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error rejecting notification:', error);
      toast.error('Failed to reject: ' + (error.message || 'Unknown error'));
    } finally {
      setIsProcessing(false);
    }
  };

  // Function to determine notification title
  const getNotificationTitle = (notification) => {
    switch (notification.type) {
      case 'invitation':
        return 'Team Invitation';
      case 'join_request':
        return 'Join Request';
      case 'request_accepted':
        return 'Request Accepted';
      case 'request_denied':
        return 'Request Denied';
      default:
        return 'Notification';
    }
  };

  if (isLoading) {
    return (
      <PageLayout>
        <div className="notification-loading">Loading notification details...</div>
      </PageLayout>
    );
  }

  if (!notification) {
    return (
      <PageLayout>
        <div className="notification-error">Notification not found</div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="notification-detail">
        <div className="notification-detail-header">
          <h2>{getNotificationTitle(notification)}</h2>
        </div>
        
        <div className="notification-detail-content">
          <p className="notification-detail-message">{notification.message}</p>
          
          {notification.metadata && (
            <div className="notification-detail-metadata">
              {notification.metadata.managerMessage && (
                <div className="notification-detail-message-box">
                  <h4>Message:</h4>
                  <p>{notification.metadata.managerMessage}</p>
                </div>
              )}
              
              {notification.metadata.reason && (
                <div className="notification-detail-message-box">
                  <h4>Reason:</h4>
                  <p>{notification.metadata.reason}</p>
                </div>
              )}
            </div>
          )}
        </div>
        
        {['invitation', 'join_request'].includes(notification.type) && 
         notification.status !== 'archived' && (
          <div className="notification-detail-actions">
            <button 
              className="notification-detail-button accept"
              onClick={handleAccept}
              disabled={isProcessing}
            >
              {isProcessing ? 'Processing...' : 'Accept'}
            </button>
            <button 
              className="notification-detail-button reject"
              onClick={handleReject}
              disabled={isProcessing}
            >
              {isProcessing ? 'Processing...' : 'Reject'}
            </button>
          </div>
        )}
        
        <button 
          className="notification-detail-button back"
          onClick={() => navigate(-1)}
        >
          Back
        </button>
      </div>
    </PageLayout>
  );
};

export default NotificationDetailView;

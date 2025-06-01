/**
 * Notification API extensions for the API client
 */
export const applyNotificationExtensions = (apiClient) => {
  /**
   * Get notifications with optional filtering
   * 
   * @param {Object} options - Query options
   * @param {string} options.status - Filter by status (unread, read, archived, all)
   * @param {number} options.limit - Maximum number of notifications to return
   * @param {number} options.offset - Pagination offset
   * @returns {Promise<Object>} - The notifications response
   */
  apiClient.getNotifications = async function(options = {}) {
    const params = {
      status: options.status || 'unread',
      limit: options.limit || 10,
      offset: options.offset || 0
    };
    
    try {
      return await this.get('/notifications', { params });
    } catch (error) {
      console.error('Error fetching notifications:', error);
      // Return a consistent response structure to avoid errors in consumers
      return { 
        notifications: [], 
        count: 0, 
        error: error?.message || 'Unknown error'
      };
    }
  };

  /**
   * Get count of unread notifications
   * 
   * @returns {Promise<number>} - The count of unread notifications
   */
  apiClient.getUnreadNotificationCount = async function() {
    try {
      // Try to get count from server with short timeout
      const response = await this.get('/notifications/unread-count', {
        timeout: 3000 // Shorter timeout to avoid UI blocking
      });
      return response?.count || 0;
    } catch (error) {
      console.error('Error fetching unread notification count:', error);
      if (error.message.includes('Network Error') || error.code === 'ECONNABORTED') {
        // Log specific network errors for troubleshooting
        console.warn('Network error or timeout when fetching notifications');
      }
      // Return 0 as fallback and don't break the app
      return 0;
    }
  };

  /**
   * Mark a notification as read
   * 
   * @param {number|string} id - The notification ID to mark as read
   * @returns {Promise<Object>} - The updated notification
   */
  apiClient.markNotificationRead = async function(id) {
    try {
      return await this.put(`/notifications/${id}/read`);
    } catch (error) {
      console.error(`Error marking notification ${id} as read:`, error);
      throw error;
    }
  };

  /**
   * Mark all notifications as read
   * 
   * @returns {Promise<Object>} - The response
   */
  apiClient.markAllNotificationsRead = async function() {
    try {
      return await this.put('/notifications/read-all');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  };

  /**
   * Accept a notification
   * 
   * @param {number|string} notificationId - The notification ID to accept
   * @returns {Promise<Object>} - The response
   */
  apiClient.acceptNotification = async function(notificationId) {
    try {
      return await this.post(`/notifications/${notificationId}/accept`);
    } catch (error) {
      console.error('Error accepting notification:', error);
      throw error;
    }
  };

  /**
   * Reject a notification
   * 
   * @param {number|string} notificationId - The notification ID to reject
   * @param {string} [reason=''] - The reason for rejection
   * @returns {Promise<Object>} - The response
   */
  apiClient.rejectNotification = async function(notificationId, reason = '') {
    try {
      return await this.post(`/notifications/${notificationId}/reject`, { reason });
    } catch (error) {
      console.error('Error rejecting notification:', error);
      throw error;
    }
  };
};

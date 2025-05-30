import { TIMEOUT_CONFIG } from '../config';
import { applyCircuitBreaker } from '../utils/circuitBreaker';

export const applyRequestExtensions = (apiClient) => {
  // Store the original methods
  const originalDelete = apiClient.delete;
  const originalPost = apiClient.post;
  const originalPatch = apiClient.patch;

  // Override the delete method
  apiClient.delete = function(url, config = {}) {
    const isTeamDeletion = url.startsWith('/teams/') && url.split('/').length === 4;
    // Set a shorter timeout for delete operations, especially for team deletion
    const timeout = isTeamDeletion ? TIMEOUT_CONFIG.TEAM_DELETION : TIMEOUT_CONFIG.EXTENDED;
    
    if (isTeamDeletion) {
      console.log(`Using standard timeout for team deletion: ${url}`);
    }
    
    // Use circuit breaker for delete operations to prevent server overload
    return applyCircuitBreaker(() => 
      originalDelete.call(this, url, { 
        ...config, 
        timeout 
      })
    ).catch(error => {
      console.error(`Error in DELETE request to ${url}: `, error);
      
      // If it's a timeout, provide a more specific error
      if (error.code === 'ECONNABORTED' || (error.message && error.message.includes('timeout'))) {
        throw new Error('Request timed out. The operation might still be processing on the server.');
      }
      
      throw error;
    });
  };

  // Override the post method
  apiClient.post = function(url, data, config = {}) {
    // Add special handling for team creation
    if (url === '/teams') {
      return originalPost.call(this, url, data, { 
        ...config, 
        timeout: TIMEOUT_CONFIG.TEAM_CREATION,
        headers: {
          ...config.headers,
          'Authorization': `Bearer ${localStorage.getItem('token')}` // Ensure token is sent
        }
      }).catch(error => {
        console.error(`Error in POST request to ${url}:`, error);
        
        // Check for specific team creation errors
        if (error.response?.status === 401) {
          console.error('Authorization failed when creating team - token may be invalid');
        } else if (error.response?.status === 500) {
          console.error('Server error during team creation:', error.response.data);
        }
        
        // Rethrow the error for the caller to handle
        throw error;
      });
    }
    return originalPost.call(this, url, data, config);
  };

  // Override the patch method
  apiClient.patch = function(url, data, config = {}) {
    // Increase timeout specifically for team updates
    if (url.startsWith('/teams/') && url.split('/').length <= 3) {
      console.log(`Using extended timeout for team update: ${url}`);
      return originalPatch.call(this, url, data, { 
        ...config, 
        timeout: TIMEOUT_CONFIG.TEAM_UPDATE
      });
    }
    return originalPatch.call(this, url, data, config);
  };

  // Add utility to check server connectivity
  apiClient.checkConnectivity = async function() {
    try {
      console.log('Checking API server connectivity...');
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_CONFIG.HEALTH_CHECK);
      
      const response = await this.get('/health', { 
        signal: controller.signal,
        skipRetry: true,
        skipCache: true
      });
      
      clearTimeout(timeoutId);
      
      if (response && response.status === 'ok') {
        console.log('API server is reachable and healthy');
        return true;
      } else {
        console.warn('API server responded but may not be fully operational', response);
        return false;
      }
    } catch (error) {
      console.error('API server connectivity check failed:', error);
      return false;
    }
  };

  return apiClient;
};

export default applyRequestExtensions;

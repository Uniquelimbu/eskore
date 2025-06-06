import { TIMEOUT_CONFIG } from '../config';
import { applyCircuitBreaker } from '../utils/circuitBreaker';

// Constants for retry strategies
const RETRY_STRATEGIES = {
  EXPONENTIAL_BACKOFF: 'exponential',
  LINEAR_BACKOFF: 'linear',
  IMMEDIATE: 'immediate'
};

// Enhanced utility for response validation
const isValidResponse = (response) => {
  return response && 
         (Array.isArray(response.members) || 
          Array.isArray(response.data?.members) ||
          Array.isArray(response.Users) ||
          Array.isArray(response.data?.Users) ||
          Array.isArray(response));
};

// Create a team member cache to prevent repeated server failures
const memberCache = new Map();

export const applyTeamExtensions = (apiClient) => {
  const normalizeTeamMembersResponse = (response, requestId = 'unknown') => {
    try {
      // Extract members from response - handle different response structures
      let members = [];
      if (response?.members) {
        members = response.members;
      } else if (response?.data?.members) {
        members = response.data.members;
      } else if (Array.isArray(response)) {
        members = response;
      }

      const normalizedMembers = members.map(member => {
        // Extract user data from different possible structures
        const userData = member.User || member.user || member;
        
        return {
          id: member.id || member.userId || userData.id || `unknown-${Math.random().toString(36).substr(2, 9)}`,
          userId: member.userId || member.id || userData.id,
          firstName: userData.firstName || member.firstName || '',
          lastName: userData.lastName || member.lastName || '',
          email: userData.email || member.email || '',
          role: member.role || userData.role || 'athlete',
          Player: member.Player || userData.Player || null,
          profileImageUrl: userData.profileImageUrl || member.profileImageUrl || null
        };
      });

      return { members: normalizedMembers, team: response.team || null };
    } catch (err) {
      console.error(`TeamMembers[${requestId}]: Error normalizing response:`, err);
      return { members: [], team: null };
    }
  };

  // Add a specific method for team requests with shorter timeout
  apiClient.getTeam = async function(teamId, options = {}) {
    // Validate teamId
    if (!teamId || isNaN(parseInt(teamId, 10))) {
      console.error('Invalid team ID provided:', teamId);
      return Promise.reject({
        status: 400,
        message: 'Invalid team ID provided',
        originalError: new Error('Invalid team ID')
      });
    }
    
    // Enhanced options with defaults
    const timeoutMs = options.timeout || TIMEOUT_CONFIG.TEAM_REQUEST;
    const retryCount = options.retryCount || 1;
    const retryStrategy = options.retryStrategy || RETRY_STRATEGIES.EXPONENTIAL_BACKOFF;
    
    let attempts = 0;
    let lastError = null;
    
    while (attempts <= retryCount) {
      try {
        console.log(`Team request attempt ${attempts + 1}/${retryCount + 1} for ID: ${teamId}`);
        
        const teamClient = this.withTimeout(timeoutMs);
        // Copy interceptors from main instance
        teamClient.interceptors.request = this.interceptors.request;
        teamClient.interceptors.response = this.interceptors.response;
        
        // Add cache busting for retries
        const params = attempts > 0 ? { _t: Date.now() } : {};
        
        const response = await teamClient.get(`/teams/${teamId}`, { params });
        return response;
      } catch (error) {
        attempts++;
        lastError = error;
        
        const shouldRetry = attempts <= retryCount && 
                            (error.status >= 500 || !error.status || error.code === 'ECONNABORTED');
        
        if (shouldRetry) {
          console.warn(`Team request failed (attempt ${attempts}/${retryCount + 1}). Retrying...`, error);
          
          // Determine delay based on selected strategy
          let delayMs = 0;
          switch (retryStrategy) {
            case RETRY_STRATEGIES.EXPONENTIAL_BACKOFF:
              delayMs = Math.min(1000 * Math.pow(2, attempts - 1), 10000);
              break;
            case RETRY_STRATEGIES.LINEAR_BACKOFF:
              delayMs = 1000 * attempts;
              break;
            case RETRY_STRATEGIES.IMMEDIATE:
              delayMs = 0;
              break;
            default:
              delayMs = 500; // Default delay
              break;
          }
          
          if (delayMs > 0) {
            await new Promise(resolve => setTimeout(resolve, delayMs));
          }
        } else {
          // Enhanced error reporting
          console.error(`Team request failed after ${attempts} attempts:`, {
            teamId,
            status: error.status || 'unknown',
            message: error.message || 'No message',
            code: error.code || 'No code'
          });
          throw error;
        }
      }
    }
    
    // If we've exhausted retries, throw the last error
    throw lastError || new Error('Failed to fetch team after multiple attempts');
  };

  // Add a specific method for team member requests with appropriate timeout and error handling
  apiClient.getTeamMembers = async function(teamId, options = {}) {
    // Input validation
    if (!teamId) {
      console.error('getTeamMembers: Missing teamId parameter');
      return Promise.reject({
        status: 400,
        message: 'Team ID is required',
        originalError: new Error('Missing teamId parameter')
      });
    }
    
    // Normalize teamId to ensure it's valid
    const normalizedTeamId = parseInt(teamId, 10);
    if (isNaN(normalizedTeamId)) {
      console.error('getTeamMembers: Invalid teamId format:', teamId);
      return Promise.reject({
        status: 400,
        message: 'Invalid team ID format',
        originalError: new Error('Invalid teamId format')
      });
    }
    
    // Check if we have cached data first
    const cacheKey = `team_members_${teamId}`;
    const cachedData = memberCache.get(cacheKey);
    const now = Date.now();
    const cacheMaxAge = 60000; // 1 minute cache
    
    // Return valid cached data
    if (cachedData && now - cachedData.timestamp < cacheMaxAge && !options.bypassCache) {
      console.log(`TeamMembers: Using cached data for team ${normalizedTeamId} from ${new Date(cachedData.timestamp).toISOString()}`);
      return cachedData.data;
    }
    
    // Enhanced options with more granular configuration
    const timeoutMs = options.timeout || TIMEOUT_CONFIG.TEAM_MEMBERS;
    const maxAttempts = options.maxRetries || 1; // Reduced to just 1 retry (total of 2 attempts)
    const retryStrategy = options.retryStrategy || RETRY_STRATEGIES.EXPONENTIAL_BACKOFF;
    const bailOnServerError = options.bailOnServerError !== undefined ? options.bailOnServerError : false;
    // Remove useMockOnFailure since it's not used
    
    // Create a dedicated client instance for member requests
    const teamMembersClient = this.withTimeout(timeoutMs);
    // Copy interceptors from main instance
    teamMembersClient.interceptors.request = this.interceptors.request;
    teamMembersClient.interceptors.response = this.interceptors.response;
    
    // Diagnostic timestamps for performance tracking
    const startTime = Date.now();
    console.log(`TeamMembers: Starting fetch for team ${normalizedTeamId} at ${new Date().toISOString()}`);
    
    // For diagnostic tracing
    const requestId = `tm-${normalizedTeamId}-${Date.now().toString(36)}`;
    
    // Track success/failure metrics
    const metrics = {
      attempts: 0,
      endpoints: [],
      errors: [],
      timings: []
    };
    
    // MODIFIED: Use only one endpoint - the correct API endpoint
    // Remove all alternative endpoints that were causing issues
    const endpoint = `/teams/${normalizedTeamId}/members`;
    
    try {
      console.log(`TeamMembers[${requestId}]: Fetching members for team ${normalizedTeamId} using endpoint: ${endpoint}`);
      
      let attempts = 0;
      let lastError = null;
      
      // Simplified retry logic with just the one correct endpoint
      while (attempts <= maxAttempts) {
        const attemptStart = Date.now();
        
        try {
          metrics.endpoints.push(endpoint);
          
          console.log(`TeamMembers[${requestId}]: Attempt ${attempts + 1}/${maxAttempts + 1}`);
          
          // Use params-only configuration to avoid CORS issues
          const requestConfig = {
            params: {
              _t: Date.now() + Math.random(),  // Cache busting
              retry: attempts
            },
            // Add explicit timeout to prevent hanging requests
            timeout: timeoutMs
          };
          
          const requestStart = Date.now();
          let response;
          
          // For the first attempt, use circuit breaker pattern
          if (attempts === 0) {
            response = await applyCircuitBreaker(() => 
              teamMembersClient.get(endpoint, requestConfig)
            );
          } else {
            // For retries, bypass circuit breaker to avoid cascading failures
            response = await teamMembersClient.get(endpoint, requestConfig);
          }
          
          const requestEnd = Date.now();
          console.log(`TeamMembers[${requestId}]: Request completed in ${requestEnd - requestStart}ms`);
          
          // For additional robustness, verify the response format
          if (!response) {
            throw new Error('Empty response received');
          }
          
          if (!isValidResponse(response)) {
            console.warn(`TeamMembers[${requestId}]: Response validation failed, unexpected format:`, 
              Object.keys(response || {}).join(', '));
            
            // Try to recover by checking if the response is directly the data we need
            if (response && typeof response === 'object') {
              console.log(`TeamMembers[${requestId}]: Attempting response recovery...`);
            } else {
              throw new Error('Invalid response format received');
            }
          }
          
          // Normalize response format with enhanced recovery mechanisms
          const normalizedResponse = normalizeTeamMembersResponse(response, requestId);
          
          // Cache successful response
          memberCache.set(cacheKey, {
            data: normalizedResponse,
            timestamp: Date.now()
          });
          
          // Log performance metrics
          metrics.timings.push(Date.now() - attemptStart);
          const totalTime = Date.now() - startTime;
          console.log(`TeamMembers[${requestId}]: Total operation took ${totalTime}ms with ${attempts + 1} attempt(s)`);
          
          return normalizedResponse;
        } catch (retryError) {
          attempts++;
          metrics.attempts = attempts;
          lastError = retryError;
          
          // Enhanced error logging
          const errorDetails = {
            status: retryError.status || retryError.response?.status,
            message: retryError.message || 'Unknown error',
            code: retryError.code || retryError.name || 'UnknownError'
          };
          
          metrics.errors.push(errorDetails);
          
          console.warn(`TeamMembers[${requestId}]: Attempt ${attempts}/${maxAttempts + 1} failed:`, errorDetails);
          
          // Check if we should bail early
          const shouldBailEarly = 
            (bailOnServerError && errorDetails.status === 500) || 
            attempts > maxAttempts;
            
          if (shouldBailEarly) {
            console.log(`TeamMembers[${requestId}]: Bailing early after attempt ${attempts}`);
            break;
          }
          
          // Wait before retrying with safe backoff
          let delayMs = 0;
          
          switch (retryStrategy) {
            case RETRY_STRATEGIES.EXPONENTIAL_BACKOFF:
              // Base * 2^attempt with 0-25% jitter
              const baseDelay = 1000 * Math.pow(2, attempts - 1);
              const jitterFactor = 1 + (Math.random() * 0.25); 
              delayMs = Math.min(baseDelay * jitterFactor, 8000);
              break;
            case RETRY_STRATEGIES.LINEAR_BACKOFF:
              delayMs = 1000 * attempts;
              break;
            default:
              delayMs = 500; // Small default delay
          }
          
          console.log(`TeamMembers[${requestId}]: Waiting ${delayMs}ms before next attempt...`);
          
          // Wait before retrying with the safe currentAttempt value closure
          const currentAttempt = attempts;
          await new Promise(resolve => {
            setTimeout(resolve, delayMs);
            console.log(`TeamMembers[${requestId}]: Retry ${currentAttempt} delay complete.`);
          });
        }
      }
      
      // All attempts failed - try to recover with fallback strategies
      
      // Use lastError for final error handling
      console.error(`TeamMembers[${requestId}]: All attempts failed:`, lastError);
      
      // STRATEGY 1: Check if we have stale cached data we can use
      if (cachedData) {
        console.log(`TeamMembers[${requestId}]: Using stale cache after failed attempts`);
        // Mark data as stale but return it anyway
        return {
          ...cachedData.data,
          stale: true,
          lastRefreshAttempt: new Date().toISOString()
        };
      }
      
      // Remove STRATEGY 2 which used mock data
      // Instead, return an object with empty members array
      console.log(`TeamMembers[${requestId}]: All attempts failed, returning empty members array`);
      return {
        members: [],
        team: { id: normalizedTeamId },
        success: false,
        error: "Failed to fetch team members after multiple attempts",
        meta: {
          requestId,
          normalizedAt: new Date().toISOString(),
          attempts: metrics.attempts
        }
      };
      
    } catch (error) {
      console.error(`TeamMembers[${requestId}]: Fatal error for team ${teamId}:`, error);
      
      // Try to extract useful information from the error
      const errorStatus = error.status || error.response?.status || 500;
      
      // Provide specific error messages based on status code
      let errorMessage;
      switch (errorStatus) {
        case 400: errorMessage = 'Invalid request when loading team members'; break;
        case 401: errorMessage = 'Authentication required to view team members'; break;
        case 403: errorMessage = 'You don\'t have permission to view this team\'s members'; break;
        case 404: errorMessage = 'Team not found or has no members'; break;
        case 429: errorMessage = 'Too many requests. Please try again later.'; break;
        case 500: errorMessage = 'Server error loading team members. Please try again shortly.'; break;
        case 503: errorMessage = 'Service temporarily unavailable. Please try again later.'; break;
        default: errorMessage = 'Failed to load team members. Please try again later.';
      }
      
      // Before throwing - check if we can use fallbacks
      if (cachedData) {
        console.log(`TeamMembers[${requestId}]: Using stale cache after fatal error`);
        return {
          ...cachedData.data,
          stale: true,
          error: errorMessage
        };
      }
      
      // Remove mock data fallback and instead return empty members array
      console.log(`TeamMembers[${requestId}]: Fatal error, returning empty members array`);
      return {
        members: [],
        success: false,
        error: errorMessage,
        status: errorStatus,
        timestamp: new Date().toISOString(),
        requestId: requestId
      };
    }
  };
  
  // Update joinTeam method to support both direct join and request to join
  apiClient.joinTeam = async function(teamId, joinData) {
    try {
      // Get the current user's ID from auth endpoint
      const currentUser = await this.get('/auth/me');
      const userId = currentUser?.id;
      
      if (!userId) {
        throw new Error('Could not determine user ID for team join request');
      }
      
      console.log(`Joining team ${teamId} as user ${userId} with role ${joinData.role}`);
      
      const team = await this.get(`/teams/${teamId}`);
      
      // If team is public and requires approval, send join request
      if (team.requiresApproval || team.visibility === 'private') {
        console.log('Team requires approval, sending join request');
        const joinRequestResponse = await this.post('/notifications/team-join-request', {
          teamId: teamId,
          role: joinData.role,
          message: joinData.message || '',
          playerData: joinData.playerData || null
        });
        
        return {
          success: true,
          message: 'Join request sent to team managers',
          isPending: true,
          ...joinRequestResponse
        };
      }
      
      // If team is public and doesn't require approval, join directly
      const joinResponse = await this.post(`/teams/${teamId}/members`, {
        userId: userId,
        role: joinData.role
      });
      
      // If player data was provided, save that as well
      if (joinResponse.success && joinData.playerData) {
        console.log('Creating player profile with data:', joinData.playerData);
        await this.post('/players', {
          ...joinData.playerData,
          teamId: teamId
        });
      }
      
      return joinResponse;
    } catch (error) {
      console.error('Error joining team:', error);
      throw error;
    }
  };
  
  // Add method to invite players to a team
  apiClient.inviteToTeam = async function(teamId, inviteData) {
    try {
      const { email, role, message } = inviteData;
      
      console.log(`Inviting ${email} to team ${teamId} as ${role}`);
      
      const response = await this.post('/notifications/team-invitation', {
        teamId,
        email,
        role,
        message
      });
      
      return response;
    } catch (error) {
      console.error('Error inviting user to team:', error);
      throw error;
    }
  };
  
  // Add method to get notifications
  apiClient.getNotifications = async function(options = {}) {
    try {
      const { status = 'all', limit = 20, offset = 0 } = options;
      
      const response = await this.get('/notifications', {
        params: { status, limit, offset }
      });
      
      return response;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  };
  
  // Add method to get unread notification count
  apiClient.getUnreadNotificationCount = async function() {
    try {
      const response = await this.get('/notifications/unread-count');
      return response?.count || 0;
    } catch (error) {
      console.error('Error fetching unread notification count:', error);
      return 0; // Return 0 as fallback
    }
  };
  
  // Add methods to handle notification actions
  apiClient.acceptNotification = async function(notificationId) {
    try {
      const response = await this.post(`/notifications/${notificationId}/accept`);
      return response;
    } catch (error) {
      console.error('Error accepting notification:', error);
      throw error;
    }
  };
  
  apiClient.rejectNotification = async function(notificationId, reason = '') {
    try {
      const response = await this.post(`/notifications/${notificationId}/reject`, { reason });
      return response;
    } catch (error) {
      console.error('Error rejecting notification:', error);
      throw error;
    }
  };
  
  apiClient.markNotificationRead = async function(notificationId) {
    try {
      const response = await this.put(`/notifications/${notificationId}/read`);
      return response;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  };
  
  // Add method to get team join requests
  apiClient.getTeamJoinRequests = async function(teamId) {
    try {
      const response = await this.get(`/teams/${teamId}/join-requests`);
      return response;
    } catch (error) {
      console.error('Error fetching team join requests:', error);
      throw error;
    }
  };

  // Add method to accept team join request
  apiClient.acceptTeamJoinRequest = async function(requestId) {
    try {
      const response = await this.post(`/teams/join-requests/${requestId}/accept`);
      return response;
    } catch (error) {
      console.error('Error accepting team join request:', error);
      throw error;
    }
  };

  // Add method to reject team join request
  apiClient.rejectTeamJoinRequest = async function(requestId, reason = '') {
    try {
      const response = await this.post(`/teams/join-requests/${requestId}/reject`, { reason });
      return response;
    } catch (error) {
      console.error('Error rejecting team join request:', error);
      throw error;
    }
  };
  
  apiClient.markAllNotificationsRead = async function() {
    try {
      const response = await this.put('/notifications/read-all');
      return response;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  };
};

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
    const useMockOnFailure = options.useMockOnFailure !== undefined ? options.useMockOnFailure : false;
    
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
  
  // Normalize team members response to a consistent format with enhanced reliability
  const normalizeTeamMembersResponse = (response, requestId = 'unknown') => {
    // Default structure to return if we can't extract data
    const defaultStructure = { members: [], team: null, success: false };
    
    if (!response) {
      console.warn(`TeamMembers[${requestId}]: Empty response received`);
      return defaultStructure;
    }
    
    try {
      // Try to extract members data from various possible locations in the response
      let members = null;
      let team = null;
      
      console.log(`TeamMembers[${requestId}]: Normalizing response. Available keys:`, 
        Object.keys(response).join(', '));
      
      // Enhanced path resolution with more possible structures
      const possibleMembersPaths = [
        response.members,
        response.data?.members,
        response.Users,
        response.data?.Users,
        response.team?.members,
        response.data?.team?.members,
        response.users,
        response.data?.users,
        response.roster,
        response.data?.roster
      ];
      
      // Find first valid members array
      for (const path of possibleMembersPaths) {
        if (Array.isArray(path)) {
          members = path;
          console.log(`TeamMembers[${requestId}]: Found members array with ${members.length} items`);
          break;
        }
      }
      
      // Special case: Response itself is an array
      if (!members && Array.isArray(response)) {
        console.log(`TeamMembers[${requestId}]: Response itself is an array with ${response.length} items`);
        members = response;
      }
      
      // Extract team data if available
      const possibleTeamPaths = [
        response.team,
        response.data?.team,
        response.teamInfo,
        response.data?.teamInfo
      ];
      
      for (const path of possibleTeamPaths) {
        if (path && typeof path === 'object') {
          team = path;
          console.log(`TeamMembers[${requestId}]: Found team info`);
          break;
        }
      }
      
      // Ensure members is always an array
      if (!members || !Array.isArray(members)) {
        console.warn(`TeamMembers[${requestId}]: Could not find valid members array, using empty array`);
        members = [];
      }
      
      // Normalize member objects for consistency
      const normalizedMembers = members.map(member => {
        // Handle nested user data structure
        const userData = member.User || member;
        
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
      
      // Filter out invalid members (without ID)
      const validMembers = normalizedMembers.filter(m => m.id && m.id !== 'unknown');
      
      if (validMembers.length < normalizedMembers.length) {
        console.warn(`TeamMembers[${requestId}]: Filtered ${normalizedMembers.length - validMembers.length} invalid members`);
      }
      
      // Return normalized structure
      return {
        members: validMembers,
        team,
        // Preserve any other fields that might be useful
        totalCount: response.totalCount || validMembers.length,
        success: true,
        meta: {
          requestId,
          normalizedAt: new Date().toISOString(),
          originalMemberCount: members.length,
          validMemberCount: validMembers.length
        }
      };
    } catch (err) {
      console.error(`TeamMembers[${requestId}]: Error normalizing team members response:`, err);
      
      // Even on error, try our best to return something usable
      let fallbackMembers = [];
      
      // Last-ditch effort: if response is an object, try to find arrays
      if (response && typeof response === 'object') {
        Object.keys(response).forEach(key => {
          if (Array.isArray(response[key]) && response[key].length > 0 && 
              response[key][0] && (response[key][0].id || response[key][0].userId)) {
            console.log(`TeamMembers[${requestId}]: Found possible members in key "${key}"`);
            fallbackMembers = response[key];
          }
        });
      }
      
      return { 
        members: fallbackMembers, 
        team: null, 
        success: fallbackMembers.length > 0,
        meta: {
          requestId,
          normalizedAt: new Date().toISOString(),
          recovery: true,
          error: err.message
        }
      };
    }
  };
  
  // Add method for joining a team
  apiClient.joinTeam = async function(teamId, joinData) {
    try {
      // First, join the team with the specified role
      const joinResponse = await this.post(`/teams/${teamId}/members`, {
        role: joinData.role
      });
      
      // If player data was provided, save that as well
      if (joinResponse.success && joinData.playerData) {
        await this.post('/players', {
          ...joinData.playerData,
          teamId
        });
      }
      
      return joinResponse;
    } catch (error) {
      console.error('Error joining team:', error);
      throw error;
    }
  };
  
  return apiClient;
};

export default applyTeamExtensions;

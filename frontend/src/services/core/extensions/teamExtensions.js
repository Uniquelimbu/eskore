import { TIMEOUT_CONFIG } from '../config';
import { applyCircuitBreaker } from '../utils/circuitBreaker';

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
    
    const timeoutMs = options.timeout || TIMEOUT_CONFIG.TEAM_REQUEST;
    
    try {
      const teamClient = this.withTimeout(timeoutMs);
      // Copy interceptors from main instance
      teamClient.interceptors.request = this.interceptors.request;
      teamClient.interceptors.response = this.interceptors.response;
      
      return await teamClient.get(`/teams/${teamId}`);
    } catch (error) {
      console.warn(`Team request timed out after ${timeoutMs}ms:`, error);
      throw error;
    }
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
    
    const timeoutMs = options.timeout || TIMEOUT_CONFIG.TEAM_MEMBERS;
    
    try {
      console.log(`Fetching members for team ${normalizedTeamId}...`);
      const teamMembersClient = this.withTimeout(timeoutMs);
      // Copy interceptors from main instance
      teamMembersClient.interceptors.request = this.interceptors.request;
      teamMembersClient.interceptors.response = this.interceptors.response;
      
      // Add retry count for better resilience with circuit breaker pattern
      let attempts = 0;
      const maxAttempts = options.maxRetries || 2;
      let lastError = null;
      
      // Prepare endpoints - try alternative paths if main one fails
      const endpoints = [
        `/teams/${normalizedTeamId}/members`,           // Primary endpoint
        `/teams/${normalizedTeamId}/users`,             // Alternative endpoint
        `/api/teams/${normalizedTeamId}/members`,       // With /api prefix
        `/teams/${normalizedTeamId}/roster`             // Another possible endpoint
      ];
      
      // Use the circuit breaker pattern with enhanced error handling
      while (attempts <= maxAttempts) {
        try {
          // For first attempt use primary endpoint, for retries try alternatives
          const endpointIndex = Math.min(attempts, endpoints.length - 1);
          const endpoint = endpoints[endpointIndex];
          
          console.log(`getTeamMembers: Attempt ${attempts + 1}/${maxAttempts + 1} using endpoint: ${endpoint}`);
          
          // Make sure we never retry the exact same request to avoid duplicate 500 errors
          const requestConfig = {
            params: {
              _t: Date.now() + Math.random(),  // Cache busting with timestamp and random value
              retry: attempts
            }
          };
          
          const response = await applyCircuitBreaker(() => 
            teamMembersClient.get(endpoint, requestConfig)
          );
          
          // For additional robustness, verify the response format
          if (!response) {
            throw new Error('Empty response received');
          }
          
          // Normalize response format (could be directly in response or in response.data.members)
          const normalizedResponse = normalizeTeamMembersResponse(response);
          
          console.log(`getTeamMembers: Successfully fetched ${
            normalizedResponse?.members?.length || 0} members for team ${normalizedTeamId}`);
          
          return normalizedResponse;
        } catch (retryError) {
          attempts++;
          lastError = retryError;
          
          // Handle specific server error cases
          if (retryError.status === 500) {
            console.warn(`getTeamMembers: Server error (500) on attempt ${attempts}, will ${
              attempts > maxAttempts ? 'not retry' : 'retry'}`);
            
            // Fix: Capture the current attempts value in a closure
            const currentAttempt = attempts;
            
            // If it's an Internal Server Error, wait longer between retries
            await new Promise(resolve => setTimeout(resolve, Math.min(2000 * currentAttempt, 6000)));
          } else {
            // Fix: Capture the current attempts value in a closure
            const currentAttempt = attempts;
            
            // For other errors, use standard backoff
            await new Promise(resolve => setTimeout(resolve, 1000 * currentAttempt));
          }
          
          // If we've exhausted retries, break the loop
          if (attempts > maxAttempts) {
            break;
          }
        }
      }
      
      // If we get here, all attempts failed
      throw lastError || new Error('All attempts to fetch team members failed');
    } catch (error) {
      console.error(`Failed to fetch members for team ${teamId}:`, error);
      
      // Try to extract useful information from the error
      const errorStatus = error.status || error.response?.status || 500;
      
      // Provide more specific error messages based on status code
      let errorMessage;
      switch (errorStatus) {
        case 400:
          errorMessage = 'Invalid request when loading team members';
          break;
        case 401:
          errorMessage = 'Authentication required to view team members';
          break;
        case 403:
          errorMessage = 'You don\'t have permission to view this team\'s members';
          break;
        case 404:
          errorMessage = 'Team not found or has no members';
          break;
        case 500:
          errorMessage = 'Server encountered an error while loading team members. Please try again later.';
          break;
        default:
          errorMessage = 'Failed to load team members. Please try again later.';
      }
      
      // Enhanced error response with more details for debugging
      const errorResponse = {
        status: errorStatus,
        message: errorMessage,
        originalError: error,
        errorType: error.code || error.name || 'UnknownError',
        timestamp: new Date().toISOString(),
        teamId: teamId
      };
      
      // Make sure the Squad component can handle this gracefully
      throw errorResponse;
    }
  };
  
  // Normalize team members response to a consistent format
  const normalizeTeamMembersResponse = (response) => {
    // Default structure to return if we can't extract data
    const defaultStructure = { members: [], team: null };
    
    if (!response) return defaultStructure;
    
    try {
      // Try to extract members data from various possible locations in the response
      let members = null;
      let team = null;
      
      // Check response.members - direct array of members
      if (Array.isArray(response.members)) {
        members = response.members;
      }
      // Check response.data.members - nested array of members
      else if (response.data && Array.isArray(response.data.members)) {
        members = response.data.members;
      }
      // Check response.Users - alternative field name
      else if (Array.isArray(response.Users)) {
        members = response.Users;
      }
      // Check response.data.Users - alternative nested field name
      else if (response.data && Array.isArray(response.data.Users)) {
        members = response.data.Users;
      }
      // Check response itself is an array of members
      else if (Array.isArray(response)) {
        members = response;
      }
      
      // Extract team data if available
      if (response.team) {
        team = response.team;
      } else if (response.data && response.data.team) {
        team = response.data.team;
      }
      
      // Ensure members is always an array
      if (!members || !Array.isArray(members)) {
        members = [];
      }
      
      // Return normalized structure
      return {
        members,
        team,
        // Preserve any other fields that might be useful
        totalCount: response.totalCount || members.length,
        success: true
      };
    } catch (err) {
      console.error('Error normalizing team members response:', err);
      return defaultStructure;
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

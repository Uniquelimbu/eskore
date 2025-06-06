/**
 * Utility functions for processing team member data
 */

/**
 * Extract members array from various API response formats
 * Handles different response structures gracefully
 * 
 * @param {Object} response - API response object
 * @returns {Array} - Extracted members array
 */
export const extractMembersFromResponse = (response) => {
  // Try different possible response structures
  if (response?.members && Array.isArray(response.members)) {
    return response.members;
  }
  
  if (response?.data?.members && Array.isArray(response.data.members)) {
    return response.data.members;
  }
  
  if (Array.isArray(response)) {
    return response;
  }
  
  // If no valid path is found
  console.warn('Squad: Could not find members array in response. Response structure:', 
    Object.keys(response).join(', '));
  return [];
};

/**
 * Check if a specific user is a member of the team
 * 
 * @param {Array} members - List of team members
 * @param {string} userId - User ID to check
 * @returns {boolean} - Whether user is a member
 */
export const checkIfUserIsMember = (members, userId) => {
  if (!members || !userId) return false;
  
  // Check both possible ID fields
  return members.some(member => 
    member.userId === userId || 
    member.id === userId ||
    member.User?.id === userId
  );
};

/**
 * Process and categorize members by role
 * 
 * @param {Array} members - List of team members
 * @param {Object} currentUser - Current user object
 * @param {boolean} isUserManager - Whether current user is a manager
 * @returns {Object} - Categorized members {managerMembers, athleteMembers, coachMembers}
 */
export const processMembersByRole = (members, currentUser, isUserManager) => {
  const managerMembers = [];
  const athleteMembers = [];
  const coachMembers = [];
  
  members.forEach(member => {
    const role = member.role || 'athlete';
    
    switch (role) {
      case 'manager':
      case 'assistant_manager':
        managerMembers.push(member);
        break;
      case 'coach':
        coachMembers.push(member);
        break;
      default:
        athleteMembers.push(member);
        break;
    }
  });
  
  return {
    managerMembers,
    athleteMembers,
    coachMembers
  };
};

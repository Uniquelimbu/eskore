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
  if (!response) return [];
  
  // Try different paths where members might be located in the response
  const possiblePaths = [
    response.members,
    response.Users,
    response.data?.members,
    response.data?.Users,
    response.team?.members,
    response.team?.Users
  ];
  
  // Find the first path that contains an array of members
  for (const path of possiblePaths) {
    if (Array.isArray(path) && path.length > 0) {
      console.log(`Squad: Found ${path.length} members in response`);
      return path;
    }
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
  if (!Array.isArray(members)) {
    console.error('Squad: Members is not an array:', members);
    return { managerMembers: [], athleteMembers: [], coachMembers: [] };
  }
  
  // Helper function to normalize member data
  const normalizeMember = (member) => {
    // Get user data which could be directly on member or nested
    const userData = member.User || member;
    return {
      id: member.id || member.userId || userData.id,
      userId: member.userId || member.id || userData.id,
      firstName: userData.firstName || member.firstName || '',
      lastName: userData.lastName || member.lastName || '',
      email: userData.email || member.email || '',
      role: member.role || userData.role || 'athlete',
      Player: member.Player || userData.Player || null,
      profileImageUrl: userData.profileImageUrl || member.profileImageUrl || null
    };
  };
  
  // Normalize and categorize all members
  const normalizedMembers = members.map(normalizeMember);
  
  // Group members by role
  const managerMembers = normalizedMembers.filter(m => 
    m.role === 'manager' || m.role === 'assistant_manager');
  const athleteMembers = normalizedMembers.filter(m => 
    m.role === 'athlete');
  const coachMembers = normalizedMembers.filter(m => 
    m.role === 'coach');
  
  // Add current user as manager if marked as manager but not in the list
  if (isUserManager && currentUser && 
      !managerMembers.some(m => m.id === currentUser.id || m.userId === currentUser.id)) {
    console.log('Squad: Adding current user as manager (not found in API response)');
    managerMembers.push({
      id: currentUser.id,
      userId: currentUser.id,
      firstName: currentUser.firstName || 'Team',
      lastName: currentUser.lastName || 'Manager',
      email: currentUser.email,
      role: 'manager'
    });
  }
  
  return { managerMembers, athleteMembers, coachMembers };
};

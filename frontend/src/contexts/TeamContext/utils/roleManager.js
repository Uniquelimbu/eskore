import { TEAM_ROLES, ROLE_HIERARCHY, ROLE_PERMISSIONS } from '../constants/teamConstants';

/**
 * Determine user role in a team with multiple fallback methods
 */
export const determineUserRole = (user, teamData, members = []) => {
  if (!user?.id || !teamData) return null;

  console.log(`RoleManager: Determining role for user ${user.id} in team ${teamData.id}`);

  // 1. Check if user is the team creator/owner (highest priority)
  if (teamData.createdBy === user.id || teamData.ownerId === user.id || teamData.creatorId === user.id) {
    console.log('RoleManager: User is team creator/owner, setting role to manager');
    return TEAM_ROLES.MANAGER;
  }

  // 2. Check user's role in team members (most reliable)
  if (Array.isArray(members) && members.length > 0) {
    const memberData = members.find(member => 
      member.userId === user.id || 
      member.user?.id === user.id || 
      member.id === user.id
    );
    
    if (memberData?.role) {
      const normalizedRole = normalizeRole(memberData.role);
      console.log(`RoleManager: Found user in team members with role: ${memberData.role} -> ${normalizedRole}`);
      return normalizedRole;
    }
  }

  // 3. Check teamData for user role (fallback)
  if (teamData.userRole) {
    const normalizedRole = normalizeRole(teamData.userRole);
    console.log(`RoleManager: Found role in teamData: ${teamData.userRole} -> ${normalizedRole}`);
    return normalizedRole;
  }

  // 4. Check if user has a role property directly
  if (teamData.role) {
    const normalizedRole = normalizeRole(teamData.role);
    console.log(`RoleManager: Found direct role in teamData: ${teamData.role} -> ${normalizedRole}`);
    return normalizedRole;
  }

  // 5. Final fallback - return null (no role)
  console.log('RoleManager: No role found for user');
  return null;
};

/**
 * Check if user has manager-level permissions
 */
export const isManagerRole = (role, user = null, teamData = null) => {
  // Check explicit manager roles
  if (role === TEAM_ROLES.MANAGER || role === TEAM_ROLES.ASSISTANT_MANAGER) {
    return true;
  }

  // Check if user is team owner/creator (additional safety check)
  if (user && teamData) {
    if (teamData.createdBy === user.id || 
        teamData.ownerId === user.id || 
        teamData.creatorId === user.id) {
      return true;
    }
  }

  return false;
};

/**
 * Check if user has player-level permissions
 */
export const isPlayerRole = (role) => {
  return role === TEAM_ROLES.PLAYER || role === TEAM_ROLES.ATHLETE;
};

/**
 * Check if user has specific role in team - MISSING FUNCTION
 */
export const hasRoleInTeam = (userRole, requiredRole) => {
  if (!userRole || !requiredRole) return false;
  
  // Normalize both roles for comparison
  const normalizedUserRole = normalizeRole(userRole);
  const normalizedRequiredRole = normalizeRole(requiredRole);
  
  return normalizedUserRole === normalizedRequiredRole;
};

/**
 * Check if user has any of the specified roles in team - MISSING FUNCTION
 */
export const hasAnyRoleInTeam = (userRole, requiredRoles = []) => {
  if (!userRole || !Array.isArray(requiredRoles) || requiredRoles.length === 0) return false;
  
  return requiredRoles.some(role => hasRoleInTeam(userRole, role));
};

/**
 * Check if user has role hierarchy level or higher
 */
export const hasRoleOrHigher = (userRole, requiredRole) => {
  if (!userRole || !requiredRole) return false;
  
  const userLevel = getRoleLevel(userRole);
  const requiredLevel = getRoleLevel(requiredRole);
  
  return userLevel >= requiredLevel;
};

/**
 * Normalize role strings to standard values
 */
export const normalizeRole = (role) => {
  if (!role) return null;
  
  const roleString = String(role).toLowerCase().trim();
  
  // Enhanced role mapping with aliases
  const roleMap = {
    'manager': TEAM_ROLES.MANAGER,
    'team_manager': TEAM_ROLES.MANAGER,
    'assistant_manager': TEAM_ROLES.ASSISTANT_MANAGER,
    'assistantmanager': TEAM_ROLES.ASSISTANT_MANAGER,
    'assistant-manager': TEAM_ROLES.ASSISTANT_MANAGER,
    'coach': TEAM_ROLES.COACH,
    'head_coach': TEAM_ROLES.COACH,
    'assistant_coach': TEAM_ROLES.ASSISTANT_COACH,
    'assistantcoach': TEAM_ROLES.ASSISTANT_COACH,
    'assistant-coach': TEAM_ROLES.ASSISTANT_COACH,
    'player': TEAM_ROLES.PLAYER,
    'athlete': TEAM_ROLES.ATHLETE,
    'member': TEAM_ROLES.MEMBER,
    'admin': TEAM_ROLES.ADMIN,
    'owner': TEAM_ROLES.MANAGER, // Map owner to manager
    'captain': TEAM_ROLES.PLAYER // Map captain to player
  };
  
  return roleMap[roleString] || role;
};

/**
 * Check if user has specific permission
 */
export const hasPermission = (userRole, permission) => {
  if (!userRole || !permission) return false;
  
  const rolePermissions = ROLE_PERMISSIONS[userRole] || [];
  return rolePermissions.includes(permission);
};

/**
 * Check if user has any of the specified permissions
 */
export const hasAnyPermission = (userRole, permissions = []) => {
  if (!userRole || !Array.isArray(permissions)) return false;
  
  return permissions.some(permission => hasPermission(userRole, permission));
};

/**
 * Check if user has all specified permissions
 */
export const hasAllPermissions = (userRole, permissions = []) => {
  if (!userRole || !Array.isArray(permissions)) return false;
  
  return permissions.every(permission => hasPermission(userRole, permission));
};

/**
 * Get role hierarchy level
 */
export const getRoleLevel = (role) => {
  const normalizedRole = normalizeRole(role);
  return ROLE_HIERARCHY[normalizedRole] || 0;
};

/**
 * Check if role1 has higher authority than role2
 */
export const hasHigherAuthority = (role1, role2) => {
  return getRoleLevel(role1) > getRoleLevel(role2);
};

/**
 * Get all permissions for a role
 */
export const getRolePermissions = (role) => {
  const normalizedRole = normalizeRole(role);
  return ROLE_PERMISSIONS[normalizedRole] || [];
};

/**
 * Check if user can manage another user based on roles
 */
export const canManageUser = (managerRole, targetRole) => {
  const managerLevel = getRoleLevel(managerRole);
  const targetLevel = getRoleLevel(targetRole);
  
  // Manager must have higher authority level
  return managerLevel > targetLevel;
};

/**
 * Format role for display
 */
export const formatRoleForDisplay = (role) => {
  if (!role) return 'Member';
  
  const normalizedRole = normalizeRole(role);
  
  const displayMap = {
    [TEAM_ROLES.MANAGER]: 'Manager',
    [TEAM_ROLES.ASSISTANT_MANAGER]: 'Assistant Manager',
    [TEAM_ROLES.COACH]: 'Coach',
    [TEAM_ROLES.ASSISTANT_COACH]: 'Assistant Coach',
    [TEAM_ROLES.PLAYER]: 'Player',
    [TEAM_ROLES.ATHLETE]: 'Athlete',
    [TEAM_ROLES.MEMBER]: 'Member',
    [TEAM_ROLES.ADMIN]: 'Admin'
  };
  
  return displayMap[normalizedRole] || 
         String(role).charAt(0).toUpperCase() + 
         String(role).slice(1).replace(/_/g, ' ');
};

/**
 * Get user's effective permissions in team
 */
export const getUserTeamPermissions = (user, teamData, members) => {
  const userRole = determineUserRole(user, teamData, members);
  if (!userRole) return [];
  
  const rolePermissions = getRolePermissions(userRole);
  
  // Add owner permissions if user is team owner
  if (teamData && user && (
    teamData.createdBy === user.id || 
    teamData.ownerId === user.id || 
    teamData.creatorId === user.id
  )) {
    // Owners get all permissions
    const allPermissions = Object.values(ROLE_PERMISSIONS).flat();
    return [...new Set([...rolePermissions, ...allPermissions])];
  }
  
  return rolePermissions;
};

/**
 * Advanced role checking with context
 */
export const checkRoleInContext = (user, teamData, members, requiredRole, context = {}) => {
  const userRole = determineUserRole(user, teamData, members);
  
  if (!userRole) return false;
  
  // Basic role check
  if (hasRoleInTeam(userRole, requiredRole)) return true;
  
  // Hierarchy check if enabled
  if (context.allowHigherRoles && hasRoleOrHigher(userRole, requiredRole)) return true;
  
  // Owner override
  if (context.allowOwnerOverride && isManagerRole(userRole, user, teamData)) return true;
  
  return false;
};

/**
 * Validate role assignment
 */
export const validateRoleAssignment = (assignerRole, targetRole, context = {}) => {
  const assignerLevel = getRoleLevel(assignerRole);
  const targetLevel = getRoleLevel(targetRole);
  
  // Can't assign role equal or higher than your own (unless owner)
  if (!context.isOwner && assignerLevel <= targetLevel) {
    return {
      valid: false,
      reason: 'Cannot assign role equal or higher than your own'
    };
  }
  
  // Specific role restrictions
  if (targetRole === TEAM_ROLES.MANAGER && !context.isOwner) {
    return {
      valid: false,
      reason: 'Only team owners can assign manager role'
    };
  }
  
  return {
    valid: true
  };
};

/**
 * Get roles that a user can assign to others
 */
export const getAssignableRoles = (userRole, isOwner = false) => {
  const userLevel = getRoleLevel(userRole);
  
  if (isOwner) {
    // Owners can assign any role except admin
    return Object.keys(TEAM_ROLES).filter(role => role !== 'ADMIN');
  }
  
  // Can assign roles with lower hierarchy level
  return Object.entries(ROLE_HIERARCHY)
    .filter(([, level]) => level < userLevel)
    .map(([role]) => role);
};
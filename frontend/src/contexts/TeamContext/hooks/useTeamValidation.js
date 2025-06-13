import { useTeam } from './useTeam';
import { useAuth } from '../../AuthContext';
import { hasPermission, hasAnyPermission } from '../utils/roleManager';

/**
 * Hook for team role and permission validation
 */
export const useTeamValidation = () => {
  const { 
    currentTeam, 
    userRole, 
    isManager, 
    isPlayer,
    hasRoleInCurrentTeam,
    hasAnyRoleInCurrentTeam,
    isUserMemberOfCurrentTeam
  } = useTeam();
  const { user } = useAuth();

  // Basic role checks
  const isTeamMember = isUserMemberOfCurrentTeam(user?.id);
  const isTeamManager = isManager;
  const isTeamPlayer = isPlayer;
  const isTeamOwner = currentTeam?.createdBy === user?.id || currentTeam?.ownerId === user?.id;

  // Permission checks based on role
  const canEditTeam = hasPermission(userRole, 'CAN_EDIT_TEAM') || isTeamOwner;
  const canManageMembers = hasPermission(userRole, 'CAN_MANAGE_MEMBERS') || isTeamOwner;
  const canEditFormation = hasPermission(userRole, 'CAN_EDIT_FORMATION') || isTeamOwner;
  const canViewFormation = hasPermission(userRole, 'CAN_VIEW_FORMATION') || isTeamMember;
  const canManageSchedule = hasPermission(userRole, 'CAN_MANAGE_SCHEDULE') || isTeamOwner;
  const canViewAnalytics = hasPermission(userRole, 'CAN_VIEW_ANALYTICS') || isTeamMember;
  const canDeleteTeam = hasPermission(userRole, 'CAN_DELETE_TEAM') || isTeamOwner;

  // Composite permission checks
  const canManageTeam = canEditTeam || canManageMembers;
  const hasManagerPermissions = isTeamManager || isTeamOwner;
  const hasCoachPermissions = hasAnyRoleInCurrentTeam(['coach', 'assistant_coach']) || hasManagerPermissions;
  const hasPlayerPermissions = isTeamPlayer || hasCoachPermissions;

  // Role hierarchy checks
  const canPromoteToRole = (targetRole) => {
    if (!isTeamMember || !hasManagerPermissions) return false;

    const roleHierarchy = {
      'member': 1,
      'player': 2,
      'athlete': 2,
      'assistant_coach': 3,
      'coach': 4,
      'assistant_manager': 5,
      'manager': 6
    };

    const currentLevel = roleHierarchy[userRole] || 0;
    const targetLevel = roleHierarchy[targetRole] || 0;

    // Can only promote to roles below your level
    return currentLevel > targetLevel;
  };

  const canDemoteFromRole = (targetRole) => {
    if (!isTeamMember || !hasManagerPermissions) return false;

    // Owners can demote anyone, managers can demote below their level
    if (isTeamOwner) return targetRole !== 'manager' || userRole === 'manager';
    
    return canPromoteToRole(targetRole);
  };

  // Action permissions
  const canInviteMembers = canManageMembers;
  const canRemoveMembers = canManageMembers;
  const canEditMemberRoles = canManageMembers;
  const canCreateSubTeams = hasManagerPermissions;
  const canArchiveTeam = isTeamOwner;

  // Content permissions
  const canCreatePosts = isTeamMember;
  const canEditPosts = hasManagerPermissions;
  const canDeletePosts = hasManagerPermissions;
  const canModerateComments = hasManagerPermissions;

  // Advanced permission checks
  const canPerformAction = (action, context = {}) => {
    switch (action) {
      case 'edit_team_settings':
        return canEditTeam;
      case 'manage_team_members':
        return canManageMembers;
      case 'edit_formation':
        return canEditFormation;
      case 'view_formation':
        return canViewFormation;
      case 'manage_schedule':
        return canManageSchedule;
      case 'view_analytics':
        return canViewAnalytics;
      case 'delete_team':
        return canDeleteTeam;
      case 'invite_members':
        return canInviteMembers;
      case 'remove_member':
        // Check if trying to remove someone with higher or equal role
        if (context.targetMember) {
          return canRemoveMembers && canDemoteFromRole(context.targetMember.role);
        }
        return canRemoveMembers;
      case 'change_member_role':
        if (context.targetRole && context.currentRole) {
          return canEditMemberRoles && 
                 canDemoteFromRole(context.currentRole) && 
                 canPromoteToRole(context.targetRole);
        }
        return canEditMemberRoles;
      default:
        return false;
    }
  };

  // Team status checks
  const isActiveTeamMember = isTeamMember && currentTeam?.status !== 'archived';
  const canAccessTeamSpace = isTeamMember || currentTeam?.visibility === 'public';
  const canJoinTeam = !isTeamMember && currentTeam?.joinPolicy !== 'closed';

  // Validation helpers
  const validateTeamAccess = (requiredPermission) => {
    if (!isTeamMember) {
      return {
        hasAccess: false,
        reason: 'Not a team member'
      };
    }

    if (!canPerformAction(requiredPermission)) {
      return {
        hasAccess: false,
        reason: 'Insufficient permissions'
      };
    }

    return {
      hasAccess: true
    };
  };

  const getAccessLevel = () => {
    if (isTeamOwner) return 'owner';
    if (isTeamManager) return 'manager';
    if (hasCoachPermissions) return 'coach';
    if (isTeamPlayer) return 'player';
    if (isTeamMember) return 'member';
    return 'none';
  };

  return {
    // Basic role checks
    isTeamMember,
    isTeamManager,
    isTeamPlayer,
    isTeamOwner,
    userRole,
    accessLevel: getAccessLevel(),

    // Permission checks
    canEditTeam,
    canManageMembers,
    canEditFormation,
    canViewFormation,
    canManageSchedule,
    canViewAnalytics,
    canDeleteTeam,
    canInviteMembers,
    canRemoveMembers,
    canEditMemberRoles,

    // Composite permissions
    canManageTeam,
    hasManagerPermissions,
    hasCoachPermissions,
    hasPlayerPermissions,

    // Role management
    canPromoteToRole,
    canDemoteFromRole,

    // Action permissions
    canPerformAction,
    canCreateSubTeams,
    canArchiveTeam,

    // Content permissions
    canCreatePosts,
    canEditPosts,
    canDeletePosts,
    canModerateComments,

    // Status checks
    isActiveTeamMember,
    canAccessTeamSpace,
    canJoinTeam,

    // Validation helpers
    validateTeamAccess,

    // Raw role checking functions
    hasRoleInCurrentTeam,
    hasAnyRoleInCurrentTeam
  };
};

/**
 * Hook for quick permission checks
 */
export const useTeamPermissions = () => {
  const {
    canEditTeam,
    canManageMembers,
    canEditFormation,
    canViewFormation,
    canManageSchedule,
    canViewAnalytics
  } = useTeamValidation();

  return {
    canEditTeam,
    canManageMembers,
    canEditFormation,
    canViewFormation,
    canManageSchedule,
    canViewAnalytics
  };
};
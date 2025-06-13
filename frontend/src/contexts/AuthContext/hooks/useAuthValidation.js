import { useAuth } from './useAuth';
import { 
  checkUserRole, 
  checkUserAnyRole, 
  checkUserRoleHierarchy,
  checkUserPermission,
  isAccountInGoodStanding
} from '../utils/authValidation';

/**
 * Enhanced hook for role validation and permissions
 */
export const useAuthValidation = () => {
  const { user } = useAuth();
  
  const hasRole = (role) => checkUserRole(user, role);
  const hasAnyRole = (roles) => checkUserAnyRole(user, roles);
  const hasRoleOrHigher = (role) => checkUserRoleHierarchy(user, role);
  const hasPermission = (permission, context = {}) => checkUserPermission(user, permission, context);
  const isAccountValid = () => isAccountInGoodStanding(user);
  
  // Common role checks
  const isManager = hasRole('manager');
  const isAdmin = hasRole('admin');
  const isPlayer = hasRole('player') || hasRole('athlete');
  const isAssistantManager = hasRole('assistant_manager');
  
  // Permission-based checks
  const canCreateTeams = hasPermission('team.create');
  const canEditTeams = hasPermission('team.edit');
  const canManageMembers = hasPermission('member.add');
  const canEditFormations = hasPermission('formation.edit');
  const canViewStats = hasPermission('stats.view');
  
  // Composite checks
  const isTeamManager = isManager || isAssistantManager;
  const canManageTeam = isManager || isAdmin;
  const isAuthorizedUser = isAccountValid() && user;
  
  return {
    // Basic role checks
    hasRole,
    hasAnyRole,
    hasRoleOrHigher,
    hasPermission,
    isAccountValid,
    
    // Common roles
    isManager,
    isAdmin,
    isPlayer,
    isAssistantManager,
    isTeamManager,
    
    // Permission checks
    canCreateTeams,
    canEditTeams,
    canManageMembers,
    canEditFormations,
    canViewStats,
    canManageTeam,
    
    // Status checks
    isAuthorizedUser,
    isProfileComplete: user && user.firstName && user.lastName
  };
};
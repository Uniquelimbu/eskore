// Action Types - Consistent naming
export const TEAM_ACTIONS = {
  // Loading states
  SET_LOADING: 'TEAM_SET_LOADING',
  SET_ERROR: 'TEAM_SET_ERROR',
  CLEAR_ERROR: 'TEAM_CLEAR_ERROR',
  
  // Team data
  SET_CURRENT_TEAM: 'TEAM_SET_CURRENT_TEAM',
  SET_USER_TEAMS: 'TEAM_SET_USER_TEAMS',
  SET_TEAM_MEMBERS: 'TEAM_SET_TEAM_MEMBERS',
  
  // User role & permissions
  SET_USER_ROLE: 'TEAM_SET_USER_ROLE',
  SET_MANAGER_STATUS: 'TEAM_SET_MANAGER_STATUS',
  SET_PLAYER_STATUS: 'TEAM_SET_PLAYER_STATUS',
  
  // Cache management
  UPDATE_TEAM_CACHE: 'TEAM_UPDATE_CACHE',
  UPDATE_MEMBER_CACHE: 'TEAM_UPDATE_MEMBER_CACHE',
  INVALIDATE_CACHE: 'TEAM_INVALIDATE_CACHE',
  
  // Reset
  RESET_TEAM_STATE: 'TEAM_RESET_STATE'
};

// Cache Configuration with enhanced settings
export const CACHE_CONFIG = {
  TEAM_CACHE_DURATION: 5 * 60 * 1000,        // 5 minutes
  MEMBER_CACHE_DURATION: 3 * 60 * 1000,      // 3 minutes
  USER_TEAMS_CACHE_DURATION: 10 * 60 * 1000, // 10 minutes
  MAX_CACHE_SIZE: 50,                         // Maximum cached items
  CLEANUP_THRESHOLD: 0.8,                     // Cleanup when 80% full
  PRELOAD_BATCH_SIZE: 5,                      // Max teams to preload at once
  RETRY_CACHE_AFTER: 30 * 1000                // Retry failed cache after 30s
};

// Team Roles with enhanced hierarchy
export const TEAM_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  ASSISTANT_MANAGER: 'assistant_manager',
  COACH: 'coach',
  ASSISTANT_COACH: 'assistant_coach',
  PLAYER: 'player',
  ATHLETE: 'athlete',
  MEMBER: 'member'
};

// Role Hierarchy with more granular levels
export const ROLE_HIERARCHY = {
  [TEAM_ROLES.ADMIN]: 100,
  [TEAM_ROLES.MANAGER]: 90,
  [TEAM_ROLES.ASSISTANT_MANAGER]: 80,
  [TEAM_ROLES.COACH]: 70,
  [TEAM_ROLES.ASSISTANT_COACH]: 60,
  [TEAM_ROLES.PLAYER]: 50,
  [TEAM_ROLES.ATHLETE]: 50,
  [TEAM_ROLES.MEMBER]: 40
};

// Enhanced Permissions
export const PERMISSIONS = {
  // Team management
  CAN_EDIT_TEAM: 'canEditTeam',
  CAN_DELETE_TEAM: 'canDeleteTeam',
  CAN_ARCHIVE_TEAM: 'canArchiveTeam',
  
  // Member management
  CAN_MANAGE_MEMBERS: 'canManageMembers',
  CAN_INVITE_MEMBERS: 'canInviteMembers',
  CAN_REMOVE_MEMBERS: 'canRemoveMembers',
  CAN_EDIT_MEMBER_ROLES: 'canEditMemberRoles',
  
  // Formation management
  CAN_EDIT_FORMATION: 'canEditFormation',
  CAN_VIEW_FORMATION: 'canViewFormation',
  CAN_EXPORT_FORMATION: 'canExportFormation',
  
  // Schedule management
  CAN_MANAGE_SCHEDULE: 'canManageSchedule',
  CAN_VIEW_SCHEDULE: 'canViewSchedule',
  
  // Analytics and stats
  CAN_VIEW_ANALYTICS: 'canViewAnalytics',
  CAN_EXPORT_ANALYTICS: 'canExportAnalytics',
  
  // Content management
  CAN_CREATE_POSTS: 'canCreatePosts',
  CAN_EDIT_POSTS: 'canEditPosts',
  CAN_DELETE_POSTS: 'canDeletePosts',
  CAN_MODERATE_COMMENTS: 'canModerateComments'
};

// Enhanced Role Permissions mapping
export const ROLE_PERMISSIONS = {
  [TEAM_ROLES.ADMIN]: Object.values(PERMISSIONS),
  [TEAM_ROLES.MANAGER]: [
    PERMISSIONS.CAN_EDIT_TEAM,
    PERMISSIONS.CAN_ARCHIVE_TEAM,
    PERMISSIONS.CAN_MANAGE_MEMBERS,
    PERMISSIONS.CAN_INVITE_MEMBERS,
    PERMISSIONS.CAN_REMOVE_MEMBERS,
    PERMISSIONS.CAN_EDIT_MEMBER_ROLES,
    PERMISSIONS.CAN_EDIT_FORMATION,
    PERMISSIONS.CAN_VIEW_FORMATION,
    PERMISSIONS.CAN_EXPORT_FORMATION,
    PERMISSIONS.CAN_MANAGE_SCHEDULE,
    PERMISSIONS.CAN_VIEW_SCHEDULE,
    PERMISSIONS.CAN_VIEW_ANALYTICS,
    PERMISSIONS.CAN_EXPORT_ANALYTICS,
    PERMISSIONS.CAN_CREATE_POSTS,
    PERMISSIONS.CAN_EDIT_POSTS,
    PERMISSIONS.CAN_DELETE_POSTS,
    PERMISSIONS.CAN_MODERATE_COMMENTS
  ],
  [TEAM_ROLES.ASSISTANT_MANAGER]: [
    PERMISSIONS.CAN_MANAGE_MEMBERS,
    PERMISSIONS.CAN_INVITE_MEMBERS,
    PERMISSIONS.CAN_EDIT_FORMATION,
    PERMISSIONS.CAN_VIEW_FORMATION,
    PERMISSIONS.CAN_EXPORT_FORMATION,
    PERMISSIONS.CAN_MANAGE_SCHEDULE,
    PERMISSIONS.CAN_VIEW_SCHEDULE,
    PERMISSIONS.CAN_VIEW_ANALYTICS,
    PERMISSIONS.CAN_CREATE_POSTS,
    PERMISSIONS.CAN_EDIT_POSTS,
    PERMISSIONS.CAN_MODERATE_COMMENTS
  ],
  [TEAM_ROLES.COACH]: [
    PERMISSIONS.CAN_EDIT_FORMATION,
    PERMISSIONS.CAN_VIEW_FORMATION,
    PERMISSIONS.CAN_EXPORT_FORMATION,
    PERMISSIONS.CAN_VIEW_SCHEDULE,
    PERMISSIONS.CAN_VIEW_ANALYTICS,
    PERMISSIONS.CAN_CREATE_POSTS
  ],
  [TEAM_ROLES.ASSISTANT_COACH]: [
    PERMISSIONS.CAN_VIEW_FORMATION,
    PERMISSIONS.CAN_VIEW_SCHEDULE,
    PERMISSIONS.CAN_VIEW_ANALYTICS,
    PERMISSIONS.CAN_CREATE_POSTS
  ],
  [TEAM_ROLES.PLAYER]: [
    PERMISSIONS.CAN_VIEW_FORMATION,
    PERMISSIONS.CAN_VIEW_SCHEDULE,
    PERMISSIONS.CAN_CREATE_POSTS
  ],
  [TEAM_ROLES.ATHLETE]: [
    PERMISSIONS.CAN_VIEW_FORMATION,
    PERMISSIONS.CAN_VIEW_SCHEDULE,
    PERMISSIONS.CAN_CREATE_POSTS
  ],
  [TEAM_ROLES.MEMBER]: [
    PERMISSIONS.CAN_VIEW_FORMATION,
    PERMISSIONS.CAN_VIEW_SCHEDULE,
    PERMISSIONS.CAN_CREATE_POSTS
  ]
};

// Initial State with better structure
export const initialTeamState = {
  // Core data
  currentTeam: null,
  userTeams: [],
  teamMembers: [],
  
  // UI states
  loading: false,
  error: null,
  
  // User permissions
  userRole: null,
  isManager: false,
  isPlayer: false,
  
  // Cache with proper Map initialization
  teamCache: new Map(),
  memberCache: new Map(),
  lastFetchTime: new Map()
};

// Enhanced Team Validation Rules
export const TEAM_VALIDATION = {
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
  ABBREVIATION_MIN_LENGTH: 2,
  ABBREVIATION_MAX_LENGTH: 4,
  DESCRIPTION_MAX_LENGTH: 500,
  CITY_MAX_LENGTH: 50,
  NICKNAME_MAX_LENGTH: 30,
  FOUNDED_YEAR_MIN: 1800,
  FOUNDED_YEAR_MAX: new Date().getFullYear(),
  
  // Member validation
  MEMBER_MESSAGE_MAX_LENGTH: 500,
  JERSEY_NUMBER_MIN: 1,
  JERSEY_NUMBER_MAX: 999,
  POSITION_MAX_LENGTH: 50
};

// API Endpoints with consistent structure
export const TEAM_ENDPOINTS = {
  // Team CRUD
  GET_USER_TEAMS: (userId) => `/teams/user/${userId}`,
  GET_TEAM: (teamId) => `/teams/${teamId}`,
  CREATE_TEAM: '/teams',
  UPDATE_TEAM: (teamId) => `/teams/${teamId}`,
  DELETE_TEAM: (teamId) => `/teams/${teamId}`,
  
  // Team members
  GET_TEAM_MEMBERS: (teamId) => `/teams/${teamId}/members`,
  ADD_TEAM_MEMBER: (teamId) => `/teams/${teamId}/members`,
  UPDATE_TEAM_MEMBER: (teamId, memberId) => `/teams/${teamId}/members/${memberId}`,
  REMOVE_TEAM_MEMBER: (teamId, memberId) => `/teams/${teamId}/members/${memberId}`,
  
  // Team joining
  JOIN_TEAM: (teamId) => `/teams/${teamId}/join`,
  LEAVE_TEAM: (teamId) => `/teams/${teamId}/leave`,
  GET_JOIN_REQUESTS: (teamId) => `/teams/${teamId}/join-requests`,
  APPROVE_JOIN_REQUEST: (teamId, requestId) => `/teams/${teamId}/join-requests/${requestId}/approve`,
  REJECT_JOIN_REQUEST: (teamId, requestId) => `/teams/${teamId}/join-requests/${requestId}/reject`,
  
  // Team search and discovery
  SEARCH_TEAMS: '/teams/search',
  GET_PUBLIC_TEAMS: '/teams/public',
  
  // Team statistics
  GET_TEAM_STATS: (teamId) => `/teams/${teamId}/stats`,
  GET_TEAM_ACTIVITY: (teamId) => `/teams/${teamId}/activity`
};

// Team Status Constants
export const TEAM_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  ARCHIVED: 'archived',
  SUSPENDED: 'suspended'
};

// Team Visibility Constants
export const TEAM_VISIBILITY = {
  PUBLIC: 'public',
  PRIVATE: 'private',
  INVITE_ONLY: 'invite_only'
};

// Join Policy Constants
export const JOIN_POLICY = {
  OPEN: 'open',
  REQUEST: 'request',
  INVITE_ONLY: 'invite_only',
  CLOSED: 'closed'
};

// Error Types for better error handling
export const TEAM_ERROR_TYPES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  PERMISSION_ERROR: 'PERMISSION_ERROR',
  NOT_FOUND_ERROR: 'NOT_FOUND_ERROR',
  CONFLICT_ERROR: 'CONFLICT_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR'
};

// Default team settings
export const DEFAULT_TEAM_SETTINGS = {
  visibility: TEAM_VISIBILITY.PUBLIC,
  joinPolicy: JOIN_POLICY.REQUEST,
  status: TEAM_STATUS.ACTIVE,
  maxMembers: 50,
  allowPlayerSelfRegistration: true,
  requireApprovalForJoin: true,
  enableFormations: true,
  enableStatistics: true
};

// Export all constants for easier imports
export const TEAM_CONSTANTS = {
  TEAM_ACTIONS,
  CACHE_CONFIG,
  TEAM_ROLES,
  ROLE_HIERARCHY,
  PERMISSIONS,
  ROLE_PERMISSIONS,
  TEAM_VALIDATION,
  TEAM_ENDPOINTS,
  TEAM_STATUS,
  TEAM_VISIBILITY,
  JOIN_POLICY,
  TEAM_ERROR_TYPES,
  DEFAULT_TEAM_SETTINGS
};
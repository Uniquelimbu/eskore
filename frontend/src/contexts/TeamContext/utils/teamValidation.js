import { TEAM_VALIDATION } from '../constants/teamConstants';

/**
 * Sanitize team data
 */
export const sanitizeTeamData = (team) => {
  if (!team || typeof team !== 'object') return null;
  
  return {
    id: team.id,
    name: team.name?.trim() || '',
    abbreviation: team.abbreviation?.trim().toUpperCase() || '',
    logoUrl: team.logoUrl || null,
    nickname: team.nickname?.trim() || '',
    city: team.city?.trim() || '',
    foundedYear: team.foundedYear || null,
    description: team.description?.trim() || '',
    visibility: team.visibility || 'public',
    teamIdentifier: team.teamIdentifier || null,
    createdBy: team.createdBy || team.creatorId || null,
    ownerId: team.ownerId || team.createdBy || team.creatorId || null,
    creatorId: team.creatorId || team.createdBy || null,
    userRole: team.userRole || null,
    role: team.role || null,
    createdAt: team.createdAt,
    updatedAt: team.updatedAt
  };
};

/**
 * Sanitize member data
 */
export const sanitizeMemberData = (member) => {
  if (!member || typeof member !== 'object') return null;
  
  return {
    id: member.id || member.userId,
    userId: member.userId || member.id,
    teamId: member.teamId,
    firstName: member.firstName || member.user?.firstName || '',
    lastName: member.lastName || member.user?.lastName || '',
    email: member.email || member.user?.email || '',
    role: member.role || member.teamRole || 'member',
    position: member.position || null,
    jerseyNumber: member.jerseyNumber || null,
    joinedAt: member.joinedAt || member.createdAt,
    avatar: member.avatar || member.user?.avatar || null,
    isActive: member.isActive !== false, // Default to true
    user: member.user || null
  };
};

/**
 * Validate team creation data
 */
export const validateCreateTeamData = (teamData) => {
  const errors = [];
  
  if (!teamData || typeof teamData !== 'object') {
    return { isValid: false, errors: ['Invalid team data'] };
  }
  
  // Name validation
  if (!teamData.name || typeof teamData.name !== 'string') {
    errors.push('Team name is required');
  } else {
    const name = teamData.name.trim();
    if (name.length < TEAM_VALIDATION.NAME_MIN_LENGTH) {
      errors.push(`Team name must be at least ${TEAM_VALIDATION.NAME_MIN_LENGTH} characters`);
    } else if (name.length > TEAM_VALIDATION.NAME_MAX_LENGTH) {
      errors.push(`Team name cannot exceed ${TEAM_VALIDATION.NAME_MAX_LENGTH} characters`);
    }
  }
  
  // Abbreviation validation
  if (teamData.abbreviation) {
    const abbreviation = teamData.abbreviation.trim();
    if (abbreviation.length < TEAM_VALIDATION.ABBREVIATION_MIN_LENGTH || 
        abbreviation.length > TEAM_VALIDATION.ABBREVIATION_MAX_LENGTH) {
      errors.push(`Team abbreviation must be ${TEAM_VALIDATION.ABBREVIATION_MIN_LENGTH}-${TEAM_VALIDATION.ABBREVIATION_MAX_LENGTH} characters`);
    }
  }
  
  // City validation
  if (teamData.city && teamData.city.length > TEAM_VALIDATION.CITY_MAX_LENGTH) {
    errors.push(`City name cannot exceed ${TEAM_VALIDATION.CITY_MAX_LENGTH} characters`);
  }
  
  // Founded year validation
  if (teamData.foundedYear) {
    const currentYear = new Date().getFullYear();
    const year = parseInt(teamData.foundedYear);
    if (isNaN(year) || year < 1800 || year > currentYear) {
      errors.push('Invalid founded year');
    }
  }
  
  // Description validation
  if (teamData.description && teamData.description.length > TEAM_VALIDATION.DESCRIPTION_MAX_LENGTH) {
    errors.push(`Description cannot exceed ${TEAM_VALIDATION.DESCRIPTION_MAX_LENGTH} characters`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate team update data
 */
export const validateUpdateTeamData = (updateData) => {
  // Same validation as create, but all fields are optional
  if (!updateData || typeof updateData !== 'object') {
    return { isValid: false, errors: ['Invalid update data'] };
  }
  
  const errors = [];
  
  // Only validate fields that are present
  if (updateData.name !== undefined) {
    if (!updateData.name || typeof updateData.name !== 'string') {
      errors.push('Team name cannot be empty');
    } else {
      const name = updateData.name.trim();
      if (name.length < TEAM_VALIDATION.NAME_MIN_LENGTH) {
        errors.push(`Team name must be at least ${TEAM_VALIDATION.NAME_MIN_LENGTH} characters`);
      } else if (name.length > TEAM_VALIDATION.NAME_MAX_LENGTH) {
        errors.push(`Team name cannot exceed ${TEAM_VALIDATION.NAME_MAX_LENGTH} characters`);
      }
    }
  }
  
  if (updateData.abbreviation !== undefined && updateData.abbreviation) {
    const abbreviation = updateData.abbreviation.trim();
    if (abbreviation.length < TEAM_VALIDATION.ABBREVIATION_MIN_LENGTH || 
        abbreviation.length > TEAM_VALIDATION.ABBREVIATION_MAX_LENGTH) {
      errors.push(`Team abbreviation must be ${TEAM_VALIDATION.ABBREVIATION_MIN_LENGTH}-${TEAM_VALIDATION.ABBREVIATION_MAX_LENGTH} characters`);
    }
  }
  
  if (updateData.city !== undefined && updateData.city && updateData.city.length > TEAM_VALIDATION.CITY_MAX_LENGTH) {
    errors.push(`City name cannot exceed ${TEAM_VALIDATION.CITY_MAX_LENGTH} characters`);
  }
  
  if (updateData.foundedYear !== undefined && updateData.foundedYear) {
    const currentYear = new Date().getFullYear();
    const year = parseInt(updateData.foundedYear);
    if (isNaN(year) || year < 1800 || year > currentYear) {
      errors.push('Invalid founded year');
    }
  }
  
  if (updateData.description !== undefined && updateData.description && updateData.description.length > TEAM_VALIDATION.DESCRIPTION_MAX_LENGTH) {
    errors.push(`Description cannot exceed ${TEAM_VALIDATION.DESCRIPTION_MAX_LENGTH} characters`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Check if team data is complete
 */
export const isTeamDataComplete = (team) => {
  return !!(team?.id && team?.name);
};

/**
 * Check if member data is complete
 */
export const isMemberDataComplete = (member) => {
  return !!(member?.id && member?.userId && member?.role);
};

/**
 * Validate member join data
 */
export const validateJoinTeamData = (joinData) => {
  const errors = [];
  
  if (joinData.message && joinData.message.length > 500) {
    errors.push('Join message cannot exceed 500 characters');
  }
  
  if (joinData.playerData) {
    if (joinData.playerData.position && typeof joinData.playerData.position !== 'string') {
      errors.push('Invalid position data');
    }
    
    if (joinData.playerData.jerseyNumber) {
      const num = parseInt(joinData.playerData.jerseyNumber);
      if (isNaN(num) || num < 1 || num > 999) {
        errors.push('Jersey number must be between 1 and 999');
      }
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate team member update data
 */
export const validateMemberUpdateData = (updateData) => {
  const errors = [];
  
  if (updateData.role && !['member', 'player', 'athlete', 'coach', 'assistant_coach', 'assistant_manager', 'manager'].includes(updateData.role)) {
    errors.push('Invalid role specified');
  }
  
  if (updateData.position && updateData.position.length > 50) {
    errors.push('Position name cannot exceed 50 characters');
  }
  
  if (updateData.jerseyNumber !== undefined) {
    const num = parseInt(updateData.jerseyNumber);
    if (updateData.jerseyNumber !== null && (isNaN(num) || num < 1 || num > 999)) {
      errors.push('Jersey number must be between 1 and 999');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};
/**
 * Team helper utilities - separated from validation logic
 */

/**
 * Get team member by user ID
 */
export const getTeamMember = (teamMembers, userId) => {
  if (!teamMembers || !userId) return null;
  
  return teamMembers.find(member => 
    member.userId === userId || 
    member.id === userId ||
    member.user?.id === userId
  );
};

/**
 * Check if user is a member of the team
 */
export const isUserTeamMember = (teamMembers, userId) => {
  if (!teamMembers || !userId) return false;
  
  return teamMembers.some(member => 
    member.userId === userId || 
    member.id === userId ||
    member.user?.id === userId
  );
};

/**
 * Generate team display name
 */
export const getTeamDisplayName = (team) => {
  if (!team) return 'Unknown Team';
  
  if (team.nickname && team.name) {
    return `${team.name} (${team.nickname})`;
  }
  
  return team.name || 'Unnamed Team';
};

/**
 * Generate team abbreviation
 */
export const getTeamAbbreviation = (team) => {
  if (!team) return 'TM';
  
  if (team.abbreviation) {
    return team.abbreviation.toUpperCase();
  }
  
  if (team.name) {
    return team.name.substring(0, 3).toUpperCase();
  }
  
  return 'TM';
};

/**
 * Format member display name
 */
export const getMemberDisplayName = (member) => {
  if (!member) return 'Unknown Member';
  
  const firstName = member.firstName || member.user?.firstName || '';
  const lastName = member.lastName || member.user?.lastName || '';
  
  if (firstName && lastName) {
    return `${firstName} ${lastName}`;
  }
  
  if (firstName) return firstName;
  if (lastName) return lastName;
  
  return member.email || member.user?.email || 'Unknown Member';
};

/**
 * Get member initials
 */
export const getMemberInitials = (member) => {
  if (!member) return 'M';
  
  const firstName = member.firstName || member.user?.firstName || '';
  const lastName = member.lastName || member.user?.lastName || '';
  
  if (firstName && lastName) {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  }
  
  if (firstName) return firstName[0].toUpperCase();
  if (lastName) return lastName[0].toUpperCase();
  
  const email = member.email || member.user?.email || '';
  if (email) return email[0].toUpperCase();
  
  return 'M';
};

/**
 * Get member role display name
 */
export const getMemberRoleDisplay = (member) => {
  if (!member?.role) return 'Member';
  
  const roleMap = {
    'manager': 'Manager',
    'assistant_manager': 'Assistant Manager',
    'coach': 'Coach',
    'assistant_coach': 'Assistant Coach',
    'player': 'Player',
    'athlete': 'Athlete',
    'member': 'Member'
  };
  
  return roleMap[member.role] || member.role.charAt(0).toUpperCase() + member.role.slice(1);
};

/**
 * Check if team has logo
 */
export const hasTeamLogo = (team) => {
  return !!(team?.logoUrl && team.logoUrl.trim());
};

/**
 * Get team logo or fallback
 */
export const getTeamLogoUrl = (team, fallback = null) => {
  if (hasTeamLogo(team)) {
    return team.logoUrl;
  }
  return fallback;
};

/**
 * Format team founded year
 */
export const formatFoundedYear = (year) => {
  if (!year) return null;
  
  const numYear = parseInt(year, 10);
  if (isNaN(numYear)) return null;
  
  return `Founded ${numYear}`;
};

/**
 * Get team age in years
 */
export const getTeamAge = (foundedYear) => {
  if (!foundedYear) return null;
  
  const numYear = parseInt(foundedYear, 10);
  if (isNaN(numYear)) return null;
  
  const currentYear = new Date().getFullYear();
  const age = currentYear - numYear;
  
  return age > 0 ? age : null;
};

/**
 * Format team location
 */
export const formatTeamLocation = (team) => {
  if (!team) return null;
  
  const parts = [];
  
  if (team.city) parts.push(team.city);
  if (team.state) parts.push(team.state);
  if (team.country) parts.push(team.country);
  
  return parts.length > 0 ? parts.join(', ') : null;
};

/**
 * Get team stats summary
 */
export const getTeamStatsSummary = (team, members = []) => {
  return {
    totalMembers: members.length,
    managers: members.filter(m => m.role === 'manager' || m.role === 'assistant_manager').length,
    players: members.filter(m => m.role === 'player' || m.role === 'athlete').length,
    coaches: members.filter(m => m.role === 'coach' || m.role === 'assistant_coach').length,
    founded: team?.foundedYear || null,
    location: formatTeamLocation(team)
  };
};

/**
 * Sort team members by role hierarchy
 */
export const sortMembersByRole = (members) => {
  const roleOrder = {
    'manager': 1,
    'assistant_manager': 2,
    'coach': 3,
    'assistant_coach': 4,
    'player': 5,
    'athlete': 6,
    'member': 7
  };
  
  return [...members].sort((a, b) => {
    const aOrder = roleOrder[a.role] || 999;
    const bOrder = roleOrder[b.role] || 999;
    
    if (aOrder !== bOrder) {
      return aOrder - bOrder;
    }
    
    // Secondary sort by name
    const aName = getMemberDisplayName(a);
    const bName = getMemberDisplayName(b);
    return aName.localeCompare(bName);
  });
};

/**
 * Group members by role
 */
export const groupMembersByRole = (members) => {
  const groups = {
    managers: [],
    coaches: [],
    players: [],
    others: []
  };
  
  members.forEach(member => {
    const role = member.role || 'member';
    
    if (role === 'manager' || role === 'assistant_manager') {
      groups.managers.push(member);
    } else if (role === 'coach' || role === 'assistant_coach') {
      groups.coaches.push(member);
    } else if (role === 'player' || role === 'athlete') {
      groups.players.push(member);
    } else {
      groups.others.push(member);
    }
  });
  
  return groups;
};

/**
 * Check if team name is valid
 */
export const isValidTeamName = (name) => {
  return !!(name && typeof name === 'string' && name.trim().length >= 2);
};

/**
 * Generate unique team identifier
 */
export const generateTeamIdentifier = (teamName) => {
  if (!teamName) return null;
  
  return teamName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
};

/**
 * Parse team invitation code
 */
export const parseInvitationCode = (code) => {
  try {
    // Basic validation - adjust based on your invitation code format
    if (!code || typeof code !== 'string') return null;
    
    // Example format: TEAM123-ABC456
    const parts = code.split('-');
    if (parts.length !== 2) return null;
    
    return {
      teamId: parts[0].replace('TEAM', ''),
      inviteCode: parts[1],
      isValid: true
    };
  } catch (error) {
    return null;
  }
};

/**
 * Format team member count
 */
export const formatMemberCount = (count) => {
  if (count === 0) return 'No members';
  if (count === 1) return '1 member';
  return `${count} members`;
};

/**
 * Check if user can join team
 */
export const canUserJoinTeam = (team, user, members = []) => {
  if (!team || !user) return false;
  
  // Check if already a member
  if (isUserTeamMember(members, user.id)) {
    return false;
  }
  
  // Check team visibility/join settings
  if (team.joinPolicy === 'closed') {
    return false;
  }
  
  return true;
};
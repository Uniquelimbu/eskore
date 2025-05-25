export const MANAGER_ROLES = new Set(['manager', 'owner', 'admin', 'assistant_manager']);

/**
 * Returns true if the provided role string represents a manager-level role.
 * @param {string|undefined|null} role
 * @returns {boolean}
 */
export function roleIsManager(role) {
  return !!role && MANAGER_ROLES.has(String(role).toLowerCase());
}

/**
 * Robust helper that determines whether the current user has manager privileges
 * on the supplied team object.
 *
 * Because our backend can return team/member data in several shapes (due to
 * eager-loading strategies or historical API responses), this function checks a
 * variety of common locations for the user's role/identity.
 *
 * 1. Creator/owner fields (creatorId, createdBy, ownerId)
 * 2. Direct `userRole` / `role` strings on the team object
 * 3. Flattened `UserTeam` association on the team object
 * 4. team.Users   →  [{ id, UserTeam: { role } }, …]
 * 5. team.members →  [{ userId (or id), role }, …]
 * 6. team.managers→  [{ userId (or id) }, …]
 * 7. team.Player  →  Check if user has associated Player record
 * 8. team.Manager →  Check if user has associated Manager record
 *
 * @param {object} teamData – raw object returned from /api/teams/:id
 * @param {object} currentUser – authenticated user object
 * @returns {boolean}
 */
export function isUserManager(teamData, currentUser) {
  if (!teamData || !currentUser) return false;

  // 1. Creator / owner checks
  const creatorIds = [teamData.creatorId, teamData.createdBy, teamData.ownerId];
  if (creatorIds.includes(currentUser.id)) return true;

  // 2. Direct role strings on the team object
  if (roleIsManager(teamData.userRole) || roleIsManager(teamData.role)) {
    return true;
  }

  // 3. Flattened UserTeam association on the team object itself
  if (teamData.UserTeam && roleIsManager(teamData.UserTeam.role)) {
    return true;
  }

  // Helper for array-based searches
  const arrayIncludesManager = (arr, predicate) =>
    Array.isArray(arr) && arr.some(predicate);

  // 4. Users array (with nested UserTeam)
  if (
    arrayIncludesManager(teamData.Users, (u) =>
      u && u.id === currentUser.id &&
      (
        roleIsManager(u.role) ||
        (u.UserTeam && roleIsManager(u.UserTeam.role))
      )
    )
  ) {
    return true;
  }

  // 5. Generic members array (historical shape)
  if (
    arrayIncludesManager(teamData.members, (m) =>
      (m?.userId ?? m?.id) === currentUser.id && roleIsManager(m.role)
    )
  ) {
    return true;
  }

  // 6. Dedicated managers array
  if (
    arrayIncludesManager(teamData.managers, (m) =>
      (m?.userId ?? m?.id) === currentUser.id
    )
  ) {
    return true;
  }
  
  // 7. Check if user has a Manager record associated with this team
  if (teamData.Manager && teamData.Manager.userId === currentUser.id) {
    return true;
  }
  
  // Not a manager
  return false;
}

/**
 * Determines if the user is a player on the team (has a Player record)
 * @param {object} teamData - team data object
 * @param {object} currentUser - current user object
 * @returns {boolean}
 */
export function isUserPlayer(teamData, currentUser) {
  if (!teamData || !currentUser) return false;
  
  // Check team members for player role
  if (
    Array.isArray(teamData.members) &&
    teamData.members.some(m => 
      (m?.userId ?? m?.id) === currentUser.id && 
      m.role === 'athlete'
    )
  ) {
    return true;
  }
  
  // Check if user has Player record for this team
  if (
    Array.isArray(teamData.Players) &&
    teamData.Players.some(p => p.userId === currentUser.id)
  ) {
    return true;
  }
  
  return false;
}
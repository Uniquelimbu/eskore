const express = require('express');
const router = express.Router();
const { requireAuth } = require('../../middleware/auth');
const { catchAsync, ApiError } = require('../../middleware/errorHandler');
const { validate, schemas } = require('../../validation');
const sequelize = require('../../config/db');
const { Op } = require('sequelize');
const { body, param } = require('express-validator');

// Import models through sequelize instance to ensure they're properly initialized
const User = sequelize.models.User;
const Team = sequelize.models.Team;
const UserTeam = sequelize.models.UserTeam;
const Player = sequelize.models.Player;
const Manager = sequelize.models.Manager;

const { sendSafeJson } = require('../../utils/safeSerializer');
const log = require('../../utils/log');

router.get('/:id/members', 
  validate(schemas.team.teamIdParam),
  catchAsync(async (req, res) => {
    log.info(`TEAMROUTES/MEMBERS (GET /:id/members): Fetching members for team ${req.params.id}`);
    const { id } = req.params;

    const team = await Team.findByPk(id);
    if (!team) {
      throw new ApiError('Team not found', 404, 'RESOURCE_NOT_FOUND');
    }

    // Log for debugging
    log.info(`Using models from sequelize instance: User: ${!!User}, Team: ${!!Team}, UserTeam: ${!!UserTeam}, Player: ${!!Player}, Manager: ${!!Manager}`);

    try {
      // Use a more reliable query approach that doesn't depend on associations
      const userTeams = await UserTeam.findAll({
        where: { teamId: id },
        include: [{
          model: User,
          attributes: ['id', 'firstName', 'lastName', 'email']
        }]
      });
      
      // Get user IDs to fetch related profiles
      const userIds = userTeams.map(ut => ut.User?.id).filter(Boolean);
      
      // Verify userIds array
      log.info(`Found ${userIds.length} user IDs for team ${id}`);
      
      // Safe approach - use try/catch for each model query
      let players = [];
      let managers = [];
      
      try {
        if (userIds.length > 0) {
          players = await Player.findAll({
            where: { userId: { [Op.in]: userIds } }
          });
          log.info(`Found ${players.length} player profiles`);
        }
      } catch (playerErr) {
        log.error(`Error fetching players: ${playerErr.message}`);
        players = []; // Ensure it's an empty array on error
      }
      
      try {
        if (userIds.length > 0) {
          managers = await Manager.findAll({
            where: { userId: { [Op.in]: userIds } }
          });
          log.info(`Found ${managers.length} manager profiles`);
        }
      } catch (managerErr) {
        log.error(`Error fetching managers: ${managerErr.message}`);
        managers = []; // Ensure it's an empty array on error
      }
      
      // Map player and manager data by userId for quick lookup
      const playerMap = players.reduce((map, player) => {
        map[player.userId] = player;
        return map;
      }, {});
      
      const managerMap = managers.reduce((map, manager) => {
        map[manager.userId] = manager;
        return map;
      }, {});
      
      // Build response with combined data
      const formattedMembers = userTeams.map(userTeam => {
        if (!userTeam.User) return null;
        
        const userId = userTeam.User.id;
        return {
          id: userId,
          firstName: userTeam.User.firstName,
          lastName: userTeam.User.lastName,
          email: userTeam.User.email,
          role: userTeam.role,
          joinedAt: userTeam.joinedAt,
          status: userTeam.status,
          Player: playerMap[userId] || null,
          Manager: managerMap[userId] || null
        };
      }).filter(Boolean);

      return sendSafeJson(res, {
        teamId: id,
        teamName: team.name,
        members: formattedMembers
      });
    } catch (error) {
      log.error(`TEAMROUTES/MEMBERS Error: ${error.message}`, error);
      throw error;
    }
  })
);

/**
 * POST /api/teams/:id/members
 * Adds a member to a team
 */
router.post('/:id/members', 
  requireAuth, 
  validate([
    ...schemas.team.teamIdParam,
    ...schemas.team.teamMemberSchema
  ]), 
  catchAsync(async (req, res) => {
  log.info(`TEAMROUTES/MEMBER (POST /:id/members): Adding member to team ID ${req.params.id} by user ${req.user?.email}. Body: ${JSON.stringify(req.body)}`);
  const { id } = req.params;
  const { userId, role = 'athlete' } = req.body;
  
  // Validate parameters
  if (!userId) {
    throw new ApiError('User ID is required', 400, 'VALIDATION_ERROR');
  }
  
  if (!['manager', 'assistant_manager', 'athlete', 'coach'].includes(role)) {
    throw new ApiError('Invalid role', 400, 'VALIDATION_ERROR');
  }
  
  // Check if team exists
  const team = await Team.findByPk(id);
  if (!team) {
    throw new ApiError('Team not found', 404, 'RESOURCE_NOT_FOUND');
  }
  
  // Check if user has permission (team manager or assistant manager)
  const userTeamPermission = await UserTeam.findOne({
    where: {
      userId: req.user.userId,
      teamId: id,
      role: { [Op.in]: ['manager', 'assistant_manager'] }
    }
  });
  
  if (!userTeamPermission) {
    throw new ApiError('Forbidden - You must be a team manager or assistant manager to add members', 403, 'FORBIDDEN');
  }
  
  if (userTeamPermission.role === 'assistant_manager' && ['manager', 'assistant_manager'].includes(role)) {
    throw new ApiError('Forbidden - Assistant managers can only add athletes and coaches', 403, 'FORBIDDEN');
  }
  
  // Check if user exists
  const user = await User.findByPk(userId);
  if (!user) {
    throw new ApiError('User not found', 404, 'USER_NOT_FOUND');
  }
  
  // Check if user is already in the team with the same role
  const existingMembership = await UserTeam.findOne({
    where: {
      userId,
      teamId: id,
      role
    }
  });
  
  if (existingMembership) {
    throw new ApiError('User already has this role in the team', 409, 'ALREADY_EXISTS');
  }
  
  // Add user to the team
  const userTeam = await UserTeam.create({
    userId,
    teamId: id,
    role: role || 'athlete'
  });
  
  return sendSafeJson(res, {
    success: true,
    message: 'User added to the team successfully',
    membership: userTeam
  }, 201);
}));

/**
 * DELETE /api/teams/:id/members/:userId
 * Removes a member from a team
 */
router.delete('/:id/members/:userId', 
  requireAuth, 
  validate([
    ...schemas.team.teamIdParam,
    param('userId').isInt().withMessage('User ID must be an integer').toInt()
  ]),
  catchAsync(async (req, res) => {
  log.info(`TEAMROUTES/MEMBER (DELETE /:id/members/:userId): Removing member ${req.params.userId} from team ${req.params.id} by user ${req.user?.email}.`);
  const { id, userId } = req.params;
  
  // Check if team exists
  const team = await Team.findByPk(id);
  if (!team) {
    throw new ApiError('Team not found', 404, 'RESOURCE_NOT_FOUND');
  }
  
  // Check if user has permission (team manager)
  const userTeamManager = await UserTeam.findOne({
    where: {
      userId: req.user.userId,
      teamId: id,
      role: { [Op.in]: ['manager', 'assistant_manager'] }
    }
  });
  
  if (!userTeamManager) {
    // Allow managers to remove athletes or coaches they added? Or only owners?
    // Current logic: only owners can remove any member.
    // If self-removal is allowed, that's a different check (e.g. if req.user.userId === parseInt(userId))
    throw new ApiError('Forbidden - You must be a team manager to remove members', 403, 'FORBIDDEN');
  }
  
  // Prevent owner from removing themselves if they are the sole owner? (Consider this logic)

  // Start a transaction
  const t = await sequelize.transaction();
    
  try {
    // Check if the user to be removed is the manager
    const memberToRemove = await UserTeam.findOne({
      where: {
        teamId: id,
        userId: userId
      },
      transaction: t
    });
    
    if (!memberToRemove) {
      await t.rollback();
      throw new ApiError('Member not found in this team', 404, 'RESOURCE_NOT_FOUND');
    }
    
    // Count total team members
    const memberCount = await UserTeam.count({
      where: { teamId: id },
      transaction: t
    });
    
    // Prevent removing a manager if they're not the only member
    if (memberToRemove.role === 'manager' && memberCount > 1) {
      await t.rollback();
      throw new ApiError('Please transfer manager role before leaving the team', 403, 'FORBIDDEN_MANAGER_LEAVE');
    }
    
    // Remove the member
    await memberToRemove.destroy({ transaction: t });

    const remainingCount = memberCount - 1;

    if (remainingCount === 0) {
      // No members left ‑> delete the team entirely (and any residual memberships/tournaments just in case)
      const TeamTournament = require('../../models/TeamTournament');
      await TeamTournament.destroy({ where: { teamId: id }, transaction: t });
      await Team.destroy({ where: { id }, transaction: t });
      log.info(`TEAMROUTES/MEMBER (DELETE /:id/members/:userId): Team ${id} had no remaining members and was deleted.`);
    } else if (remainingCount === 1) {
      // Exactly one member left ‑> ensure they are manager
      const lastMember = await UserTeam.findOne({
        where: { teamId: id },
        transaction: t
      });
      if (lastMember && lastMember.role !== 'manager') {
        lastMember.role = 'manager';
        await lastMember.save({ transaction: t });
        log.info(`TEAMROUTES/MEMBER (DELETE /:id/members/:userId): Auto-promoted last member (user ${lastMember.userId}) to manager.`);
      }
    }
    
    await t.commit();
    
    return sendSafeJson(res, {
      success: true,
      message: 'Team member removed successfully'
    });
  } catch (error) {
    await t.rollback();
    throw error;
  }
}));

/**
 * GET /api/teams/user/:userId
 * Get all teams a user is a member of
 */
router.get('/user/:userId', 
  requireAuth, 
  validate([
    param('userId').isInt().withMessage('User ID must be an integer').toInt()
  ]),
  catchAsync(async (req, res) => {
  log.info(`TEAMROUTES/MEMBER (GET /user/:userId): Fetching teams for user ID ${req.params.userId}, requested by user ${req.user?.email}.`);
  const { userId } = req.params;
  
  // Users can only see their own teams
  if (parseInt(userId) !== req.user.userId) { // Admin check removed
    throw new ApiError('Forbidden - You can only view your own teams', 403, 'FORBIDDEN');
  }
  
  // Get all teams for the user
  const userTeams = await UserTeam.findAll({
    where: { userId },
    include: [
      {
        model: Team,
        attributes: ['id', 'name', 'logoUrl']
      }
    ]
  });
  
  // Map the teams with their roles
  const teams = userTeams.map(ut => ({
    ...ut.Team.toJSON(),
    role: ut.role
  }));
    
  return sendSafeJson(res, { teams });
}));

module.exports = router;
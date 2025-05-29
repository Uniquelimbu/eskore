const express = require('express');
const router = express.Router();
const { requireAuth } = require('../../middleware/auth');
const { catchAsync, ApiError } = require('../../middleware/errorHandler');
const { validate, schemas } = require('../../validation');
const Team = require('../../models/Team');
const UserTeam = require('../../models/UserTeam');
const User = require('../../models/User');
const Player = require('../../models/Player'); // Add missing Player model import
const Manager = require('../../models/Manager'); // Add Manager model import for completeness
const { sendSafeJson } = require('../../utils/safeSerializer');
const log = require('../../utils/log');
const sequelize = require('../../config/db');
const { Op } = require('sequelize');
const { body, param } = require('express-validator');

/**
 * GET /api/teams/:id/members
 * Fetches all members of a specific team
 */
router.get('/:id/members', 
  validate(schemas.team.teamIdParam),
  catchAsync(async (req, res) => {
    log.info(`TEAMROUTES/MEMBERS (GET /:id/members): Fetching members for team ${req.params.id}`);
    const { id } = req.params;

    const team = await Team.findByPk(id);
    if (!team) {
      throw new ApiError('Team not found', 404, 'RESOURCE_NOT_FOUND');
    }

    // Get all team members with their player and manager profiles
    const members = await User.findAll({
      attributes: ['id', 'firstName', 'lastName', 'email'],
      include: [
        {
          model: UserTeam,
          as: 'userTeams',
          where: { teamId: id },
          attributes: ['role', 'joinedAt', 'status']
        },
        {
          model: Player,
          as: 'Player',
          attributes: ['id', 'position', 'height', 'weight', 'preferredFoot', 'jerseyNumber', 'nationality', 'profileImageUrl']
        },
        {
          model: Manager,
          as: 'Manager',
          attributes: ['id', 'playingStyle', 'preferredFormation', 'experience', 'profileImageUrl']
        }
      ]
    });

    // Format response
    const formattedMembers = members.map(member => {
      const memberData = member.toJSON();
      const userTeam = memberData.userTeams[0];
      
      return {
        id: memberData.id,
        firstName: memberData.firstName,
        lastName: memberData.lastName,
        email: memberData.email,
        role: userTeam.role,
        joinedAt: userTeam.joinedAt,
        status: userTeam.status,
        Player: memberData.Player,
        Manager: memberData.Manager
      };
    });

    return sendSafeJson(res, {
      teamId: id,
      teamName: team.name,
      members: formattedMembers
    });
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
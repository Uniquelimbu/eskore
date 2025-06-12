const express = require('express');
const router = express.Router();
const { requireAuth } = require('../../middleware/auth');
const { catchAsync, ApiError } = require('../../middleware/errorHandler');
const { validate, schemas } = require('../../validation');
const { param, body } = require('express-validator'); // Add this import
const Team = require('../../models/Team');
const UserTeam = require('../../models/UserTeam');
const User = require('../../models/User');
const Manager = require('../../models/Manager'); // Add Manager model import
const { sendSafeJson } = require('../../utils/safeSerializer');
const log = require('../../utils/log');
const sequelize = require('../../config/db');
const { Op } = require('sequelize');
const { generateTeamIdentifier } = require('../../utils/teamIdentifierGenerator');

/**
 * GET /api/teams
 * Retrieve a list of all teams
 */
router.get('/', catchAsync(async (req, res) => {
  log.info('TEAMROUTES/CORE (GET /): Fetching all teams.');
  const teams = await Team.findAll();
  
  return sendSafeJson(res, {
    success: true,
    count: teams.length,
    teams
  });
}));

/**
 * GET /api/teams/:id
 * Retrieve a specific team by ID, including its members
 */
router.get('/:id', validate(schemas.team.teamIdParam), catchAsync(async (req, res) => {
  log.info(`TEAMROUTES/CORE (GET /:id): Fetching team with ID: ${req.params.id}`);
  const { id } = req.params;
  const teamInstance = await Team.findByPk(id, {
    include: [
      {
        model: User,
        as: 'Users',
        attributes: ['id', 'firstName', 'lastName', 'email', 'profileImageUrl'],
        through: {
          attributes: ['role', 'status', 'joinedAt']
        }
      }
    ]
  });
  
  if (!teamInstance) {
    throw new ApiError('Team not found', 404, 'RESOURCE_NOT_FOUND');
  }

  // Convert to plain object to safely manipulate
  const teamData = teamInstance.toJSON();

  // Ensure Users array and its contents are as expected for the frontend
  if (teamData.Users && Array.isArray(teamData.Users)) {
    teamData.Users = teamData.Users.map(user => {
      if (!user || user.id === null || user.id === undefined) {
        log.warn(`TEAMROUTES/CORE (GET /:id): User object in teamData.Users has null or undefined id. User data: ${JSON.stringify(user)}`);
        return null;
      }
      return {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        profileImageUrl: user.profileImageUrl,
        UserTeam: user.UserTeam ? { 
            role: user.UserTeam.role,
            status: user.UserTeam.status,
            joinedAt: user.UserTeam.joinedAt
        } : null
      };
    }).filter(user => user !== null);
  }
  
  return sendSafeJson(res, teamData);
}));

/**
 * POST /api/teams
 * Creates a new team
 */
router.post('/', 
  requireAuth, 
  validate(schemas.team.createTeam), 
  catchAsync(async (req, res) => {
    log.info(`TEAMROUTES/CORE (POST /): Creating new team: ${JSON.stringify(req.body)}`);
    const { 
      name, 
      abbreviation, 
      foundedYear, 
      city, 
      nickname,
      visibility = 'public' // New field with default
    } = req.body;
    
    // Enhanced validation for user ID before proceeding
    if (!req.user) {
      log.error(`TEAMROUTES/CORE (POST /): Missing user in request. req.user: ${JSON.stringify(req.user)}`);
      throw new ApiError('Authentication error: User is missing', 401, 'AUTH_ERROR');
    }
    
    // Extract userId correctly from the auth object
    // Look for id first, then userId as fallback
    const userId = req.user.id || req.user.userId;
    
    if (!userId) {
      log.error(`TEAMROUTES/CORE (POST /): Missing user ID in request. req.user: ${JSON.stringify(req.user)}`);
      throw new ApiError('Authentication error: User ID is missing', 401, 'AUTH_ERROR');
    }
    
    // Start a transaction for atomicity
    const t = await sequelize.transaction();
    
    try {
      // 1. Create the team with the extracted userId and visibility
      const team = await Team.create({
        name,
        abbreviation: abbreviation?.toUpperCase() || null,
        foundedYear: foundedYear || null,
        city: city || null,
        nickname: nickname || null,
        visibility, // Add visibility field
        createdBy: userId,
        creatorId: userId
      }, { transaction: t });
      
      // 2. Generate and set team identifier
      team.teamIdentifier = generateTeamIdentifier(team.name, team.id);
      await team.save({ transaction: t });
      
      // 3. Associate the user with the team as manager
      await UserTeam.create({
        userId: userId, // Use the extracted userId
        teamId: team.id,
        role: 'manager'
      }, { transaction: t });
      
      // 4. MODIFIED: Don't create a default Manager record here
      // Leave manager record creation to the dedicated manager form
      // This prevents duplicates and allows the user to enter proper data
      
      // Commit the transaction
      await t.commit();
      
      // After transaction is committed, create formation with a delay
      // This ensures the team is fully available in the database
      setTimeout(async () => {
        try {
          const Formation = require('../../models/Formation');
          const formation = await Formation.createDefaultFormation(team.id);
          if (formation) {
            log.info(`Successfully created default formation for new team ${team.id}`);
          }
        } catch (formationError) {
          log.error(`Formation creation for team ${team.id} failed:`, formationError);
          // No need to notify client, this is a background task
        }
      }, 1000);
      
      log.info(`TEAMROUTES/CORE (POST /): Team created successfully. ID: ${team.id}, Name: ${team.name}, TeamIdentifier: ${team.teamIdentifier}, CreatorID: ${userId}`);
      
      return sendSafeJson(res, {
        success: true,
        message: 'Team created successfully',
        team
      }, 201);
    } catch (error) {
      // Rollback the transaction on error
      await t.rollback();
      
      log.error(`TEAMROUTES/CORE (POST /): Error creating team: ${error.message}`, error);
      
      // Handle specific errors
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw new ApiError('A team with this name already exists', 409, 'DUPLICATE_ENTITY');
      }
      
      if (error.name === 'SequelizeValidationError') {
        throw new ApiError(`Validation error: ${error.message}`, 400, 'VALIDATION_ERROR');
      }
      
      // Re-throw other errors to be handled by the global error handler
      throw new ApiError(`Failed to create team: ${error.message}`, 500, 'INTERNAL_SERVER_ERROR');
    }
  })
);

/**
 * PATCH /api/teams/:id
 * Updates a team's details
 */
router.patch('/:id', 
  requireAuth, 
  validate([
    ...schemas.team.teamIdParam,
    ...schemas.team.teamSchema
  ]), 
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const { 
      name, 
      abbreviation, 
      foundedYear, 
      city, 
      nickname,
      visibility // Added visibility field
    } = req.body;
    
    log.info(`TEAMROUTES/CORE (PATCH /:id): Updating team with ID: ${id}, User: ${req.user?.email}`);
    
    // Find the team
    const team = await Team.findByPk(id);
    if (!team) {
      throw new ApiError('Team not found', 404, 'RESOURCE_NOT_FOUND');
    }
    
    // Check if user has permission (team manager or assistant_manager)
    const userTeam = await UserTeam.findOne({
      where: {
        userId: req.user.userId,
        teamId: id,
        role: { [Op.in]: ['manager', 'assistant_manager'] }
      }
    });
    
    if (!userTeam) {
      throw new ApiError('Forbidden - You must be a team manager or assistant manager to update it', 403, 'FORBIDDEN');
    }
    
    // Apply updates
    if (name) team.name = name;
    if (abbreviation !== undefined) team.abbreviation = abbreviation?.toUpperCase() || null;
    if (foundedYear !== undefined) team.foundedYear = foundedYear || null;
    if (city !== undefined) team.city = city || null;
    if (nickname !== undefined) team.nickname = nickname || null;
    if (visibility !== undefined) team.visibility = visibility; // Handle visibility update
    
    // Save changes
    await team.save();
    
    log.info(`TEAMROUTES/CORE (PATCH /:id): Successfully updated team ${id}`);
    
    return sendSafeJson(res, {
      success: true,
      team
    });
  })
);

/**
 * DELETE /api/teams/:id
 * Deletes a team
 */
router.delete('/:id',
  requireAuth,
  validate(schemas.team.teamIdParam),
  catchAsync(async (req, res) => {
    const { id } = req.params;
    log.info(`TEAMROUTES/CORE (DELETE /:id): Attempting to delete team with ID: ${id} by user: ${req.user.email}`);
    
    // Start a transaction for atomicity
    const t = await sequelize.transaction();
    
    try {
      // 1. Find the team
      const team = await Team.findByPk(id, { transaction: t });
      
      if (!team) {
        await t.rollback();
        log.warn(`TEAMROUTES/CORE (DELETE /:id): Team with ID ${id} not found`);
        throw new ApiError('Team not found', 404, 'RESOURCE_NOT_FOUND');
      }
      
      // 2. Check ownership - only creator or managers can delete
      const userTeam = await UserTeam.findOne({
        where: {
          teamId: id,
          userId: req.user.userId,
          role: 'manager'
        },
        transaction: t
      });
      
      if (team.creatorId !== req.user.userId && !userTeam) {
        await t.rollback();
        log.warn(`TEAMROUTES/CORE (DELETE /:id): User ${req.user.email} (${req.user.userId}) attempted to delete team ${id} without permission`);
        throw new ApiError('You do not have permission to delete this team', 403, 'FORBIDDEN');
      }
      
      // 3. Delete all associated records (in correct order to avoid FK constraints)
      
      // 3.1 Delete formation records
      const Formation = require('../../models/Formation');
      await Formation.destroy({
        where: { teamId: id },
        transaction: t
      });
      log.info(`TEAMROUTES/CORE (DELETE /:id): Deleted formations for team ${id}`);
      
      // 3.2 Delete team members
      await UserTeam.destroy({
        where: { teamId: id },
        transaction: t
      });
      log.info(`TEAMROUTES/CORE (DELETE /:id): Deleted team memberships for team ${id}`);
      
      // 3.3 Finally delete the team itself
      await team.destroy({ transaction: t });
      log.info(`TEAMROUTES/CORE (DELETE /:id): Successfully deleted team ${id}`);
      
      // 4. Commit the transaction
      await t.commit();
      
      return res.status(200).json({
        success: true,
        message: 'Team deleted successfully'
      });
    } catch (error) {
      // Rollback the transaction on error
      await t.rollback();
      log.error(`TEAMROUTES/CORE (DELETE /:id): Error deleting team ${id}:`, error);
      throw error; // Let the error handler take care of formatting the response
    }
  })
);

/**
 * GET /api/teams/:id/join-requests
 * Get join requests for a team
 */
router.get('/:id/join-requests',
  requireAuth,
  validate([
    param('id').isInt().withMessage('Team ID must be an integer')
  ]),
  catchAsync(async (req, res) => {
    const { id: teamId } = req.params;
    log.info(`TEAMROUTES/CORE (GET /:id/join-requests): Fetching join requests for team ${teamId}`);
    
    // Check if user is a team manager
    const userTeam = await UserTeam.findOne({
      where: {
        userId: req.user.userId,
        teamId,
        role: { [Op.in]: ['manager', 'assistant_manager'] }
      }
    });
    
    if (!userTeam) {
      throw new ApiError('Only team managers can view join requests', 403, 'FORBIDDEN');
    }
    
    try {
      // Get join request notifications for this team
      const Notification = require('../../models/Notification');
      
      const requests = await Notification.findAll({
        where: {
          teamId,
          type: 'join_request',
          status: { [Op.in]: ['unread', 'read'] }
        },
        order: [['createdAt', 'DESC']]
      });
      
      const requestsWithUserData = [];
      
      for (const request of requests) {
        try {
          const user = await User.findByPk(request.senderUserId, {
            attributes: ['id', 'firstName', 'lastName', 'email', 'profileImageUrl']
          });
          
          requestsWithUserData.push({
            id: request.id,
            senderName: user ? `${user.firstName} ${user.lastName}`.trim() : 'Unknown User',
            senderEmail: user ? user.email : '',
            senderAvatarUrl: user ? user.profileImageUrl : null,
            message: request.message,
            createdAt: request.createdAt,
            metadata: request.metadata || {},
            status: request.status,
            senderUserId: request.senderUserId
          });
        } catch (userError) {
          log.error(`Error fetching user ${request.senderUserId} for request ${request.id}:`, userError);
          requestsWithUserData.push({
            id: request.id,
            senderName: 'Unknown User',
            senderEmail: '',
            senderAvatarUrl: null,
            message: request.message,
            createdAt: request.createdAt,
            metadata: request.metadata || {},
            status: request.status,
            senderUserId: request.senderUserId
          });
        }
      }
      
      log.info(`Found ${requestsWithUserData.length} join requests for team ${teamId}`);
      
      return sendSafeJson(res, {
        success: true,
        requests: requestsWithUserData
      });
      
    } catch (error) {
      log.error(`Error fetching join requests for team ${teamId}:`, error);
      throw new ApiError('Failed to fetch join requests', 500, 'INTERNAL_SERVER_ERROR');
    }
  })
);

/**
 * POST /api/teams/join-requests/:requestId/accept
 * Accept a team join request
 */
router.post('/join-requests/:requestId/accept',
  requireAuth,
  validate([
    param('requestId').isInt().withMessage('Request ID must be an integer')
  ]),
  catchAsync(async (req, res) => {
    const { requestId } = req.params;
    const userId = req.user.userId;
    
    log.info(`Accepting join request ${requestId} by user ${userId}`);
    
    const t = await sequelize.transaction();
    
    try {
      const Notification = require('../../models/Notification');
      const Player = require('../../models/Player');
      
      // Get the notification
      const notification = await Notification.findByPk(requestId, { transaction: t });
      
      if (!notification || notification.type !== 'join_request') {
        await t.rollback();
        throw new ApiError('Join request not found', 404, 'RESOURCE_NOT_FOUND');
      }
      
      // Check if user is a manager of the team
      const userTeam = await UserTeam.findOne({
        where: {
          userId,
          teamId: notification.teamId,
          role: { [Op.in]: ['manager', 'assistant_manager'] }
        },
        transaction: t
      });
      
      if (!userTeam) {
        await t.rollback();
        throw new ApiError('Only team managers can accept join requests', 403, 'FORBIDDEN');
      }
      
      // Check if the requester is already a member
      const existingMembership = await UserTeam.findOne({
        where: {
          userId: notification.senderUserId,
          teamId: notification.teamId
        },
        transaction: t
      });
      
      if (existingMembership) {
        await t.rollback();
        throw new ApiError('User is already a member of this team', 409, 'ALREADY_MEMBER');
      }
      
      // Add user to team as athlete
      await UserTeam.create({
        userId: notification.senderUserId,
        teamId: notification.teamId,
        role: 'athlete',
        status: 'active',
        joinedAt: new Date()
      }, { transaction: t });
      
      // Create player profile if metadata contains player data
      if (notification.metadata && notification.metadata.playerData) {
        try {
          const existingPlayer = await Player.findOne({
            where: { userId: notification.senderUserId },
            transaction: t
          });
          
          if (!existingPlayer) {
            const playerData = notification.metadata.playerData;
            await Player.create({
              userId: notification.senderUserId,
              teamId: notification.teamId,
              position: playerData.position || 'SUB',
              height: playerData.height || null,
              weight: playerData.weight || null,
              preferredFoot: playerData.preferredFoot || null,
              jerseyNumber: playerData.jerseyNumber || null
            }, { transaction: t });
            
            log.info(`Created player profile for user ${notification.senderUserId}`);
          }
        } catch (playerError) {
          log.error('Error creating player profile:', playerError);
          // Continue even if player creation fails
        }
      }
      
      // Archive the original notification
      await notification.update({
        status: 'archived'
      }, { transaction: t });
      
      // Create acceptance notification for the requester
      await Notification.create({
        recipientUserId: notification.senderUserId,
        senderUserId: userId,
        teamId: notification.teamId,
        type: 'join_request_accepted',
        message: `Your request to join the team has been accepted!`,
        status: 'unread'
      }, { transaction: t });
      
      await t.commit();
      
      log.info(`Successfully accepted join request ${requestId}`);
      
      return sendSafeJson(res, {
        success: true,
        message: 'Join request accepted successfully'
      });
      
    } catch (error) {
      await t.rollback();
      log.error(`Error accepting join request ${requestId}:`, error);
      
      if (error instanceof ApiError) {
        throw error;
      }
      
      throw new ApiError('Failed to accept join request', 500, 'INTERNAL_SERVER_ERROR');
    }
  })
);

/**
 * POST /api/teams/join-requests/:requestId/reject
 * Reject a team join request
 */
router.post('/join-requests/:requestId/reject',
  requireAuth,
  validate([
    param('requestId').isInt().withMessage('Request ID must be an integer'),
    body('reason').optional().isString().withMessage('Reason must be a string')
  ]),
  catchAsync(async (req, res) => {
    const { requestId } = req.params;
    const { reason = 'No reason provided' } = req.body;
    const userId = req.user.userId;
    
    log.info(`Rejecting join request ${requestId} by user ${userId}`);
    
    const t = await sequelize.transaction();
    
    try {
      const Notification = require('../../models/Notification');
      
      // Get the notification
      const notification = await Notification.findByPk(requestId, { transaction: t });
      
      if (!notification || notification.type !== 'join_request') {
        throw new ApiError('Join request not found', 404, 'RESOURCE_NOT_FOUND');
      }
      
      // Check if user is a manager of the team
      const userTeam = await UserTeam.findOne({
        where: {
          userId,
          teamId: notification.teamId,
          role: { [Op.in]: ['manager', 'assistant_manager'] }
        },
        transaction: t
      });
      
      if (!userTeam) {
        throw new ApiError('Only team managers can reject join requests', 403, 'FORBIDDEN');
      }
      
      // Archive the original notification
      await notification.update({
        status: 'archived'
      }, { transaction: t });
      
      // Create rejection notification for the requester
      await Notification.create({
        recipientUserId: notification.senderUserId,
        senderUserId: userId,
        teamId: notification.teamId,
        type: 'join_request_rejected',
        message: `Your request to join the team has been declined. Reason: ${reason}`,
        status: 'unread'
      }, { transaction: t });
      
      await t.commit();
      
      log.info(`Successfully rejected join request ${requestId}`);
      
      return sendSafeJson(res, {
        success: true,
        message: 'Join request rejected successfully'
      });
      
    } catch (error) {
      await t.rollback();
      log.error(`Error rejecting join request ${requestId}:`, error);
      throw error;
    }
  })
);

module.exports = router;
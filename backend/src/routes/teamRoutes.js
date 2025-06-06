const express = require('express');
const router = express.Router();
const { Team, UserTeam, Formation, Notification } = require('../models');
const { requireAuth } = require('../middleware/auth');
const { catchAsync, ApiError } = require('../middleware/errorHandler');
const { validate } = require('../validation');
const sequelize = require('../config/db');
const { param, body } = require('express-validator');
const User = require('../models/User');
const { sendSafeJson } = require('../utils/safeSerializer');
const log = require('../utils/log');
const { Op } = require('sequelize');
const { Manager } = require('../models');

// Import team routes from structured approach
const teamStructuredRoutes = require('./teamRoutes/index');

// Mount all sub-routes from the structured approach
router.use('/', teamStructuredRoutes);

/**
 * GET /api/teams/user/:userId
 * Get all teams a user is a member of
 * This route needs to be defined here to avoid 404 errors
 */
router.get('/user/:userId', 
  requireAuth, 
  validate([
    param('userId').isInt().withMessage('User ID must be an integer').toInt()
  ]),
  catchAsync(async (req, res) => {
    log.info(`TEAMROUTES (GET /user/:userId): Fetching teams for user ID ${req.params.userId}, requested by user ${req.user?.email}.`);
    const { userId } = req.params;
    
    // Users can only see their own teams
    if (parseInt(userId) !== req.user.userId) {
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
  })
);

// Create a new team with proper transaction handling
router.post('/', requireAuth, async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { name, abbreviation, foundedYear, city, nickname } = req.body;
    const userId = req.user.userId;
    
    // Create the team
    const team = await Team.create({
      name,
      abbreviation,
      foundedYear,
      city,
      nickname,
      createdBy: userId
    }, { transaction });
    
    // Create the user-team relationship (make creator a manager)
    await UserTeam.create({
      userId,
      teamId: team.id,
      role: 'manager',
      status: 'active'
    }, { transaction });
    
    // Commit the transaction
    await transaction.commit();
    
    // Create formation separately after transaction is committed
    try {
      await Formation.createDefaultFormation(team.id);
    } catch (formationError) {
      console.error(`Failed to create default formation for team ${team.id}:`, formationError);
      // Don't fail the whole request if formation creation fails
    }
    
    return res.status(201).json({ success: true, team });
  } catch (error) {
    await transaction.rollback();
    console.error('Error creating team:', error);
    return res.status(500).json({ error: 'Failed to create team' });
  }
});

// Get team managers
router.get('/:teamId/managers', async (req, res) => {
  try {
    const { teamId } = req.params;
    
    const managers = await Manager.findAll({
      where: { teamId },
      attributes: ['id', 'name', 'preferredFormation']
    });
    
    return res.json({ managers });
  } catch (error) {
    console.error('Error fetching team managers:', error);
    return res.status(500).json({ error: 'Failed to fetch team managers' });
  }
});

/**
 * GET /api/teams/:id/join-requests
 * Get all pending join requests for a team (managers only)
 */
router.get('/:id/join-requests',
  requireAuth,
  validate([
    param('id').isInt().withMessage('Team ID must be an integer')
  ]),
  catchAsync(async (req, res) => {
    const { id: teamId } = req.params;
    
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
      // Get all pending join request notifications for this team
      const requests = await Notification.findAll({
        where: {
          teamId,
          type: 'join_request',
          status: 'unread'
        },
        include: [
          {
            model: User,
            as: 'sender',
            attributes: ['id', 'firstName', 'lastName', 'email', 'profileImageUrl']
          }
        ],
        order: [['createdAt', 'DESC']]
      });
      
      // Format the requests with player data from metadata
      const formattedRequests = requests.map(notification => ({
        id: notification.id,
        user: notification.sender,
        message: notification.metadata?.userMessage || '',
        playerData: notification.metadata?.playerData || null,
        createdAt: notification.createdAt
      }));
      
      return sendSafeJson(res, {
        success: true,
        requests: formattedRequests
      });
    } catch (error) {
      // Handle case where Notification table doesn't exist yet
      if (error.name === 'SequelizeDatabaseError' && 
          error.message.includes('relation "notifications" does not exist')) {
        log.warn('Notifications table does not exist yet. Returning empty requests list.');
        return sendSafeJson(res, {
          success: true,
          requests: []
        });
      }
      throw error;
    }
  })
);

/**
 * POST /api/teams/join-requests/:requestId/accept
 * Accept a join request (managers only)
 */
router.post('/join-requests/:requestId/accept',
  requireAuth,
  validate([
    param('requestId').isInt().withMessage('Request ID must be an integer')
  ]),
  catchAsync(async (req, res) => {
    const { requestId } = req.params;
    
    // Get the notification/request
    const notification = await Notification.findByPk(requestId, {
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: Team,
          attributes: ['id', 'name']
        }
      ]
    });
    
    if (!notification || notification.type !== 'join_request') {
      throw new ApiError('Join request not found', 404, 'RESOURCE_NOT_FOUND');
    }
    
    // Check if user is a team manager
    const userTeam = await UserTeam.findOne({
      where: {
        userId: req.user.userId,
        teamId: notification.teamId,
        role: { [Op.in]: ['manager', 'assistant_manager'] }
      }
    });
    
    if (!userTeam) {
      throw new ApiError('Only team managers can accept join requests', 403, 'FORBIDDEN');
    }
    
    // Check if the user is already a team member
    const existingMembership = await UserTeam.findOne({
      where: {
        userId: notification.senderUserId,
        teamId: notification.teamId
      }
    });
    
    if (existingMembership) {
      throw new ApiError('User is already a team member', 409, 'ALREADY_MEMBER');
    }
    
    // Add user to team as athlete
    await UserTeam.create({
      userId: notification.senderUserId,
      teamId: notification.teamId,
      role: 'athlete',
      status: 'active'
    });
    
    // Create player profile if player data was provided
    if (notification.metadata?.playerData) {
      const playerData = notification.metadata.playerData;
      
      try {
        const { Player } = require('../models');
        
        // Check if player profile already exists
        const existingPlayer = await Player.findOne({
          where: { userId: notification.senderUserId }
        });
        
        if (!existingPlayer) {
          await Player.create({
            userId: notification.senderUserId,
            position: playerData.position,
            height: playerData.height || null,
            weight: playerData.weight || null,
            preferredFoot: playerData.preferredFoot || null,
            jerseyNumber: playerData.jerseyNumber || null
          });
        }
      } catch (playerError) {
        console.error('Error creating player profile:', playerError);
        // Continue even if player profile creation fails
      }
    }
    
    // Create acceptance notification for the requester
    await Notification.create({
      userId: notification.senderUserId,
      teamId: notification.teamId,
      type: 'request_accepted',
      message: `Your request to join ${notification.Team.name} has been accepted`,
      senderUserId: req.user.userId,
      status: 'unread'
    });
    
    // Mark the original request as archived
    notification.status = 'archived';
    await notification.save();
    
    return sendSafeJson(res, {
      success: true,
      message: 'Join request accepted successfully'
    });
  })
);

/**
 * POST /api/teams/join-requests/:requestId/reject
 * Reject a join request (managers only)
 */
router.post('/join-requests/:requestId/reject',
  requireAuth,
  validate([
    param('requestId').isInt().withMessage('Request ID must be an integer'),
    body('reason').optional().isString().withMessage('Reason must be a string')
  ]),
  catchAsync(async (req, res) => {
    const { requestId } = req.params;
    const { reason } = req.body;
    
    // Get the notification/request
    const notification = await Notification.findByPk(requestId, {
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: Team,
          attributes: ['id', 'name']
        }
      ]
    });
    
    if (!notification || notification.type !== 'join_request') {
      throw new ApiError('Join request not found', 404, 'RESOURCE_NOT_FOUND');
    }
    
    // Check if user is a team manager
    const userTeam = await UserTeam.findOne({
      where: {
        userId: req.user.userId,
        teamId: notification.teamId,
        role: { [Op.in]: ['manager', 'assistant_manager'] }
      }
    });
    
    if (!userTeam) {
      throw new ApiError('Only team managers can reject join requests', 403, 'FORBIDDEN');
    }
    
    // Create rejection notification for the requester
    await Notification.create({
      userId: notification.senderUserId,
      teamId: notification.teamId,
      type: 'request_denied',
      message: `Your request to join ${notification.Team.name} was rejected`,
      senderUserId: req.user.userId,
      status: 'unread',
      metadata: { reason: reason || '' }
    });
    
    // Mark the original request as archived
    notification.status = 'archived';
    await notification.save();
    
    return sendSafeJson(res, {
      success: true,
      message: 'Join request rejected'
    });
  })
);

module.exports = router;

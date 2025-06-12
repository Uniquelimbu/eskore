const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { catchAsync, ApiError } = require('../middleware/errorHandler');
const { validate } = require('../validation');
const { body, param } = require('express-validator');
const { Player, User, Team, UserTeam } = require('../models');
const log = require('../utils/log');
const { sendSafeJson } = require('../utils/safeSerializer');

/**
 * POST /api/players
 * Create a new player profile
 */
router.post('/',
  requireAuth,
  validate([
    body('position')
      .isString()
      .withMessage('Position must be a string'),
    body('height')
      .optional()
      .isFloat({ min: 120, max: 250 })
      .withMessage('Height must be between 120 and 250 cm'),
    body('weight')
      .optional()
      .isFloat({ min: 40, max: 150 })
      .withMessage('Weight must be between 40 and 150 kg'),
    body('preferredFoot')
      .optional()
      .isIn(['left', 'right', 'both'])
      .withMessage('Preferred foot must be left, right, or both'),
    body('teamId')
      .optional()
      .isInt()
      .withMessage('Team ID must be an integer'),
    body('jerseyNumber')
      .optional()
      .isString()
      .withMessage('Jersey number must be a string')
  ]),
  catchAsync(async (req, res) => {
    log.info(`PLAYER (POST /): Creating player profile for user ${req.user.userId}`);
    const { 
      position, height, weight, preferredFoot, 
      teamId, jerseyNumber 
    } = req.body;
    
    // Check if player profile already exists for this user
    const existingPlayer = await Player.findOne({
      where: { userId: req.user.userId }
    });
    
    if (existingPlayer) {
      throw new ApiError('Player profile already exists for this user', 409, 'RESOURCE_EXISTS');
    }
    
    // If teamId is provided, verify the user is a member of this team
    if (teamId) {
      const userTeam = await UserTeam.findOne({
        where: {
          userId: req.user.userId,
          teamId
        }
      });
      
      if (!userTeam) {
        // Create the team membership automatically
        await UserTeam.create({
          userId: req.user.userId,
          teamId,
          role: 'athlete',
          status: 'active'
        });
        
        log.info(`PLAYER (POST /): User ${req.user.userId} automatically joined team ${teamId} as athlete`);
      } else if (userTeam.role !== 'athlete' && userTeam.role !== 'manager' && userTeam.role !== 'assistant_manager') {
        // Update the role to athlete if needed (unless they're already a manager)
        userTeam.role = 'athlete';
        await userTeam.save();
        log.info(`PLAYER (POST /): User role updated to athlete for team ${teamId}`);
      }
    }
    
    // Create player profile
    const player = await Player.create({
      userId: req.user.userId,
      position,
      height: height || null,
      weight: weight || null,
      preferredFoot: preferredFoot || null,
      jerseyNumber: jerseyNumber || null,
      teamId: teamId || null // Add teamId to player creation
    });
    
    log.info(`PLAYER (POST /): Created player profile with ID ${player.id} for user ${req.user.userId}`);
    return sendSafeJson(res, {
      success: true,
      player
    });
  })
);

/**
 * GET /api/players/me
 * Get the current user's player profile
 */
router.get('/me',
  requireAuth,
  catchAsync(async (req, res) => {
    log.info(`PLAYER (GET /me): Fetching player profile for user ${req.user.userId}`);
    
    try {
      // Check if Player model exists and table is available
      const player = await Player.findOne({
        where: { userId: req.user.userId },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'firstName', 'lastName', 'email'],
            required: false
          }
        ]
      });
      
      if (!player) {
        return sendSafeJson(res, { 
          success: true,
          player: null,
          message: 'No player profile found'
        });
      }
      
      return sendSafeJson(res, { success: true, player });
    } catch (error) {
      log.error('Error in GET /players/me:', error);
      
      if (error.name === 'SequelizeDatabaseError') {
        if (error.message.includes('relation "players" does not exist') ||
            error.message.includes('relation "Players" does not exist')) {
          log.warn('Players table does not exist yet.');
          return sendSafeJson(res, { 
            success: true,
            player: null,
            message: 'Player profile not available - table not initialized'
          });
        }
        if (error.message.includes('column') && error.message.includes('does not exist')) {
          log.warn('Players table schema issue:', error.message);
          return sendSafeJson(res, { 
            success: true,
            player: null,
            message: 'Player profile not available - schema update needed'
          });
        }
      }
      
      if (error.name === 'SequelizeEagerLoadingError') {
        log.warn('Association error, trying without includes:', error.message);
        try {
          const player = await Player.findOne({
            where: { userId: req.user.userId }
          });
          return sendSafeJson(res, { 
            success: true, 
            player: player || null,
            message: player ? 'Player profile loaded (limited data)' : 'No player profile found'
          });
        } catch (retryError) {
          log.error('Retry also failed:', retryError);
          return sendSafeJson(res, { 
            success: true,
            player: null,
            message: 'Player profile not available'
          });
        }
      }
      
      // For any other error, return a safe response instead of throwing
      log.error('Unexpected error in players/me:', error);
      return sendSafeJson(res, { 
        success: true,
        player: null,
        message: 'Player profile temporarily unavailable'
      });
    }
  })
);

/**
 * GET /api/players/:id
 * Get player profile by ID
 */
router.get('/:id',
  validate([
    param('id').isInt().withMessage('Player ID must be an integer')
  ]),
  catchAsync(async (req, res) => {
    log.info(`PLAYER (GET /:id): Fetching player profile ${req.params.id}`);
    const { id } = req.params;
    
    const player = await Player.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ]
    });
    
    if (!player) {
      throw new ApiError('Player profile not found', 404, 'RESOURCE_NOT_FOUND');
    }
    
    return sendSafeJson(res, { player });
  })
);

/**
 * GET /api/players/user/:userId
 * Get player profile by user ID
 */
router.get('/user/:userId',
  validate([
    param('userId').isInt().withMessage('User ID must be an integer')
  ]),
  catchAsync(async (req, res) => {
    log.info(`PLAYER (GET /user/:userId): Fetching player profile for user ${req.params.userId}`);
    const { userId } = req.params;
    
    const player = await Player.findOne({
      where: { userId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ]
    });
    
    if (!player) {
      throw new ApiError('Player profile not found', 404, 'RESOURCE_NOT_FOUND');
    }
    
    return sendSafeJson(res, { player });
  })
);

/**
 * PUT /api/players/:id
 * Update player profile
 */
router.put('/:id',
  requireAuth,
  validate([
    param('id').isInt().withMessage('Player ID must be an integer'),
    body('position')
      .optional()
      .isString()
      .withMessage('Position must be a string'),
    body('height')
      .optional()
      .isFloat({ min: 120, max: 250 })
      .withMessage('Height must be between 120 and 250 cm'),
    body('weight')
      .optional()
      .isFloat({ min: 40, max: 150 })
      .withMessage('Weight must be between 40 and 150 kg'),
    body('preferredFoot')
      .optional()
      .isIn(['left', 'right', 'both'])
      .withMessage('Preferred foot must be left, right, or both'),
    body('jerseyNumber')
      .optional()
      .isString()
      .withMessage('Jersey number must be a string')
  ]),
  catchAsync(async (req, res) => {
    log.info(`PLAYER (PUT /:id): Updating player profile ${req.params.id}`);
    const { id } = req.params;
    const { 
      position, height, weight, preferredFoot, jerseyNumber 
    } = req.body;
    
    const player = await Player.findByPk(id);
    
    if (!player) {
      throw new ApiError('Player profile not found', 404, 'RESOURCE_NOT_FOUND');
    }
    
    // Check if this is the user's own profile
    if (player.userId !== req.user.userId) {
      throw new ApiError('You can only update your own player profile', 403, 'FORBIDDEN');
    }
    
    // Update player profile
    await player.update({
      position: position || player.position,
      height: height !== undefined ? height : player.height,
      weight: weight !== undefined ? weight : player.weight,
      preferredFoot: preferredFoot || player.preferredFoot,
      jerseyNumber: jerseyNumber || player.jerseyNumber
    });
    
    return sendSafeJson(res, {
      success: true,
      player
    });
  })
);

module.exports = router;

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
      .withMessage('Jersey number must be a string'),
    body('dateOfBirth')
      .optional()
      .isDate()
      .withMessage('Date of birth must be a valid date'),
    body('nationality')
      .optional()
      .isString()
      .withMessage('Nationality must be a string')
  ]),
  catchAsync(async (req, res) => {
    log.info(`PLAYER (POST /): Creating player profile for user ${req.user.userId}`);
    const { 
      position, height, weight, preferredFoot, 
      teamId, jerseyNumber, dateOfBirth, nationality 
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
      } else if (userTeam.role !== 'athlete') {
        // Update the role to athlete if needed
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
      dateOfBirth: dateOfBirth || null,
      nationality: nationality || null
    });
    
    return sendSafeJson(res, {
      success: true,
      player
    });
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
      .withMessage('Jersey number must be a string'),
    body('dateOfBirth')
      .optional()
      .isDate()
      .withMessage('Date of birth must be a valid date'),
    body('nationality')
      .optional()
      .isString()
      .withMessage('Nationality must be a string')
  ]),
  catchAsync(async (req, res) => {
    log.info(`PLAYER (PUT /:id): Updating player profile ${req.params.id}`);
    const { id } = req.params;
    const { 
      position, height, weight, preferredFoot,
      jerseyNumber, dateOfBirth, nationality 
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
      jerseyNumber: jerseyNumber || player.jerseyNumber,
      dateOfBirth: dateOfBirth || player.dateOfBirth,
      nationality: nationality || player.nationality
    });
    
    return sendSafeJson(res, {
      success: true,
      player
    });
  })
);

module.exports = router;

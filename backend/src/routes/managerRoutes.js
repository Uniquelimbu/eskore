const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { catchAsync, ApiError } = require('../middleware/errorHandler');
const { validate } = require('../validation');
const { body, param } = require('express-validator');
const { Manager, User, Team } = require('../models');
const log = require('../utils/log');
const { sendSafeJson } = require('../utils/safeSerializer');

/**
 * POST /api/managers
 * Create a new manager profile
 */
router.post('/',
  requireAuth,
  validate([
    body('playingStyle')
      .isIn(['possession', 'counter-attack', 'high-press', 'defensive', 'balanced'])
      .withMessage('Playing style must be valid'),
    body('preferredFormation')
      .isString()
      .withMessage('Preferred formation must be a string'),
    body('experience')
      .optional()
      .isInt({ min: 0, max: 50 })
      .withMessage('Experience must be between 0 and 50 years'),
    body('teamId')
      .optional()
      .isInt()
      .withMessage('Team ID must be an integer')
  ]),
  catchAsync(async (req, res) => {
    log.info(`MANAGER (POST /): Creating manager profile for user ${req.user.userId}`);
    const { playingStyle, preferredFormation, experience, teamId } = req.body;
    
    // Check if manager profile already exists for this user
    const existingManager = await Manager.findOne({
      where: { userId: req.user.userId }
    });
    
    if (existingManager) {
      throw new ApiError('Manager profile already exists for this user', 409, 'RESOURCE_EXISTS');
    }
    
    // If teamId is provided, verify the user is a manager of this team
    if (teamId) {
      const userTeam = await UserTeam.findOne({
        where: {
          userId: req.user.userId,
          teamId,
          role: 'manager'
        }
      });
      
      if (!userTeam) {
        throw new ApiError('You are not a manager of this team', 403, 'FORBIDDEN');
      }
    }
    
    // Create manager profile
    const manager = await Manager.create({
      userId: req.user.userId,
      teamId: teamId || null,
      playingStyle,
      preferredFormation,
      experience: experience || null
    });
    
    return sendSafeJson(res, {
      success: true,
      manager
    });
  })
);

/**
 * GET /api/managers/:id
 * Get manager profile by ID
 */
router.get('/:id',
  validate([
    param('id').isInt().withMessage('Manager ID must be an integer')
  ]),
  catchAsync(async (req, res) => {
    log.info(`MANAGER (GET /:id): Fetching manager profile ${req.params.id}`);
    const { id } = req.params;
    
    const manager = await Manager.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: Team,
          as: 'team',
          attributes: ['id', 'name', 'abbreviation', 'logoUrl']
        }
      ]
    });
    
    if (!manager) {
      throw new ApiError('Manager profile not found', 404, 'RESOURCE_NOT_FOUND');
    }
    
    return sendSafeJson(res, { manager });
  })
);

/**
 * GET /api/managers/user/:userId
 * Get manager profile by user ID
 */
router.get('/user/:userId',
  validate([
    param('userId').isInt().withMessage('User ID must be an integer')
  ]),
  catchAsync(async (req, res) => {
    log.info(`MANAGER (GET /user/:userId): Fetching manager profile for user ${req.params.userId}`);
    const { userId } = req.params;
    
    const manager = await Manager.findOne({
      where: { userId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: Team,
          as: 'team',
          attributes: ['id', 'name', 'abbreviation', 'logoUrl']
        }
      ]
    });
    
    if (!manager) {
      throw new ApiError('Manager profile not found', 404, 'RESOURCE_NOT_FOUND');
    }
    
    return sendSafeJson(res, { manager });
  })
);

/**
 * PUT /api/managers/:id
 * Update manager profile
 */
router.put('/:id',
  requireAuth,
  validate([
    param('id').isInt().withMessage('Manager ID must be an integer'),
    body('playingStyle')
      .optional()
      .isIn(['possession', 'counter-attack', 'high-press', 'defensive', 'balanced'])
      .withMessage('Playing style must be valid'),
    body('preferredFormation')
      .optional()
      .isString()
      .withMessage('Preferred formation must be a string'),
    body('experience')
      .optional()
      .isInt({ min: 0, max: 50 })
      .withMessage('Experience must be between 0 and 50 years')
  ]),
  catchAsync(async (req, res) => {
    log.info(`MANAGER (PUT /:id): Updating manager profile ${req.params.id}`);
    const { id } = req.params;
    const { playingStyle, preferredFormation, experience } = req.body;
    
    const manager = await Manager.findByPk(id);
    
    if (!manager) {
      throw new ApiError('Manager profile not found', 404, 'RESOURCE_NOT_FOUND');
    }
    
    // Check if this is the user's own profile
    if (manager.userId !== req.user.userId) {
      throw new ApiError('You can only update your own manager profile', 403, 'FORBIDDEN');
    }
    
    // Update manager profile
    await manager.update({
      playingStyle: playingStyle || manager.playingStyle,
      preferredFormation: preferredFormation || manager.preferredFormation,
      experience: experience !== undefined ? experience : manager.experience
    });
    
    return sendSafeJson(res, {
      success: true,
      manager
    });
  })
);

module.exports = router;

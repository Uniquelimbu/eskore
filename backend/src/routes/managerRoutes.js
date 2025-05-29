const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { catchAsync, ApiError } = require('../middleware/errorHandler');
const { validate } = require('../validation'); // Add missing import for validate function
const { body, param } = require('express-validator'); // Add missing import for express-validator
const Manager = require('../models/Manager');
const User = require('../models/User');
const Team = require('../models/Team');
const UserTeam = require('../models/UserTeam');
const log = require('../utils/log');
const { sendSafeJson } = require('../utils/safeSerializer');
const sequelize = require('../config/db');
const { Op } = require('sequelize');

/**
 * POST /api/managers
 * Create a new manager profile
 */
router.post('/',
  requireAuth,
  validate([
    body('playingStyle')
      .notEmpty().withMessage('Playing style is required')
      .isIn(['possession', 'counter-attack', 'high-press', 'defensive', 'balanced'])
      .withMessage('Playing style must be valid'),
    body('preferredFormation')
      .notEmpty().withMessage('Preferred formation is required')
      .isIn(['4-3-3', '4-4-2', '3-5-2', '3-4-3', '4-2-3-1', '4-1-4-1', '5-2-2-1', '4-1-2-1-2', '4-5-1', '4-2-2-2'])
      .withMessage('Preferred formation must be valid'),
    body('experience')
      .optional()
      .isInt({ min: 0, max: 50 })
      .withMessage('Experience must be between 0 and 50 years'),
    body('teamId')
      .notEmpty().withMessage('Team ID is required')
      .isInt().withMessage('Team ID must be an integer')
  ]),
  catchAsync(async (req, res) => {
    // Start transaction
    const t = await sequelize.transaction();

    try {
      // Log incoming request for debugging
      log.info('Manager POST request received:', { 
        user: req.user ? req.user.userId || req.user.id : 'unknown',
        body: req.body
      });
      
      // Extract data from request
      const { playingStyle, preferredFormation, teamId } = req.body;
      const userId = req.user ? req.user.userId || req.user.id : null;
      
      // Check if user is authenticated
      if (!userId) {
        await t.rollback();
        throw new ApiError('User not authenticated', 401, 'UNAUTHORIZED');
      }

      // Normalize experience to a number
      const experience = typeof req.body.experience === 'number' ? 
                        req.body.experience : 
                        (req.body.experience ? parseInt(req.body.experience, 10) || 0 : 0);
      
      // Verify team membership if teamId is provided
      if (teamId) {
        const userTeam = await UserTeam.findOne({
          where: { userId, teamId },
          transaction: t
        });
        
        if (!userTeam) {
          await t.rollback();
          throw new ApiError('You are not a member of this team', 403, 'FORBIDDEN');
        }
      }
      
      // Check for existing manager for this user
      const existingManager = await Manager.findOne({
        where: { userId },
        transaction: t
      });
      
      let manager;
      if (existingManager) {
        // Enhance logging to track the pattern
        log.info(`Found existing manager record ID ${existingManager.id} for user ${userId}`);
        
        try {
          // Update existing manager
          log.info(`Updating existing manager record for user ${userId}`);
          await existingManager.update({
            playingStyle: playingStyle || existingManager.playingStyle,
            preferredFormation: preferredFormation || existingManager.preferredFormation,
            experience,
            teamId: teamId || existingManager.teamId
          }, { transaction: t });
          
          manager = existingManager;
        } catch (updateError) {
          log.error(`Error updating manager record: ${updateError.message}`, updateError);
          throw updateError;
        }
      } else {
        // Create new manager
        log.info(`Creating new manager record for user ${userId}`);
        manager = await Manager.create({
          userId,
          teamId: teamId || null,
          playingStyle: playingStyle || 'balanced',
          preferredFormation: preferredFormation || '4-3-3',
          experience
        }, { transaction: t });
      }
      
      // Commit the transaction
      await t.commit();
      
      // Return the result
      return sendSafeJson(res, {
        success: true,
        manager
      });
    } catch (error) {
      // Rollback transaction on error
      await t.rollback();
      
      // Log the error
      log.error('Error in manager creation:', error);
      
      // Rethrow to be handled by error middleware
      throw error;
    }
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

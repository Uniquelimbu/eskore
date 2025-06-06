const express = require('express');
const router = express.Router();
const { Formation, UserTeam, Manager } = require('../models');
const { requireAuth } = require('../middleware/auth');
const { catchAsync, ApiError } = require('../middleware/errorHandler');
const { validate } = require('../validation');
const { param } = require('express-validator');
const log = require('../utils/log');
const sequelize = require('../config/db'); // Fixed: changed from '../config/sequelize' to '../config/db'
const { Op } = require('sequelize'); // Add Sequelize operators import

// Debug route for testing
router.get('/test', (req, res) => {
  log.info('Formation routes test endpoint hit');
  res.json({ message: 'Formation routes are working' });
});

/**
 * @swagger
 * tags:
 *   name: Formations
 *   description: Team formation management
 */

/**
 * @swagger
 * /api/formations/{teamId}:
 *   get:
 *     summary: Get a team's formation
 *     tags: [Formations]
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Team ID
 *     responses:
 *       200:
 *         description: Returns the team formation
 *       404:
 *         description: Formation not found
 */
router.get('/:teamId', 
  validate([
    param('teamId').isInt().withMessage('Team ID must be an integer').toInt()
  ]),
  catchAsync(async (req, res) => {
    const { teamId } = req.params;
    
    log.info(`GET formation for team ${teamId}`);
    
    try {
      // First check if the team exists
      const teamExists = await sequelize.models.Team.findByPk(teamId);
      
      if (!teamExists) {
        log.warn(`Team with ID ${teamId} does not exist in database`);
        // Return a default formation without trying to save it
        const defaultFormation = Formation.getDefaultFormationData();
        return res.json({
          teamId: parseInt(teamId),
          schema_json: defaultFormation,
          isDefault: true,
          notSaved: true,
          teamNotFound: true,
          message: "Team not found - showing default formation only" 
        });
      }
      
      let formation = await Formation.findOne({ 
        where: { teamId } 
      });
      
      // If no formation exists, create a default 4-3-3 formation
      if (!formation) {
        log.info(`No formation found for team ${teamId}, creating default 4-3-3 formation`);
        try {
          // Check if user is authenticated
          if (req.user && req.user.userId) {
            // Check if user is a team manager or has permission to create
            const userTeam = await UserTeam.findOne({
              where: {
                userId: req.user.userId,
                teamId,
                role: { [Op.in]: ['manager', 'assistant_manager'] } // Only managers and assistant managers can create default
              }
            });
            
            if (userTeam) {
              formation = await Formation.createDefaultFormation(teamId);
              log.info(`Created default 4-3-3 formation for team ${teamId}`);
            } else {
              // If user isn't a team member with sufficient permissions, still return the default formation data
              // but don't save it to database
              const defaultFormation = Formation.getDefaultFormationData();
              return res.json({
                teamId: parseInt(teamId),
                schema_json: defaultFormation,
                isDefault: true,
                notSaved: true
              });
            }
          } else {
            // For unauthenticated requests, return default formation without saving
            const defaultFormation = Formation.getDefaultFormationData();
            return res.json({
              teamId: parseInt(teamId),
              schema_json: defaultFormation,
              isDefault: true,
              notSaved: true
            });
          }
        } catch (error) {
          log.error(`Failed to create default formation for team ${teamId}:`, error);
          throw new ApiError('Failed to create default formation', 500, 'SERVER_ERROR');
        }
      }
      
      log.info(`Returning formation for team ${teamId}: ${JSON.stringify(formation ? { id: formation.id, teamId: formation.teamId } : 'null')}`);
      return res.json(formation);
    } catch (error) {
      log.error(`Error getting formation for team ${teamId}:`, error);
      throw error;
    }
  })
);

/**
 * @swagger
 * /api/formations/{teamId}:
 *   put:
 *     summary: Create or update a team's formation
 *     tags: [Formations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Team ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               schema_json:
 *                 type: object
 *     responses:
 *       200:
 *         description: Formation updated successfully
 *       201:
 *         description: Formation created successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - not a team manager
 */
router.put('/:teamId', 
  requireAuth,
  validate([
    param('teamId').isInt().withMessage('Team ID must be an integer').toInt()
  ]),
  catchAsync(async (req, res) => {
    const { teamId } = req.params;
    const { schema_json } = req.body;
    
    log.info(`PUT formation for team ${teamId} by user ${req.user?.userId}`);
    
    try {
      // Validate request body
      if (!schema_json) {
        log.warn(`PUT formation for team ${teamId}: Missing schema_json in request body`);
        throw new ApiError('Formation data (schema_json) is required', 400, 'BAD_REQUEST');
      }

      // Validate schema_json structure
      if (typeof schema_json !== 'object') {
        log.warn(`PUT formation for team ${teamId}: Invalid schema_json type - expected object, got ${typeof schema_json}`);
        throw new ApiError('Formation data must be a valid object', 400, 'BAD_REQUEST');
      }

      // First check if the team exists
      const teamExists = await sequelize.models.Team.findByPk(teamId);
      
      if (!teamExists) {
        log.warn(`PUT formation for team ${teamId}: Team does not exist in database`);
        throw new ApiError('Team not found', 404, 'NOT_FOUND');
      }

      // Check if user has permission (is a manager of this team)
      if (req.user && req.user.userId) {
        const userTeam = await UserTeam.findOne({
          where: {
            userId: req.user.userId,
            teamId,
            role: { [Op.in]: ['manager', 'assistant_manager'] } // Only managers and assistant managers can save formations
          }
        });
        
        if (!userTeam) {
          log.warn(`PUT formation for team ${teamId}: User ${req.user.userId} attempted to update formation but lacks sufficient permissions (current role in team: ${userTeam?.role || 'none'})`);
          throw new ApiError('Insufficient permissions: Only team managers and assistant managers can update formations', 403, 'FORBIDDEN');
        }
        
        log.info(`PUT formation for team ${teamId}: User ${req.user.userId} has role '${userTeam.role}' - permission granted`);
      } else {
        log.error(`PUT formation for team ${teamId}: No user information found in request - authentication middleware may have failed`);
        throw new ApiError('Authentication required', 401, 'UNAUTHORIZED');
      }

      // Add timestamp and validation to the schema_json
      const enrichedSchemaJson = {
        ...schema_json,
        updated_at: new Date().toISOString(),
        saved_by_user_id: req.user.userId
      };

      // Validate essential formation data
      if (!enrichedSchemaJson.preset) {
        log.warn(`PUT formation for team ${teamId}: Missing 'preset' in formation data`);
        throw new ApiError('Formation preset is required', 400, 'BAD_REQUEST');
      }

      if (!Array.isArray(enrichedSchemaJson.starters)) {
        log.warn(`PUT formation for team ${teamId}: Invalid 'starters' data - expected array`);
        throw new ApiError('Formation starters must be an array', 400, 'BAD_REQUEST');
      }

      if (!Array.isArray(enrichedSchemaJson.subs)) {
        log.warn(`PUT formation for team ${teamId}: Invalid 'subs' data - expected array`);
        throw new ApiError('Formation subs must be an array', 400, 'BAD_REQUEST');
      }

      // Check if formation exists
      let formation = await Formation.findOne({ where: { teamId } });
      let statusCode = 200;
      let isNewFormation = false;
      
      if (formation) {
        // Update existing formation
        log.info(`PUT formation for team ${teamId}: Updating existing formation (ID: ${formation.id})`);
        formation.schema_json = enrichedSchemaJson;
        await formation.save();
        log.info(`PUT formation for team ${teamId}: Successfully updated formation`);
      } else {
        // Create new formation
        log.info(`PUT formation for team ${teamId}: Creating new formation`);
        formation = await Formation.create({
          teamId,
          schema_json: enrichedSchemaJson
        });
        statusCode = 201;
        isNewFormation = true;
        log.info(`PUT formation for team ${teamId}: Successfully created new formation (ID: ${formation.id})`);
      }
      
      // Return success response with additional metadata
      const response = {
        ...formation.toJSON(),
        success: true,
        operation: isNewFormation ? 'created' : 'updated',
        timestamp: new Date().toISOString()
      };
      
      log.info(`PUT formation for team ${teamId}: Operation completed successfully - ${isNewFormation ? 'created' : 'updated'} formation`);
      return res.status(statusCode).json(response);
      
    } catch (error) {
      log.error(`PUT formation for team ${teamId}: Error occurred:`, {
        error: error.message,
        stack: error.stack,
        userId: req.user?.userId,
        errorType: error.constructor.name
      });
      
      // If it's already an ApiError, just throw it
      if (error instanceof ApiError) {
        throw error;
      }
      
      // Handle specific database errors
      if (error.name === 'SequelizeValidationError') {
        throw new ApiError('Formation data validation failed: ' + error.message, 400, 'VALIDATION_ERROR');
      }
      
      if (error.name === 'SequelizeDatabaseError') {
        log.error(`PUT formation for team ${teamId}: Database error:`, error);
        throw new ApiError('Database error occurred while saving formation', 500, 'DATABASE_ERROR');
      }
      
      // Generic error fallback
      throw new ApiError('Failed to save formation: ' + (error.message || 'Unknown error'), 500, 'SERVER_ERROR');
    }
  })
);

// Create a new formation for a team
router.post('/', async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { teamId, name, matchId } = req.body;
    
    // Verify the team exists first
    const teamExists = await sequelize.models.Team.findByPk(teamId, { transaction });
    
    if (!teamExists) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Team not found' });
    }
    
    // Find manager's preferred formation to use as template
    const manager = await Manager.findOne({ 
      where: { teamId },
      attributes: ['preferredFormation'],
      transaction
    });
    
    // Default formation preset if no manager preference exists
    let formationData = {
      preset: "4-4-2",
      positions: [] // Default positions will be set based on preset
    };
    
    // Use manager's preferred formation if available
    if (manager && manager.preferredFormation) {
      formationData = {
        preset: manager.preferredFormation.preset || "4-4-2",
        positions: manager.preferredFormation.positions || []
      };
    }
    
    // Create the new formation
    const formation = await Formation.create({
      teamId,
      name: name || `Formation for ${new Date().toLocaleDateString()}`,
      matchId: matchId || null,
      formationData
    }, { transaction });
    
    await transaction.commit();
    return res.status(201).json({ formation });
  } catch (error) {
    await transaction.rollback();
    console.error('Error creating formation:', error);
    return res.status(500).json({ error: 'Failed to create formation' });
  }
});

// Update formation with player assignments
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { preset, positions } = req.body;
    
    const formation = await Formation.findByPk(id);
    
    if (!formation) {
      return res.status(404).json({ error: 'Formation not found' });
    }
    
    // Update formation data
    const updatedFormationData = {
      preset: preset || formation.formationData.preset,
      positions: positions || formation.formationData.positions
    };
    
    // If preset changed but we have existing players, remap players to new positions
    if (preset && preset !== formation.formationData.preset && formation.formationData.positions.some(pos => pos.playerId)) {
      updatedFormationData.positions = mapPlayersToPositions(
        formation.formationData.positions.filter(pos => pos.playerId),
        updatedFormationData.positions
      );
    }
    
    await formation.update({ formationData: updatedFormationData });
    
    return res.json({ formation });
  } catch (error) {
    console.error('Error updating formation:', error);
    return res.status(500).json({ error: 'Failed to update formation' });
  }
});

// Helper function to map players to new positions intelligently
function mapPlayersToPositions(existingPositions, newPositions) {
  // Create a copy of new positions
  const mappedPositions = JSON.parse(JSON.stringify(newPositions));
  
  // For each position with a player in the existing formation
  existingPositions.forEach(existingPos => {
    if (!existingPos.playerId) return;
    
    // Try to find the same position in new formation
    const samePosition = mappedPositions.find(p => 
      p.role === existingPos.role && !p.playerId
    );
    
    // If found, assign player to the same position
    if (samePosition) {
      samePosition.playerId = existingPos.playerId;
      samePosition.playerName = existingPos.playerName;
      return;
    }
    
    // If not found, find a similar position (same zone)
    const similarPosition = mappedPositions.find(p => 
      p.role.charAt(0) === existingPos.role.charAt(0) && !p.playerId
    );
    
    if (similarPosition) {
      similarPosition.playerId = existingPos.playerId;
      similarPosition.playerName = existingPos.playerName;
    }
  });
  
  return mappedPositions;
}

// Log that formation routes are loaded
log.info('Formation routes loaded successfully');

module.exports = router;

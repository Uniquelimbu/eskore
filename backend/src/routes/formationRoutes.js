const express = require('express');
const router = express.Router();
const { Formation, UserTeam } = require('../models');
const { requireAuth } = require('../middleware/auth');
const { catchAsync, ApiError } = require('../middleware/errorHandler');
const { validate } = require('../validation');
const { param } = require('express-validator');
const log = require('../utils/log');

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
      let formation = await Formation.findOne({ 
        where: { teamId } 
      });
      
      // If no formation exists, create a default 4-3-3 formation
      if (!formation) {
        log.info(`No formation found for team ${teamId}, creating default 4-3-3 formation`);
        try {
          formation = await Formation.createDefaultFormation(teamId);
          log.info(`Created default 4-3-3 formation for team ${teamId}`);
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
    
    log.info(`PUT formation for team ${teamId}`);
    
    try {
      // Check if user has permission (is a manager of this team)
      if (req.user && req.user.userId) {
        const userTeam = await UserTeam.findOne({
          where: {
            userId: req.user.userId,
            teamId,
            role: 'manager' // Only managers can update formations
          }
        });
        
        if (!userTeam) {
          log.warn(`User ${req.user.userId} attempted to update formation for team ${teamId} but is not a manager`);
          throw new ApiError('Only team managers can update formations', 403, 'FORBIDDEN');
        }
      } else {
        throw new ApiError('Authentication required', 401, 'UNAUTHORIZED');
      }

      // Check if formation exists
      let formation = await Formation.findOne({ where: { teamId } });
      let statusCode = 200;
      
      if (formation) {
        // Update existing formation
        formation.schema_json = schema_json;
        await formation.save();
        log.info(`Updated formation for team ${teamId}`);
      } else {
        // Create new formation
        formation = await Formation.create({
          teamId,
          schema_json
        });
        statusCode = 201;
        log.info(`Created new formation for team ${teamId}`);
      }
      
      return res.status(statusCode).json(formation);
    } catch (error) {
      log.error(`Error saving formation for team ${teamId}:`, error);
      throw error;
    }
  })
);

// Log that formation routes are loaded
log.info('Formation routes loaded successfully');

module.exports = router;

const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { catchAsync, ApiError } = require('../middleware/errorHandler');
const Formation = require('../models/Formation');
const Team = require('../models/Team');
const UserTeam = require('../models/UserTeam');

/**
 * @swagger
 * tags:
 *   name: Formations
 *   description: Team formation management
 */

// GET a team's formation
/**
 * @swagger
 * /api/formations/{teamId}:
 *   get:
 *     summary: Get a team's formation
 *     tags: [Formations]
 *     parameters:
 *       - in: path
 *         name: teamId
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the team
 *     responses:
 *       200:
 *         description: Formation data retrieved successfully
 *       404:
 *         description: Formation not found
 */
router.get('/:teamId', catchAsync(async (req, res) => {
  const { teamId } = req.params;
  
  // Check if the team exists
  const team = await Team.findByPk(teamId);
  if (!team) {
    throw new ApiError('Team not found', 404, 'TEAM_NOT_FOUND');
  }
  
  const formation = await Formation.findOne({
    where: { teamId }
  });
  
  // Instead of throwing a 404 when formation doesn't exist, return an empty default
  if (!formation) {
    return res.json({
      id: null,
      teamId,
      schema_json: {}
    });
  }

  return res.json(formation);
}));

// PUT (update or create) a team's formation
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
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the team
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
 *       403:
 *         description: Unauthorized - not a team manager
 */
router.put('/:teamId', requireAuth, catchAsync(async (req, res) => {
  const { teamId } = req.params;
  const { schema_json } = req.body;
  const userId = req.user.userId; // Changed from req.user.id to req.user.userId
  
  // Check if user is a manager of this team
  const userTeam = await UserTeam.findOne({
    where: {
      userId,
      teamId,
      role: ['manager', 'assistant_manager', 'coach'] // Allow managers, assistant managers and coaches
    }
  });
  
  if (!userTeam) {
    throw new ApiError('You must be a team manager, assistant manager, or coach to update formations', 403, 'FORBIDDEN');
  }
  
  // Check if team exists
  const team = await Team.findByPk(teamId);
  if (!team) {
    throw new ApiError('Team not found', 404, 'RESOURCE_NOT_FOUND');
  }
  
  // Find or create the formation
  const [formation, created] = await Formation.findOrCreate({
    where: { teamId },
    defaults: {
      schema_json
    }
  });
  
  // If formation exists, update it
  if (!created) {
    formation.schema_json = schema_json;
    await formation.save();
  }
  
  return res.status(created ? 201 : 200).json(formation);
}));

module.exports = router;

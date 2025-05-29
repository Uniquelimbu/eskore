const express = require('express');
const router = express.Router();
const { Team, UserTeam, Formation } = require('../models');
const { requireAuth } = require('../middleware/auth');
const { catchAsync, ApiError } = require('../middleware/errorHandler');
const { validate } = require('../validation');
const sequelize = require('../config/db');
const { param } = require('express-validator');
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

// Export the router so it can be imported in app.js
module.exports = router;

const express = require('express');
const router = express.Router();
const { requireAuth } = require('../../middleware/auth');
const { catchAsync, ApiError } = require('../../middleware/errorHandler');
const { validate, schemas } = require('../../validation');
const Team = require('../../models/Team');
const UserTeam = require('../../models/UserTeam');
const User = require('../../models/User');
const { sendSafeJson } = require('../../utils/safeSerializer');
const log = require('../../utils/log');
const sequelize = require('../../config/db');
const { Op } = require('sequelize');

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
    const { name, abbreviation, foundedYear, city, nickname } = req.body;
    
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
      // 1. Create the team with the extracted userId
      const team = await Team.create({
        name,
        abbreviation: abbreviation?.toUpperCase() || null,
        foundedYear: foundedYear || null,
        city: city || null,
        nickname: nickname || null,
        createdBy: userId, // Use the extracted userId
        creatorId: userId  // Make sure both fields are set
      }, { transaction: t });
      
      // 2. Associate the user with the team as manager
      await UserTeam.create({
        userId: userId, // Use the extracted userId
        teamId: team.id,
        role: 'manager'
      }, { transaction: t });
      
      // Commit the transaction
      await t.commit();
      
      log.info(`TEAMROUTES/CORE (POST /): Team created successfully. ID: ${team.id}, Name: ${team.name}, CreatorID: ${userId}`);
      
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
    // Implementation of team update
    // ...existing code...
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

module.exports = router;
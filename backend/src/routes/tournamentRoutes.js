const express = require('express');
const router = express.Router();
const { requireAuth, requireOrganizer } = require('../middleware/auth');
const { catchAsync, ApiError } = require('../middleware/errorHandler');
const { sendSafeJson } = require('../utils/safeSerializer');
const Tournament = require('../models/Tournament');
const User = require('../models/User');
const Team = require('../models/Team');
const UserTournament = require('../models/UserTournament');
const TeamTournament = require('../models/TeamTournament');
const { Op } = require('sequelize');
const { validate, schemas } = require('../validation');
const { body, param } = require('express-validator'); // Add this import
const db = require('../config/db');

// IMPORTANT: More specific routes first
/**
 * GET /api/tournaments/user/:userId
 * Get all tournaments a user is participating in
 */
router.get('/user/:userId', requireAuth, catchAsync(async (req, res) => {
  const { userId } = req.params;
  
  // Users can only see their own tournaments
  if (parseInt(userId) !== req.user.userId) { // Admin check removed
    throw new ApiError('Forbidden - You can only view your own tournaments', 403, 'FORBIDDEN');
  }
  
  const userTournaments = await UserTournament.findAll({
    where: { userId },
    include: [
      {
        model: Tournament,
        include: [
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'firstName', 'lastName']
          }
        ]
      }
    ]
  });
  
  const tournaments = userTournaments.map(ut => ({
    ...ut.Tournament.toJSON(),
    role: ut.role
  }));
  
  return sendSafeJson(res, { tournaments });
}));

// Regular routes below
/**
 * GET /api/tournaments
 * List all tournaments with optional filters
 */
router.get('/', catchAsync(async (req, res) => {
  const { status, search } = req.query;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  
  const where = {};
  
  // Add status filter if provided
  if (status && ['draft', 'registration', 'active', 'completed', 'cancelled'].includes(status)) {
    where.status = status;
  }
  
  // Add search filter if provided
  if (search) {
    where.name = { [Op.iLike]: `%${search}%` };
  }
  
  const { count, rows: tournaments } = await Tournament.findAndCountAll({
    where,
    limit,
    offset,
    include: [
      {
        model: User,
        as: 'creator',
        attributes: ['id', 'firstName', 'lastName']
      }
    ],
    order: [['createdAt', 'DESC']]
  });
  
  return sendSafeJson(res, {
    success: true,
    tournaments,
    pagination: {
      total: count,
      page,
      limit,
      pages: Math.ceil(count / limit)
    }
  });
}));

/**
 * GET /api/tournaments/:id
 * Get a single tournament by ID with details
 */
router.get('/:id', validate(schemas.tournament.tournamentIdParam), catchAsync(async (req, res) => {
  const { id } = req.params;
  
  const tournament = await Tournament.findByPk(id, {
    include: [
      {
        model: User,
        as: 'creator',
        attributes: ['id', 'firstName', 'lastName']
      },
      {
        model: User,
        through: { 
          model: UserTournament,
          attributes: ['role']
        },
        attributes: ['id', 'firstName', 'lastName']
      },
      {
        model: Team,
        through: {
          model: TeamTournament,
          attributes: ['status']
        },
        attributes: ['id', 'name', 'logoUrl']
      }
    ]
  });
  
  if (!tournament) {
    throw new ApiError('Tournament not found', 404, 'RESOURCE_NOT_FOUND');
  }
  
  return sendSafeJson(res, {
    success: true,
    tournament
  });
}));

/**
 * POST /api/tournaments
 * Create a new tournament
 * Requires authenticated user
 */
router.post('/', requireAuth, validate(schemas.tournament.createTournament), catchAsync(async (req, res) => {
  const { name, description, startDate, endDate, status = 'draft' } = req.body;
  
  if (!name) {
    throw new ApiError('Tournament name is required', 400, 'VALIDATION_ERROR');
  }
  
  const tournament = await Tournament.create({
    name,
    description,
    startDate,
    endDate,
    status,
    creatorId: req.user.userId
  });
  
  // Automatically add creator as an organizer
  await UserTournament.create({
    userId: req.user.userId,
    tournamentId: tournament.id,
    role: 'organizer'
  });
  
  return sendSafeJson(res, {
    success: true,
    tournament
  }, 201);
}));

/**
 * PUT /api/tournaments/:id
 * Update a tournament
 * Requires creator/organizer of the tournament
 */
router.put('/:id', validate(schemas.tournament.tournamentIdParam), requireAuth, validate(schemas.tournament.createTournament), catchAsync(async (req, res) => {
  const { id } = req.params;
  const { name, description, startDate, endDate, status } = req.body;
  
  const tournament = await Tournament.findByPk(id);
  
  if (!tournament) {
    throw new ApiError('Tournament not found', 404, 'RESOURCE_NOT_FOUND');
  }
  
  // Check if user has permission to update (creator, organizer)
  if (tournament.creatorId !== req.user.userId) { // Admin check removed
    const userTournament = await UserTournament.findOne({
      where: {
        userId: req.user.userId,
        tournamentId: id,
        role: 'organizer'
      }
    });
    
    if (!userTournament) {
      throw new ApiError('Forbidden - You must be a tournament creator or organizer to update it', 403, 'FORBIDDEN');
    }
  }
  
  // Update fields if provided
  if (name) tournament.name = name;
  if (description !== undefined) tournament.description = description;
  if (startDate) tournament.startDate = startDate;
  if (endDate) tournament.endDate = endDate;
  if (status && ['draft', 'registration', 'active', 'completed', 'cancelled'].includes(status)) {
    tournament.status = status;
  }
  
  await tournament.save();
  
  return sendSafeJson(res, {
    success: true,
    tournament
  });
}));

/**
 * DELETE /api/tournaments/:id
 * Delete a tournament
 * Requires creator of the tournament
 */
router.delete('/:id', validate(schemas.tournament.tournamentIdParam), requireAuth, catchAsync(async (req, res) => {
  const { id } = req.params;
  const t = await db.transaction(); // Start a transaction
  
  try {
    const tournament = await Tournament.findByPk(id, { transaction: t });
    
    if (!tournament) {
      await t.rollback();
      throw new ApiError('Tournament not found', 404, 'RESOURCE_NOT_FOUND');
    }
    
    // Check if user has permission to delete (creator)
    if (tournament.creatorId !== req.user.userId) { // Admin check removed
      await t.rollback();
      throw new ApiError('Forbidden - Only tournament creators can delete tournaments', 403, 'FORBIDDEN');
    }
    
    // Delete related records first (maintain referential integrity)
    await UserTournament.destroy({
      where: { tournamentId: id },
      transaction: t
    });
    
    await TeamTournament.destroy({
      where: { tournamentId: id },
      transaction: t
    });
    
    // Now delete the tournament
    await tournament.destroy({ transaction: t });
    
    // Commit the transaction
    await t.commit();
    
    return sendSafeJson(res, {
      success: true,
      message: 'Tournament deleted successfully'
    });
  } catch (error) {
    // Rollback transaction on error
    await t.rollback();
    throw error;
  }
}));

/**
 * POST /api/tournaments/:id/participants
 * Add a user participant to a tournament
 * Requires organizer role for the tournament
 */
router.post('/:id/participants', 
  validate(schemas.tournament.tournamentIdParam), 
  validate(schemas.tournament.participantBody), 
  requireAuth, 
  catchAsync(async (req, res) => {
  const { id } = req.params;
  const { userId, role = 'participant' } = req.body;
  
  // Check if the tournament exists first for better UX
  const tournament = await Tournament.findByPk(id);
  
  if (!tournament) {
    throw new ApiError('Tournament not found', 404, 'RESOURCE_NOT_FOUND');
  }
  
  // Check if user has permission to add participants (creator or organizer)
  let hasPermission = tournament.creatorId === req.user.userId; // Admin check removed
  
  if (!hasPermission) {
    const userTournament = await UserTournament.findOne({
      where: {
        userId: req.user.userId,
        tournamentId: id,
        role: 'organizer'
      }
    });
    
    if (!userTournament) {
      throw new ApiError('Forbidden - You must be a tournament organizer to add participants', 403, 'FORBIDDEN');
    }
  }
  
  // Check if user exists
  const user = await User.findByPk(userId);
  if (!user) {
    throw new ApiError('User not found', 404, 'USER_NOT_FOUND');
  }
  
  // Check if user is already in the tournament with any role
  const existingParticipant = await UserTournament.findOne({
    where: {
      userId,
      tournamentId: id
    }
  });
  
  if (existingParticipant) {
    // Just update the role if it's different
    if (existingParticipant.role !== role) {
      existingParticipant.role = role;
      await existingParticipant.save();
      return sendSafeJson(res, {
        success: true,
        participant: existingParticipant,
        message: 'Participant role updated successfully'
      });
    } else {
      throw new ApiError('User already has this role in the tournament', 409, 'ALREADY_EXISTS');
    }
  }
  
  // Add user to tournament
  const userTournament = await UserTournament.create({
    userId,
    tournamentId: id,
    role
  });
  
  return sendSafeJson(res, {
    success: true,
    participant: userTournament
  }, 201);
}));

/**
 * POST /api/tournaments/:id/teams
 * Add a team to a tournament
 * Requires organizer role for the tournament
 */
router.post('/:id/teams', requireAuth, validate([
  ...schemas.tournament.tournamentIdParam,
  body('teamId').isInt().withMessage('Team ID is required').toInt()
]), catchAsync(async (req, res) => {
  const { id } = req.params;
  const { teamId } = req.body;
  
  if (!teamId) {
    throw new ApiError('Team ID is required', 400, 'VALIDATION_ERROR');
  }
  
  const tournament = await Tournament.findByPk(id);
  
  if (!tournament) {
    throw new ApiError('Tournament not found', 404, 'RESOURCE_NOT_FOUND');
  }
  
  // Check if user has permission to add teams (creator or organizer)
  if (tournament.creatorId !== req.user.userId) { // Admin check removed
    const userTournament = await UserTournament.findOne({
      where: {
        userId: req.user.userId,
        tournamentId: id,
        role: 'organizer'
      }
    });
    
    if (!userTournament) {
      throw new ApiError('Forbidden - You must be a tournament organizer to add teams', 403, 'FORBIDDEN');
    }
  }
  
  // Check if team exists
  const team = await Team.findByPk(teamId);
  if (!team) {
    throw new ApiError('Team not found', 404, 'TEAM_NOT_FOUND');
  }
  
  // Check if team is already in the tournament
  const existingTeam = await TeamTournament.findOne({
    where: {
      teamId,
      tournamentId: id
    }
  });
  
  if (existingTeam) {
    throw new ApiError('Team already registered for this tournament', 409, 'ALREADY_EXISTS');
  }
  
  // Add team to tournament
  const teamTournament = await TeamTournament.create({
    teamId,
    tournamentId: id,
    status: 'registered'
  });
  
  return sendSafeJson(res, {
    success: true,
    teamRegistration: teamTournament
  }, 201);
}));

/**
 * DELETE /api/tournaments/:id/participants/:userId
 * Remove a user participant from a tournament
 * Requires organizer role for the tournament
 */
router.delete('/:id/participants/:userId', requireAuth, validate([
  ...schemas.tournament.tournamentIdParam,
  param('userId').isInt().withMessage('User ID must be an integer').toInt()
]), catchAsync(async (req, res) => {
  const { id, userId } = req.params;
  
  const tournament = await Tournament.findByPk(id);
  
  if (!tournament) {
    throw new ApiError('Tournament not found', 404, 'RESOURCE_NOT_FOUND');
  }
  
  // Check if user has permission to remove participants (organizer or admin)
  if (tournament.creatorId !== req.user.userId) { // Admin check removed
    const userTournament = await UserTournament.findOne({
      where: {
        userId: req.user.userId,
        tournamentId: id,
        role: 'organizer'
      }
    });
    
    if (!userTournament) {
      throw new ApiError('Forbidden - You must be a tournament organizer to remove participants', 403, 'FORBIDDEN');
    }
  }
  
  // Remove user from tournament
  const deleted = await UserTournament.destroy({
    where: {
      userId,
      tournamentId: id
    }
  });
  
  if (deleted === 0) {
    throw new ApiError('User is not a participant in this tournament', 404, 'NOT_FOUND');
  }
  
  return sendSafeJson(res, {
    success: true,
    message: 'Participant removed successfully'
  });
}));

/**
 * DELETE /api/tournaments/:id/teams/:teamId
 * Remove a team from a tournament
 * Requires organizer role for the tournament
 */
router.delete('/:id/teams/:teamId', requireAuth, validate([
  ...schemas.tournament.tournamentIdParam,
  param('teamId').isInt().withMessage('Team ID must be an integer').toInt()
]), catchAsync(async (req, res) => {
  const { id, teamId } = req.params;
  
  const tournament = await Tournament.findByPk(id);
  
  if (!tournament) {
    throw new ApiError('Tournament not found', 404, 'RESOURCE_NOT_FOUND');
  }
  
  // Check if user has permission to remove teams (creator or organizer)
  if (tournament.creatorId !== req.user.userId) { // Admin check removed
    const userTournament = await UserTournament.findOne({
      where: {
        userId: req.user.userId,
        tournamentId: id,
        role: 'organizer'
      }
    });
    
    if (!userTournament) {
      throw new ApiError('Forbidden - You must be a tournament organizer to remove teams', 403, 'FORBIDDEN');
    }
  }
  
  // Remove team from tournament
  const deleted = await TeamTournament.destroy({
    where: {
      teamId,
      tournamentId: id
    }
  });
  
  if (deleted === 0) {
    throw new ApiError('Team is not registered for this tournament', 404, 'NOT_FOUND');
  }
  
  return sendSafeJson(res, {
    success: true,
    message: 'Team removed from tournament successfully'
  });
}));

module.exports = router;
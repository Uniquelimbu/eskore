const express = require('express');
const { requireAuth, requireTeamManager, requireAdmin } = require('../middleware/auth');
const { catchAsync, ApiError } = require('../middleware/errorHandler');
const router = express.Router();
const Team = require('../models/Team');
const UserTeam = require('../models/UserTeam');
const User = require('../models/User');
const { body, validationResult } = require('express-validator');
const { Op } = require('sequelize');
const { sendSafeJson } = require('../utils/safeSerializer');

// Validation middleware
const validateTeam = [
  body('name').trim().notEmpty().withMessage('Team name is required'),
  body('leagueId').isInt().withMessage('Valid league ID is required'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError('Validation failed', 400, 'VALIDATION_ERROR');
    }
    next();
  }
];

/**
 * GET /api/teams
 * Returns a list of all teams
 * Query params: page (default 1), limit (default 10)
 */
router.get('/', catchAsync(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  const query = {
    limit,
    offset,
    order: [['name', 'ASC']]
  };

  // Add search filter if specified
  if (req.query.search) {
    const searchTerm = `%${req.query.search}%`;
    query.where = {
      name: { [Op.iLike]: searchTerm }
    };
  }

  // Add league filter if specified
  if (req.query.leagueId) {
    query.where = {
      ...query.where,
      leagueId: parseInt(req.query.leagueId)
    };
  }

  const { count, rows: teams } = await Team.findAndCountAll(query);

  return sendSafeJson(res, {
    teams,
    pagination: {
      totalItems: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      itemsPerPage: limit
    }
  });
}));

/**
 * GET /api/teams/:id
 * Returns a single team by ID
 */
router.get('/:id', catchAsync(async (req, res) => {
  const { id } = req.params;
  const team = await Team.findByPk(id, {
    include: [
      {
        model: User,
        through: { attributes: ['role'] },
        attributes: ['id', 'firstName', 'lastName', 'email']
      }
    ]
  });
  
  if (!team) {
    throw new ApiError('Team not found', 404, 'RESOURCE_NOT_FOUND');
  }
  
  return sendSafeJson(res, team);
}));

/**
 * POST /api/teams
 * Creates a new team
 * Requires team manager or admin role
 */
router.post('/', requireTeamManager, validateTeam, catchAsync(async (req, res) => {
  const { name, logoUrl, leagueId } = req.body;
  
  const newTeam = await Team.create({ name, logoUrl, leagueId });
  
  // Automatically make the creator an owner of the team
  await UserTeam.create({
    userId: req.user.id,
    teamId: newTeam.id,
    role: 'owner'
  });
  
  return sendSafeJson(res, {
    success: true,
    team: newTeam
  }, 201);
}));

/**
 * PATCH /api/teams/:id
 * Updates an existing team
 * Requires team ownership or admin role
 */
router.patch('/:id', requireAuth, catchAsync(async (req, res) => {
  const { id } = req.params;
  const { name, logoUrl } = req.body;

  const team = await Team.findByPk(id);
  if (!team) {
    throw new ApiError('Team not found', 404, 'RESOURCE_NOT_FOUND');
  }
  
  // Check if user is team owner or admin
  if (req.user.role !== 'admin') {
    const userTeam = await UserTeam.findOne({
      where: {
        userId: req.user.id,
        teamId: id,
        role: 'owner'
      }
    });
    
    if (!userTeam) {
      throw new ApiError('Forbidden - You must be a team owner to update it', 403, 'FORBIDDEN');
    }
  }
  
  if (name !== undefined) team.name = name;
  if (logoUrl !== undefined) team.logoUrl = logoUrl;

  await team.save();
  return sendSafeJson(res, {
    success: true,
    team
  });
}));

/**
 * DELETE /api/teams/:id
 * Removes a team from the database
 * Requires admin role
 */
router.delete('/:id', requireAdmin, catchAsync(async (req, res) => {
  const { id } = req.params;
  
  const team = await Team.findByPk(id);
  if (!team) {
    throw new ApiError('Team not found', 404, 'RESOURCE_NOT_FOUND');
  }
  
  await team.destroy();
  return sendSafeJson(res, {
    success: true,
    message: 'Team deleted successfully'
  });
}));

/**
 * POST /api/teams/:id/members
 * Add a user to a team
 * Requires team ownership or admin role
 */
router.post('/:id/members', requireAuth, catchAsync(async (req, res) => {
  const { id } = req.params;
  const { userId, role = 'athlete' } = req.body;
  
  // Validate parameters
  if (!userId) {
    throw new ApiError('User ID is required', 400, 'VALIDATION_ERROR');
  }
  
  if (!['owner', 'manager', 'athlete', 'coach'].includes(role)) {
    throw new ApiError('Invalid role', 400, 'VALIDATION_ERROR');
  }
  
  // Check if team exists
  const team = await Team.findByPk(id);
  if (!team) {
    throw new ApiError('Team not found', 404, 'RESOURCE_NOT_FOUND');
  }
  
  // Check if user has permission (team owner, team manager, or admin)
  if (req.user.role !== 'admin') {
    const userTeam = await UserTeam.findOne({
      where: {
        userId: req.user.id,
        teamId: id,
        role: { [Op.in]: ['owner', 'manager'] }
      }
    });
    
    if (!userTeam) {
      throw new ApiError('Forbidden - You must be a team owner or manager to add members', 403, 'FORBIDDEN');
    }
    
    // Team managers can only add athletes and coaches, not owners or other managers
    if (userTeam.role === 'manager' && ['owner', 'manager'].includes(role)) {
      throw new ApiError('Forbidden - Team managers can only add athletes and coaches', 403, 'FORBIDDEN');
    }
  }
  
  // Check if user exists
  const user = await User.findByPk(userId);
  if (!user) {
    throw new ApiError('User not found', 404, 'USER_NOT_FOUND');
  }
  
  // Check if user is already in the team with the same role
  const existingMembership = await UserTeam.findOne({
    where: {
      userId,
      teamId: id,
      role
    }
  });
  
  if (existingMembership) {
    throw new ApiError('User already has this role in the team', 409, 'ALREADY_EXISTS');
  }
  
  // Add user to team
  const userTeam = await UserTeam.create({
    userId,
    teamId: id,
    role
  });
  
  return sendSafeJson(res, {
    success: true,
    membership: userTeam
  }, 201);
}));

/**
 * DELETE /api/teams/:id/members/:userId
 * Remove a user from a team
 * Requires team ownership or admin role
 */
router.delete('/:id/members/:userId', requireAuth, catchAsync(async (req, res) => {
  const { id, userId } = req.params;
  
  // Check if team exists
  const team = await Team.findByPk(id);
  if (!team) {
    throw new ApiError('Team not found', 404, 'RESOURCE_NOT_FOUND');
  }
  
  // Check if user has permission (team owner or admin)
  if (req.user.role !== 'admin') {
    const userTeam = await UserTeam.findOne({
      where: {
        userId: req.user.id,
        teamId: id,
        role: 'owner'
      }
    });
    
    if (!userTeam) {
      throw new ApiError('Forbidden - You must be a team owner to remove members', 403, 'FORBIDDEN');
    }
  }
  
  // Delete the membership
  const deleted = await UserTeam.destroy({
    where: {
      userId,
      teamId: id
    }
  });
  
  if (deleted === 0) {
    throw new ApiError('User is not a member of this team', 404, 'NOT_FOUND');
  }
  
  return sendSafeJson(res, {
    success: true,
    message: 'Team member removed successfully'
  });
}));

/**
 * GET /api/teams/user/:userId
 * Get all teams a user is a member of
 */
router.get('/user/:userId', requireAuth, catchAsync(async (req, res) => {
  const { userId } = req.params;
  
  // Users can only see their own teams unless they're an admin
  if (parseInt(userId) !== req.user.id && req.user.role !== 'admin') {
    throw new ApiError('Forbidden - You can only view your own teams', 403, 'FORBIDDEN');
  }
  
  const userTeams = await UserTeam.findAll({
    where: { userId },
    include: [
      {
        model: Team,
        attributes: ['id', 'name', 'logoUrl', 'leagueId']
      }
    ]
  });
  
  const teams = userTeams.map(ut => ({
    ...ut.Team.toJSON(),
    role: ut.role
  }));
  
  return sendSafeJson(res, { teams });
}));

module.exports = router;

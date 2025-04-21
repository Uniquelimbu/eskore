// backend/src/routes/teamRoutes.js
const express = require('express');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { catchAsync, ApiError } = require('../middleware/errorHandler');
const router = express.Router();
const Team = require('../models/Team');
const { body, validationResult } = require('express-validator');

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

  const { count, rows: teams } = await Team.findAndCountAll({
    limit,
    offset,
    order: [['name', 'ASC']]
  });

  return res.json({
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
  const team = await Team.findByPk(id);
  
  if (!team) {
    throw new ApiError('Team not found', 404, 'RESOURCE_NOT_FOUND');
  }
  
  return res.json(team);
}));

/**
 * POST /api/teams
 * Creates a new team
 * Expects: { "name": "some name", "logoUrl": "some url", "leagueId": 1 }
 */
router.post('/', requireAdmin, validateTeam, catchAsync(async (req, res) => {
  const { name, logoUrl, leagueId } = req.body;
  
  const newTeam = await Team.create({ name, logoUrl, leagueId });
  return res.status(201).json(newTeam);
}));

/**
 * PATCH /api/teams/:id
 * Updates an existing team
 * Expects any subset of { "name": "", "logoUrl": "" }
 */
router.patch('/:id', requireAdmin, catchAsync(async (req, res) => {
  const { id } = req.params;
  const { name, logoUrl } = req.body;

  const team = await Team.findByPk(id);
  if (!team) {
    throw new ApiError('Team not found', 404, 'RESOURCE_NOT_FOUND');
  }
  
  if (name !== undefined) team.name = name;
  if (logoUrl !== undefined) team.logoUrl = logoUrl;

  await team.save();
  return res.json(team);
}));

/**
 * DELETE /api/teams/:id
 * Removes a team from the database
 */
router.delete('/:id', requireAdmin, catchAsync(async (req, res) => {
  const { id } = req.params;
  const team = await Team.findByPk(id);
  if (!team) {
    throw new ApiError('Team not found', 404, 'RESOURCE_NOT_FOUND');
  }
  
  await team.destroy();
  return res.json({ message: 'Team deleted successfully' });
}));

module.exports = router;

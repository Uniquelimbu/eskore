// src/routes/leagueRoutes.js
const express = require('express');
const router = express.Router();
const League = require('../models/League');
const { requireAuth } = require('../middleware/auth'); // Changed from requireAdmin
const { catchAsync, ApiError } = require('../middleware/errorHandler');
const { body, validationResult } = require('express-validator');

// Validation middleware
const validateLeague = [
  body('name').trim().notEmpty().withMessage('League name is required'),
  body('startDate').optional().isDate().withMessage('Start date must be a valid date'),
  body('endDate').optional().isDate().withMessage('End date must be a valid date'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError('Validation failed', 400, 'VALIDATION_ERROR');
    }
    next();
  }
];

/**
 * GET /api/leagues
 * List all leagues
 */
router.get('/', catchAsync(async (req, res) => {
  const leagues = await League.findAll();
  res.json(leagues);
}));

/**
 * GET /api/leagues/:id
 * Get a single league by ID
 */
router.get('/:id', catchAsync(async (req, res) => {
  const { id } = req.params;
  const league = await League.findByPk(id);
  
  if (!league) {
    throw new ApiError('League not found', 404, 'RESOURCE_NOT_FOUND');
  }
  
  res.json(league);
}));

/**
 * POST /api/leagues
 * Create a new league
 */
router.post('/', requireAuth, validateLeague, catchAsync(async (req, res) => { // Changed from requireAdmin
  const { name, startDate, endDate } = req.body;
  const newLeague = await League.create({ name, startDate, endDate });
  res.status(201).json(newLeague);
}));

/**
 * PATCH /api/leagues/:id
 * Update an existing league
 */
router.patch('/:id', requireAuth, catchAsync(async (req, res) => { // Changed from requireAdmin
  const { id } = req.params;
  const { name, startDate, endDate } = req.body;

  const league = await League.findByPk(id);
  if (!league) {
    throw new ApiError('League not found', 404, 'RESOURCE_NOT_FOUND');
  }
  
  if (name !== undefined) league.name = name;
  if (startDate !== undefined) league.startDate = startDate;
  if (endDate !== undefined) league.endDate = endDate;

  await league.save();
  res.json(league);
}));

module.exports = router;

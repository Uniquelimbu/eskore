// src/routes/matchRoutes.js
const express = require('express');
const router = express.Router();
const Match = require('../models/Match');
const { requireAdmin } = require('../middleware/auth');
const { catchAsync, ApiError } = require('../middleware/errorHandler');
const { computeStandingsForLeague } = require('../helpers/computeStandings');
const { body, validationResult } = require('express-validator');

// Validation middleware
const validateMatch = [
  body('homeTeamId').isInt().withMessage('Valid home team ID is required'),
  body('awayTeamId').isInt().withMessage('Valid away team ID is required'),
  body('leagueId').isInt().withMessage('Valid league ID is required'),
  body('homeScore').optional().isInt({ min: 0 }).withMessage('Home score must be a non-negative integer'),
  body('awayScore').optional().isInt({ min: 0 }).withMessage('Away score must be a non-negative integer'),
  body('status').optional().isIn(['scheduled', 'in-progress', 'finished', 'canceled']).withMessage('Invalid match status'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Format errors consistently with the validate middleware
      const formattedErrors = {};
      errors.array().forEach(error => {
        if (!formattedErrors[error.path]) {
          formattedErrors[error.path] = [error.msg];
        } else {
          formattedErrors[error.path].push(error.msg);
        }
      });
      
      throw new ApiError('Validation failed', 400, 'VALIDATION_ERROR', formattedErrors);
    }
    next();
  }
];

// CREATE a match
router.post('/', requireAdmin, validateMatch, catchAsync(async (req, res) => {
  const { homeTeamId, awayTeamId, homeScore, awayScore, status, date, leagueId } = req.body;

  const newMatch = await Match.create({
    homeTeamId,
    awayTeamId,
    homeScore,
    awayScore,
    status,
    date,
    leagueId
  });

  // Compute updated standings for this league
  const updatedStandings = await computeStandingsForLeague(leagueId);

  // Emit events via socketManager if available
  if (req.app.locals.socketManager) {
    req.app.locals.socketManager.broadcastMatchUpdate(newMatch);
  }

  return res.status(201).json(newMatch);
}));

// UPDATE match
router.patch('/:id', requireAdmin, catchAsync(async (req, res) => {
  const matchId = req.params.id;
  const match = await Match.findByPk(matchId);
  
  if (!match) {
    throw new ApiError('Match not found', 404, 'RESOURCE_NOT_FOUND');
  }

  // Update fields
  const { homeScore, awayScore, status } = req.body;
  if (homeScore !== undefined) match.homeScore = homeScore;
  if (awayScore !== undefined) match.awayScore = awayScore;
  if (status !== undefined) match.status = status;

  await match.save();

  // Use socketManager for real-time updates
  if (req.app.locals.socketManager) {
    req.app.locals.socketManager.broadcastMatchUpdate(match);
  }

  return res.json(match);
}));

// GET all matches
router.get('/', catchAsync(async (req, res) => {
  const { leagueId, status } = req.query;
  
  const where = {};
  if (leagueId) where.leagueId = leagueId;
  if (status) where.status = status;

  const matches = await Match.findAll({ 
    where,
    include: ['homeTeam', 'awayTeam'], 
    order: [['date', 'DESC']]
  });

  return res.json(matches);
}));

// GET a single match
router.get('/:id', catchAsync(async (req, res) => {
  const { id } = req.params;
  
  const match = await Match.findByPk(id, {
    include: ['homeTeam', 'awayTeam', 'league']
  });

  if (!match) {
    throw new ApiError('Match not found', 404, 'RESOURCE_NOT_FOUND');
  }

  return res.json(match);
}));

module.exports = router;

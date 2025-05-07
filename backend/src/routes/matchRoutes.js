// src/routes/matchRoutes.js
const express = require('express');
const router = express.Router();
const Match = require('../models/Match');
const { requireAuth } = require('../middleware/auth');
const { catchAsync, ApiError } = require('../middleware/errorHandler');
const { computeStandingsForLeague } = require('../helpers/computeStandings');
const { validate, schemas } = require('../validation');

// CREATE a match
router.post('/', requireAuth, validate(schemas.match.matchSchema), catchAsync(async (req, res) => {
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
router.patch('/:id', 
  requireAuth, 
  validate([
    ...schemas.match.matchIdParam, // Use the correct match ID param schema
    ...schemas.match.matchResultSchema
  ]), 
  catchAsync(async (req, res) => {
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
router.get('/:id', 
  validate(schemas.match.matchIdParam), // Use the match ID param schema
  catchAsync(async (req, res) => {
  const { id } = req.params;
  
  const match = await Match.findByPk(id, {
    include: ['homeTeam', 'awayTeam', 'league']
  });

  if (!match) {
    throw new ApiError('Match not found', 404, 'RESOURCE_NOT_FOUND');
  }

  return res.json(match);
}));

// DELETE match
router.delete('/:id', 
  requireAuth, 
  validate(schemas.match.matchIdParam), // Use the match ID param schema
  catchAsync(async (req, res) => {
  const matchId = req.params.id;
  const match = await Match.findByPk(matchId);

  if (!match) {
    throw new ApiError('Match not found', 404, 'RESOURCE_NOT_FOUND');
  }

  await match.destroy();

  // Use socketManager for real-time updates
  if (req.app.locals.socketManager) {
    req.app.locals.socketManager.broadcastMatchUpdate(match);
  }

  return res.status(204).send();
}));

module.exports = router;

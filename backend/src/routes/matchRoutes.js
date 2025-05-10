// src/routes/matchRoutes.js
const express = require('express');
const router = express.Router();
const Match = require('../models/Match');
const { requireAuth } = require('../middleware/auth');
const { catchAsync, ApiError } = require('../middleware/errorHandler');
const { computeStandingsForLeague } = require('../helpers/computeStandings');
const { validate, schemas } = require('../validation');

/**
 * @swagger
 * tags:
 *   name: Matches
 *   description: Match management and results
 */

// CREATE a match
/**
 * @swagger
 * /api/matches:
 *   post:
 *     summary: Create a new match
 *     tags: [Matches]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MatchInput' # Assuming MatchInput schema
 *     responses:
 *       201:
 *         description: Match created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Match'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
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
/**
 * @swagger
 * /api/matches/{id}:
 *   patch:
 *     summary: Update an existing match (e.g., scores, status)
 *     tags: [Matches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the match to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MatchResultInput' # Assuming MatchResultInput schema for updates
 *     responses:
 *       200:
 *         description: Match updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Match'
 *       400:
 *         description: Invalid input or ID
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Match not found
 *       500:
 *         description: Server error
 */
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
/**
 * @swagger
 * /api/matches:
 *   get:
 *     summary: Get all matches, with optional filters
 *     tags: [Matches]
 *     parameters:
 *       - in: query
 *         name: leagueId
 *         schema:
 *           type: integer
 *         description: Filter matches by league ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [scheduled, live, completed, postponed, cancelled] # Adjust as per your Match model
 *         description: Filter matches by status
 *     responses:
 *       200:
 *         description: A list of matches
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Match'
 *       500:
 *         description: Server error
 */
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
/**
 * @swagger
 * /api/matches/{id}:
 *   get:
 *     summary: Get a single match by ID
 *     tags: [Matches]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the match to get
 *     responses:
 *       200:
 *         description: Details of the match
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Match'
 *       400:
 *         description: Invalid ID supplied
 *       404:
 *         description: Match not found
 *       500:
 *         description: Server error
 */
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
/**
 * @swagger
 * /api/matches/{id}:
 *   delete:
 *     summary: Delete a match
 *     tags: [Matches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the match to delete
 *     responses:
 *       204:
 *         description: Match deleted successfully
 *       400:
 *         description: Invalid ID supplied
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Match not found
 *       500:
 *         description: Server error
 */
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

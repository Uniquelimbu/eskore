// src/routes/leagueRoutes.js
const express = require('express');
const router = express.Router();
const League = require('../models/League');
const { requireAuth } = require('../middleware/auth');
const { catchAsync, ApiError } = require('../middleware/errorHandler');
const { validate, schemas } = require('../validation');

/**
 * @swagger
 * tags:
 *   name: Leagues
 *   description: League management
 */

/**
 * @swagger
 * /api/leagues:
 *   get:
 *     summary: List all leagues
 *     tags: [Leagues]
 *     responses:
 *       200:
 *         description: A list of leagues
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/League' # Assuming you have a League schema
 *       500:
 *         description: Server error
 */
router.get('/', catchAsync(async (req, res) => {
  const leagues = await League.findAll();
  res.json(leagues);
}));

/**
 * @swagger
 * /api/leagues/{id}:
 *   get:
 *     summary: Get a single league by ID
 *     tags: [Leagues]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the league to get
 *     responses:
 *       200:
 *         description: Details of the league
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/League'
 *       400:
 *         description: Invalid ID supplied
 *       404:
 *         description: League not found
 *       500:
 *         description: Server error
 */
router.get('/:id', validate(schemas.league.leagueIdParam), catchAsync(async (req, res) => {
  const { id } = req.params;
  const league = await League.findByPk(id);
  
  if (!league) {
    throw new ApiError('League not found', 404, 'RESOURCE_NOT_FOUND');
  }
  
  res.json(league);
}));

/**
 * @swagger
 * /api/leagues:
 *   post:
 *     summary: Create a new league
 *     tags: [Leagues]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LeagueInput' # Assuming an input schema for league creation
 *     responses:
 *       201:
 *         description: League created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/League'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/', 
  requireAuth, 
  validate(schemas.league.leagueSchema), 
  catchAsync(async (req, res) => {
    const { name, startDate, endDate } = req.body;
    const newLeague = await League.create({ name, startDate, endDate });
    res.status(201).json(newLeague);
  })
);

/**
 * @swagger
 * /api/leagues/{id}:
 *   patch:
 *     summary: Update an existing league
 *     tags: [Leagues]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the league to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LeagueInput' # Assuming an input schema for league update (can be partial)
 *     responses:
 *       200:
 *         description: League updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/League'
 *       400:
 *         description: Invalid input or ID
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: League not found
 *       500:
 *         description: Server error
 */
router.patch('/:id', 
  requireAuth, 
  validate([
    ...schemas.league.leagueIdParam,
    ...schemas.league.leagueSchema
  ]), 
  catchAsync(async (req, res) => {
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
  })
);

/**
 * @swagger
 * /api/leagues/{id}:
 *   delete:
 *     summary: Delete a league
 *     tags: [Leagues]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the league to delete
 *     responses:
 *       204:
 *         description: League deleted successfully
 *       400:
 *         description: Invalid ID supplied
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: League not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', 
  requireAuth, 
  validate(schemas.league.leagueIdParam), 
  catchAsync(async (req, res) => {
    const { id } = req.params;

    const league = await League.findByPk(id);
    if (!league) {
      throw new ApiError('League not found', 404, 'RESOURCE_NOT_FOUND');
    }

    await league.destroy();
    res.status(204).end();
  })
);

module.exports = router;

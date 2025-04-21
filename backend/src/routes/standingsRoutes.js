// src/routes/standingsRoutes.js
const express = require('express');
const router = express.Router();
const { catchAsync } = require('../middleware/errorHandler');
const { computeStandingsForLeague } = require('../helpers/computeStandings');

// GET /api/standings/:leagueId
// Return the standings for a specific league
router.get('/:leagueId', catchAsync(async (req, res) => {
  const { leagueId } = req.params;
  
  // Use our helper function to compute standings
  const standings = await computeStandingsForLeague(leagueId);
  
  return res.json(standings);
}));

module.exports = router;

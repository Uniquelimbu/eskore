const express = require('express');
const router = express.Router();

const { catchAsync } = require('../middleware/errorHandler');
const { validate } = require('../validation');
const { query } = require('express-validator');
const Team = require('../models/Team');
const { sendSafeJson } = require('../utils/safeSerializer');
const log = require('../utils/log');
const { Op } = require('sequelize');

/**
 * GET /api/teams-search
 * Stand-alone endpoint (outside /api/teams namespace) to avoid a route
 * conflict with the dynamic /api/teams/:id route that would otherwise
 * intercept "/search". Returns up to 20 matching teams.
 */
router.get('/teams-search',
  // Validate optional "q" parameter
  validate([
    query('q').optional().isString().trim().escape()
  ]),
  catchAsync(async (req, res) => {
    const { q } = req.query;
    log.info(`TEAM_SEARCH_ROUTES (GET /api/teams-search): query="${q}"`);

    // If query is empty, return zero results quickly
    if (!q || !q.trim()) {
      return sendSafeJson(res, { success: true, count: 0, teams: [] });
    }

    const searchTerm = q.trim();
    const likeOp = Op.iLike ? Op.iLike : Op.like; // Op.iLike for Postgres, Op.like otherwise

    const teams = await Team.findAll({
      where: {
        [Op.or]: [
          { name: { [likeOp]: `%${searchTerm}%` } },
          { abbreviation: { [likeOp]: `%${searchTerm}%` } }
        ]
      },
      limit: 20,
      order: [['name', 'ASC']]
    });

    return sendSafeJson(res, { success: true, count: teams.length, teams });
  })
);

module.exports = router; 
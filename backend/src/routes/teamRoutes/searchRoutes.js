const express = require('express');
const router = express.Router();
const { catchAsync } = require('../../middleware/errorHandler');
const Team = require('../../models/Team');
const { sendSafeJson } = require('../../utils/safeSerializer');
const log = require('../../utils/log');
const { Op } = require('sequelize');
const { query } = require('express-validator'); // Add this import
const { validate } = require('../../validation'); // Add this import

/**
 * GET /api/teams/search
 * Search for teams by name, abbreviation, or teamIdentifier
 */
router.get('/search', 
  // Add validation rules but make the query optional with default behavior
  validate([
    query('q').optional().isString().trim().escape()
  ]),
  catchAsync(async (req, res) => {
    const { q } = req.query;
    log.info(`TEAMROUTES/SEARCH (GET /search): Searching teams with query: ${q}`);
    
    if (!q || !q.trim()) {
      return sendSafeJson(res, { success: true, count: 0, teams: [] });
    }
    
    const query = q.trim();
    // Case-insensitive match (Op.iLike in Postgres, Op.like otherwise)
    const likeOp = Op.iLike ? Op.iLike : Op.like;
    
    const teams = await Team.findAll({
      where: {
        [Op.or]: [
          { name: { [likeOp]: `%${query}%` } },
          { abbreviation: { [likeOp]: `%${query}%` } },
          { teamIdentifier: { [likeOp]: `%${query}%` } } // Add search by teamIdentifier
        ]
      },
      limit: 20,
      order: [['name', 'ASC']]
    });
    
    return sendSafeJson(res, { success: true, count: teams.length, teams });
  })
);

module.exports = router;

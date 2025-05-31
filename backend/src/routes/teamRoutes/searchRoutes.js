const express = require('express');
const router = express.Router();
const { catchAsync } = require('../../middleware/errorHandler');
const Team = require('../../models/Team');
const { sendSafeJson } = require('../../utils/safeSerializer');
const log = require('../../utils/log');
const { Op } = require('sequelize');
const { query } = require('express-validator');
const { validate } = require('../../validation');

/**
 * GET /api/teams/search
 * Search for teams by name, abbreviation, or teamIdentifier
 */
router.get('/search', 
  validate([
    query('q').optional().isString().trim().escape()
  ]),
  catchAsync(async (req, res) => {
    const { q } = req.query;
    log.info(`TEAMROUTES/SEARCH (GET /search): Searching teams with query: ${q}`);
    
    if (!q || !q.trim()) {
      return sendSafeJson(res, { success: true, count: 0, teams: [] });
    }
    
    const searchQuery = q.trim();
    const likeOp = Op.iLike ? Op.iLike : Op.like;
    
    const teams = await Team.findAll({
      where: {
        [Op.and]: [
          // Only include public teams
          { visibility: 'public' },
          {
            [Op.or]: [
              { name: { [likeOp]: `%${searchQuery}%` } },
              { abbreviation: { [likeOp]: `%${searchQuery}%` } },
              { teamIdentifier: { [likeOp]: `%${searchQuery}%` } }
            ]
          }
        ]
      },
      limit: 20,
      order: [['name', 'ASC']]
    });
    
    return sendSafeJson(res, { success: true, count: teams.length, teams });
  })
);

module.exports = router;

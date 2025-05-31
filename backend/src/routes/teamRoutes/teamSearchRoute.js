const express = require('express');
const router = express.Router();
const { catchAsync } = require('../../middleware/errorHandler');
const { validate } = require('../../validation');
const { query } = require('express-validator');
const Team = require('../../models/Team');
const { sendSafeJson } = require('../../utils/safeSerializer');
const log = require('../../utils/log');
const { Op } = require('sequelize');

/**
 * GET /api/teams-search
 * Search teams with filtering and pagination
 */
router.get('/', 
  validate([
    query('q').optional().isString().withMessage('Search query must be a string'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50')
  ]),
  catchAsync(async (req, res) => {
    log.info(`TEAM SEARCH: Executing search with params: ${JSON.stringify(req.query)}`);
    
    const { q = '', page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    // Build search conditions
    const searchConditions = {
      // Only include public teams in search results
      visibility: 'public'
    };
    
    // Add search term if provided
    if (q && q.trim()) {
      const searchTerm = `%${q.trim()}%`;
      searchConditions[Op.or] = [
        { name: { [Op.iLike]: searchTerm } },
        { nickname: { [Op.iLike]: searchTerm } },
        { abbreviation: { [Op.iLike]: searchTerm } },
        { city: { [Op.iLike]: searchTerm } }
      ];
    }
    
    // Execute search
    const { count, rows: teams } = await Team.findAndCountAll({
      where: searchConditions,
      limit: parseInt(limit),
      offset,
      order: [['name', 'ASC']]
    });
    
    return sendSafeJson(res, {
      teams,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / parseInt(limit))
      }
    });
  })
);

module.exports = router;

const express = require('express');
const router = express.Router();
const { catchAsync, ApiError } = require('../middleware/errorHandler');
const { sendSafeJson } = require('../utils/safeSerializer');
const logger = require('../utils/logger');

/**
 * @swagger
 * tags:
 *   name: Leaderboard
 *   description: Leaderboard information
 */

// Placeholder function to simulate fetching leaderboard data
// In a real application, this would interact with a database or a dedicated service
const getMockLeaderboardData = async (gameId, metric, limit) => {
  logger.info(`[leaderboardRoutes] Fetching mock leaderboard for gameId: ${gameId}, metric: ${metric}, limit: ${limit}`);
  // Example: Return a list of players based on parameters
  const players = [
    { rank: 1, playerId: 'player1', username: 'TopPlayer', score: 1500, game: gameId, metricUsed: metric },
    { rank: 2, playerId: 'player2', username: 'ProGamer', score: 1450, game: gameId, metricUsed: metric },
    { rank: 3, playerId: 'player3', username: 'SkillMaster', score: 1400, game: gameId, metricUsed: metric },
    { rank: 4, playerId: 'player4', username: 'Legendary', score: 1350, game: gameId, metricUsed: metric },
    { rank: 5, playerId: 'player5', username: 'RookieStar', score: 1300, game: gameId, metricUsed: metric },
  ];
  return players.slice(0, limit);
};

/**
 * @swagger
 * /api/leaderboard:
 *   get:
 *     summary: Fetches leaderboard data
 *     tags: [Leaderboard]
 *     parameters:
 *       - in: query
 *         name: gameId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the game for the leaderboard.
 *       - in: query
 *         name: metric
 *         schema:
 *           type: string
 *           default: score
 *         description: The metric to sort by (e.g., 'score', 'winRate').
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: The number of entries to return.
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 query:
 *                   type: object
 *                   properties:
 *                     gameId:
 *                       type: string
 *                     metric:
 *                       type: string
 *                     limit:
 *                       type: integer
 *                 leaderboard:
 *                   type: array
 *                   items:
 *                     type: object # Define your leaderboard item structure here
 *                     properties:
 *                       rank:
 *                         type: integer
 *                       playerId:
 *                         type: string
 *                       username:
 *                         type: string
 *                       score:
 *                         type: integer
 *                       game:
 *                         type: string
 *                       metricUsed:
 *                         type: string
 *       400:
 *         description: Invalid input (e.g., missing gameId, invalid limit)
 *       500:
 *         description: Server error
 */
router.get('/', catchAsync(async (req, res) => {
  const { gameId, metric = 'score', limit = '10' } = req.query;
  const parsedLimit = parseInt(limit, 10);

  logger.info(`[GET /api/leaderboard] Request received - gameId: ${gameId}, metric: ${metric}, limit: ${parsedLimit}`);

  if (!gameId) {
    throw new ApiError('Query parameter "gameId" is required.', 400, 'VALIDATION_ERROR_MISSING_GAMEID');
  }

  if (isNaN(parsedLimit) || parsedLimit <= 0) {
    throw new ApiError('Query parameter "limit" must be a positive integer.', 400, 'VALIDATION_ERROR_INVALID_LIMIT');
  }

  // In a real application, you would fetch and process actual leaderboard data here
  const leaderboard = await getMockLeaderboardData(gameId, metric, parsedLimit);

  return sendSafeJson(res, {
    success: true,
    query: { gameId, metric, limit: parsedLimit },
    leaderboard,
  });
}));

module.exports = router;

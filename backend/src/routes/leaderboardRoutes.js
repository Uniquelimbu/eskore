const express = require('express');
const router = express.Router();
const { catchAsync, ApiError } = require('../middleware/errorHandler');
const { sendSafeJson } = require('../utils/safeSerializer');
const logger = require('../utils/logger');

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
 * GET /api/leaderboard
 * Fetches leaderboard data.
 * Query Parameters:
 *  - gameId (required): The ID of the game for the leaderboard.
 *  - metric (optional): The metric to sort by (e.g., 'score', 'winRate'). Defaults to 'score'.
 *  - limit (optional): The number of entries to return. Defaults to 10.
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

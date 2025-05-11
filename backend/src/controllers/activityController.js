const { ApiError } = require('../middleware/errorHandler');
const { sendSafeJson } = require('../utils/safeSerializer');
const logger = require('../utils/logger');
const { Op } = require('sequelize');
const sequelize = require('../config/db');

// Models
const UserTeam = require('../models/UserTeam');
const Team = require('../models/Team');
const Match = require('../models/Match');
const UserMatch = require('../models/UserMatch');
const Tournament = require('../models/Tournament');
const UserTournament = require('../models/UserTournament');

/**
 * Get recent activities for the authenticated user
 * Combines various activity types: team joins, matches played, tournament participation
 */
exports.getUserActivities = async (req, res) => {
  try {
    // Validate the limit parameter
    const limit = parseInt(req.query.limit) || 10;
    
    if (isNaN(limit) || limit < 1 || limit > 50) {
      throw new ApiError('Limit must be a number between 1 and 50', 400, 'VALIDATION_ERROR');
    }
    
    // Ensure the user is authenticated (should be done by auth middleware)
    if (!req.user || !req.user.userId) {
      throw new ApiError('User not authenticated', 401, 'UNAUTHORIZED');
    }
    
    const userId = req.user.userId;
    logger.info(`Fetching recent activities for user ${userId} with limit ${limit}`);
    
    // Collect activities; if any source fails we'll log and continue.
    const activities = [];

    // Helper to safely push activities without failing the whole endpoint
    const safePush = (fnName, items) => {
      try {
        activities.push(...items);
      } catch (pushErr) {
        logger.error(`[getUserActivities] Failed to merge ${fnName} items: ${pushErr.message}`);
      }
    };

    try {
      const teamActivities = await UserTeam.findAll({
        where: { userId },
        include: [{ model: Team, attributes: ['name', 'logoUrl'] }],
        order: [['createdAt', 'DESC']],
        limit
      });
      const mapped = teamActivities.map(activity => ({
        id: `team-${activity.id}`,
        type: 'team',
        action: 'joined', // Could be 'joined', 'left', 'role_change' with additional logic
        teamId: activity.teamId,
        teamName: activity.Team?.name || 'Unknown team',
        teamLogo: activity.Team?.logoUrl,
        role: activity.role,
        date: activity.createdAt.toISOString()
      }));
      safePush('teamActivities', mapped);
    } catch (err) {
      logger.error(`[getUserActivities] teamActivities query failed: ${err.message}`);
    }

    try {
      const matchActivities = await UserMatch.findAll({
        where: { userId },
        include: [{ 
          model: Match,
          attributes: ['id', 'homeTeamId', 'awayTeamId', 'homeScore', 'awayScore', 'date'],
          include: [
            { model: Team, as: 'homeTeam', attributes: ['name'] },
            { model: Team, as: 'awayTeam', attributes: ['name'] }
          ]
        }],
        order: [['createdAt', 'DESC']],
        limit
      });
      const mapped = [];
      matchActivities.forEach(activity => {
        const match = activity.Match;
        if (!match) return;
        
        const userTeamId = activity.teamId;
        const isHomeTeam = userTeamId === match.homeTeamId;
        const userWon = isHomeTeam 
          ? match.homeScore > match.awayScore 
          : match.awayScore > match.homeScore;
        const userTeamScore = isHomeTeam ? match.homeScore : match.awayScore;
        const opponentScore = isHomeTeam ? match.awayScore : match.homeScore;
        
        mapped.push({
          id: `match-${activity.id}`,
          type: 'match',
          matchId: match.id,
          result: userWon ? 'win' : (match.homeScore === match.awayScore ? 'draw' : 'loss'),
          score: `${userTeamScore}-${opponentScore}`,
          userTeamId,
          userTeamName: isHomeTeam ? match.homeTeam?.name : match.awayTeam?.name,
          opponentName: isHomeTeam ? match.awayTeam?.name : match.homeTeam?.name,
          stats: activity.stats, // Player-specific stats if available
          date: match.date.toISOString()
        });
      });
      safePush('matchActivities', mapped);
    } catch (err) {
      logger.error(`[getUserActivities] matchActivities query failed: ${err.message}`);
    }

    try {
      const tournamentActivities = await UserTournament.findAll({
        where: { userId },
        include: [{ model: Tournament, attributes: ['name', 'status'] }],
        order: [['createdAt', 'DESC']],
        limit
      });
      const mapped = tournamentActivities.map(activity => ({
        id: `tournament-${activity.id}`,
        type: 'tournament',
        action: 'joined', // Could have more actions based on status changes
        tournamentId: activity.tournamentId,
        tournamentName: activity.Tournament?.name || 'Unknown tournament',
        role: activity.role,
        status: activity.Tournament?.status,
        date: activity.createdAt.toISOString()
      }));
      safePush('tournamentActivities', mapped);
    } catch (err) {
      logger.error(`[getUserActivities] tournamentActivities query failed: ${err.message}`);
    }

    // Sort activities (newest first) and enforce limit
    const sortedActivities = activities
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, limit);
    
    return sendSafeJson(res, sortedActivities);
    
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    logger.error(`Error in getUserActivities (unhandled): ${error.message}`, error);
    // Instead of failing, return an empty array to avoid dashboard crashing
    return sendSafeJson(res, []);
  }
};

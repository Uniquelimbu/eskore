const express = require('express');
const router = express.Router();
const { requireAuth } = require('../../middleware/auth');
const { catchAsync, ApiError } = require('../../middleware/errorHandler');
const { validate, schemas } = require('../../validation');
const Team = require('../../models/Team');
const User = require('../../models/User');
const UserTeam = require('../../models/UserTeam');
const { sendSafeJson } = require('../../utils/safeSerializer');
const log = require('../../utils/log');

/**
 * GET /api/teams/:id/players
 * Get all players for a team
 */
router.get('/:id/players',
  validate(schemas.team.teamIdParam),
  catchAsync(async (req, res) => {
    log.info(`TEAMROUTES/PLAYERS (GET /:id/players): Fetching players for team ${req.params.id}`);
    const { id } = req.params;

    const team = await Team.findByPk(id);
    if (!team) {
      throw new ApiError('Team not found', 404, 'RESOURCE_NOT_FOUND');
    }

    // Get users with athlete role in this team
    const teamPlayers = await UserTeam.findAll({
      where: { 
        teamId: id,
        role: 'athlete'
      },
      include: [
        {
          model: User,
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ]
    });

    // Get player data (if any)
    const playerData = [];
    for (const teamPlayer of teamPlayers) {
      const user = teamPlayer.User;
      if (!user) continue;
      
      // Find player profile if it exists
      const playerProfile = await sequelize.models.Player.findOne({
        where: { userId: user.id },
        attributes: ['id', 'position', 'height', 'weight', 'preferredFoot', 'jerseyNumber']
      });
      
      playerData.push({
        userId: user.id,
        id: playerProfile?.id,
        firstName: user.firstName,
        lastName: user.lastName,
        position: playerProfile?.position || 'Unassigned',
        height: playerProfile?.height,
        weight: playerProfile?.weight,
        preferredFoot: playerProfile?.preferredFoot || 'Right',
        jerseyNumber: playerProfile?.jerseyNumber || ''
      });
    }

    return sendSafeJson(res, {
      teamId: id,
      teamName: team.name,
      players: playerData
    });
  })
);

module.exports = router;

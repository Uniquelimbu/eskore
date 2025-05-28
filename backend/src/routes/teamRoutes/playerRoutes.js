const express = require('express');
const router = express.Router();
const { requireAuth } = require('../../middleware/auth');
const { catchAsync, ApiError } = require('../../middleware/errorHandler');
const { validate, schemas } = require('../../validation');
const Team = require('../../models/Team');
const User = require('../../models/User');
const UserTeam = require('../../models/UserTeam');
const Player = require('../../models/Player');
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

    // Get all players in this team
    const teamPlayers = await User.findAll({
      attributes: ['id', 'firstName', 'lastName', 'email'],
      include: [
        {
          model: UserTeam,
          as: 'userTeams',
          where: { 
            teamId: id,
            role: 'athlete'  // Only get members with 'athlete' role
          },
          attributes: ['role']
        },
        {
          model: Player,
          as: 'Player',
          required: true, // Only include users who have player profiles
          attributes: [
            'id', 'position', 'height', 'weight', 
            'preferredFoot', 'jerseyNumber'
            // Removed 'dateOfBirth', 'nationality', 'profileImageUrl' fields
          ]
        }
      ]
    });

    // Format response
    const players = teamPlayers.map(player => {
      const playerData = player.toJSON();
      
      return {
        userId: playerData.id,
        id: playerData.Player.id,
        firstName: playerData.firstName,
        lastName: playerData.lastName,
        position: playerData.Player.position,
        height: playerData.Player.height,
        weight: playerData.Player.weight,
        preferredFoot: playerData.Player.preferredFoot,
        jerseyNumber: playerData.Player.jerseyNumber
        // Removed dateOfBirth, nationality, profileImageUrl fields
      };
    });

    return sendSafeJson(res, {
      teamId: id,
      teamName: team.name,
      players
    });
  })
);

module.exports = router;

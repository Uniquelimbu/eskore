const express = require('express');
const router = express.Router();
const { requireAuth } = require('../../middleware/auth');
const { catchAsync, ApiError } = require('../../middleware/errorHandler');
const { validate, schemas } = require('../../validation');
const Team = require('../../models/Team');
const User = require('../../models/User');
const UserTeam = require('../../models/UserTeam');
const Manager = require('../../models/Manager');
const { sendSafeJson } = require('../../utils/safeSerializer');
const log = require('../../utils/log');
const { Op } = require('sequelize');
const sequelize = require('../../config/db');

/**
 * GET /api/teams/:id/managers
 * Get all managers for a team
 */
router.get('/:id/managers',
  validate(schemas.team.teamIdParam),
  catchAsync(async (req, res) => {
    log.info(`TEAMROUTES/MANAGERS (GET /:id/managers): Fetching managers for team ${req.params.id}`);
    const { id } = req.params;

    const team = await Team.findByPk(id);
    if (!team) {
      throw new ApiError('Team not found', 404, 'RESOURCE_NOT_FOUND');
    }

    // Find team members with manager roles
    const teamManagers = await UserTeam.findAll({
      where: {
        teamId: id,
        role: { [Op.in]: ['manager', 'assistant_manager'] }
      },
      include: [
        {
          model: User,
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ]
    });

    // Get manager data with their profiles
    const managers = [];
    for (const teamManager of teamManagers) {
      if (!teamManager.User) continue;
      
      const user = teamManager.User;
      
      // Get manager profile data
      const managerProfile = await Manager.findOne({
        where: { userId: user.id },
        attributes: ['id', 'playingStyle', 'preferredFormation', 'experience']
      });
      
      managers.push({
        userId: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: teamManager.role,
        playingStyle: managerProfile?.playingStyle || 'balanced',
        preferredFormation: managerProfile?.preferredFormation || '4-3-3',
        experience: managerProfile?.experience || 0
      });
    }

    return sendSafeJson(res, {
      teamId: id,
      teamName: team.name,
      managers
    });
  })
);

module.exports = router;

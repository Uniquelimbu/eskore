const express = require('express');
const router = express.Router();
const { requireAuth } = require('../../middleware/auth');
const { catchAsync, ApiError } = require('../../middleware/errorHandler');
const { validate, schemas } = require('../../validation');
const Team = require('../../models/Team');
const UserTeam = require('../../models/UserTeam');
const { sendSafeJson } = require('../../utils/safeSerializer');
const log = require('../../utils/log');
const sequelize = require('../../config/db');
const { body } = require('express-validator');

/**
 * POST /api/teams/:id/transfer-manager
 * Transfers manager role to another team member
 */
router.post('/:id/transfer-manager',
  requireAuth,
  validate([
    ...schemas.team.teamIdParam,
    body('newManagerId').isInt().withMessage('New manager ID must be an integer')
  ]),
  catchAsync(async (req, res) => {
    log.info(`TEAMROUTES/MANAGEMENT (POST /:id/transfer-manager): Transferring manager role in team ${req.params.id}, from user ${req.user?.userId} to user ${req.body.newManagerId}`);
    const { id } = req.params;
    const { newManagerId } = req.body;
    
    // Start a transaction for atomicity
    const t = await sequelize.transaction();
    
    try {
      // Check if team exists
      const team = await Team.findByPk(id, { transaction: t });
      if (!team) {
        await t.rollback();
        throw new ApiError('Team not found', 404, 'RESOURCE_NOT_FOUND');
      }
      
      // Check if current user is the manager
      const currentManager = await UserTeam.findOne({
        where: {
          teamId: id,
          userId: req.user.userId,
          role: 'manager'
        },
        transaction: t
      });
      
      if (!currentManager) {
        await t.rollback();
        throw new ApiError('Only the current manager can transfer manager role', 403, 'FORBIDDEN');
      }
      
      // Check if new manager is on the team
      const newManager = await UserTeam.findOne({
        where: {
          teamId: id,
          userId: newManagerId
        },
        transaction: t
      });
      
      if (!newManager) {
        await t.rollback();
        throw new ApiError('The specified user is not a member of this team', 404, 'USER_NOT_FOUND');
      }
      
      // Update roles
      currentManager.role = 'athlete'; // Demote current manager
      await currentManager.save({ transaction: t });
      
      newManager.role = 'manager'; // Promote new manager
      await newManager.save({ transaction: t });
      
      // Commit transaction
      await t.commit();
      
      log.info(`TEAMROUTES/MANAGEMENT (POST /:id/transfer-manager): Manager role transferred from ${req.user.userId} to ${newManagerId} for team ${id}`);
      
      return sendSafeJson(res, {
        success: true,
        message: 'Manager role transferred successfully'
      });
    } catch (error) {
      await t.rollback();
      throw error;
    }
  })
);

/**
 * POST /api/teams/:id/promote-last-member
 * Promote the last remaining member to manager
 */
router.post('/:id/promote-last-member', 
  requireAuth, 
  validate(schemas.team.teamIdParam),
  catchAsync(async (req, res) => {
    log.info(`TEAMROUTES/MANAGEMENT (POST /:id/promote-last-member): Promoting last member for team ID ${req.params.id}, User: ${req.user?.email}`);
    const { id } = req.params;
     
    // Start a transaction for atomicity
    const t = await sequelize.transaction();
    
    try {
      // Check if team exists
      const team = await Team.findByPk(id, { transaction: t });
      if (!team) {
        await t.rollback();
        throw new ApiError('Team not found', 404, 'RESOURCE_NOT_FOUND');
      }
      
      // Count team members
      const memberCount = await UserTeam.count({
        where: { teamId: id },
        transaction: t
      });
      
      // Check if user is a member of this team
      const userTeam = await UserTeam.findOne({
        where: {
          userId: req.user.userId,
          teamId: id
        },
        transaction: t
      });
      
      if (!userTeam) {
        await t.rollback();
        throw new ApiError('You are not a member of this team', 403, 'FORBIDDEN');
      }
      
      // Verify this is the only member
      if (memberCount !== 1) {
        await t.rollback();
        throw new ApiError('This operation is only allowed when you are the sole team member', 403, 'FORBIDDEN_MULTIPLE_MEMBERS');
      }
      
      // Update user's role to manager
      userTeam.role = 'manager';
      await userTeam.save({ transaction: t });
      
      // Commit transaction
      await t.commit();
      
      log.info(`TEAMROUTES/MANAGEMENT (POST /:id/promote-last-member): User ${req.user.userId} promoted to manager for team ${id}`);
      
      return sendSafeJson(res, {
        success: true,
        message: 'You are now the team manager',
        membership: userTeam
      });
    } catch (error) {
      await t.rollback();
      throw error;
    }
  })
);

module.exports = router;
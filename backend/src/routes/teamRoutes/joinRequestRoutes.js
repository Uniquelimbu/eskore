const express = require('express');
const router = express.Router();
const { requireAuth } = require('../../middleware/auth');
const { catchAsync, ApiError } = require('../../middleware/errorHandler');
const { validate } = require('../../validation');
const { param, body } = require('express-validator');
const { sendSafeJson } = require('../../utils/safeSerializer');
const log = require('../../utils/log');
const sequelize = require('../../config/db');
const { Op } = require('sequelize');

/**
 * POST /api/teams/join-requests/:requestId/accept
 * Accept a team join request
 */
router.post('/join-requests/:requestId/accept',
  requireAuth,
  validate([
    param('requestId').isInt().withMessage('Request ID must be an integer')
  ]),
  catchAsync(async (req, res) => {
    const { requestId } = req.params;
    const userId = req.user.userId || req.user.id;
    
    log.info(`Accepting join request ${requestId} by user ${userId}`);
    
    const t = await sequelize.transaction();
    
    try {
      const Notification = require('../../models/Notification');
      const UserTeam = require('../../models/UserTeam');
      const Player = require('../../models/Player');
      
      // Get the notification
      const notification = await Notification.findByPk(requestId, { transaction: t });
      
      if (!notification || notification.type !== 'join_request') {
        await t.rollback();
        throw new ApiError('Join request not found', 404, 'RESOURCE_NOT_FOUND');
      }
      
      // Check if user is a manager of the team
      const userTeam = await UserTeam.findOne({
        where: {
          userId,
          teamId: notification.teamId,
          role: { [Op.in]: ['manager', 'assistant_manager'] }
        },
        transaction: t
      });
      
      if (!userTeam) {
        await t.rollback();
        throw new ApiError('Only team managers can accept join requests', 403, 'FORBIDDEN');
      }
      
      // Check if the requester is already a member
      const existingMembership = await UserTeam.findOne({
        where: {
          userId: notification.senderUserId,
          teamId: notification.teamId
        },
        transaction: t
      });
      
      if (existingMembership) {
        await t.rollback();
        throw new ApiError('User is already a member of this team', 409, 'ALREADY_MEMBER');
      }
      
      // Add user to team as athlete
      await UserTeam.create({
        userId: notification.senderUserId,
        teamId: notification.teamId,
        role: 'athlete',
        status: 'active',
        joinedAt: new Date()
      }, { transaction: t });
      
      // Create player profile if it doesn't exist and if metadata contains player data
      if (notification.metadata && notification.metadata.playerData) {
        const existingPlayer = await Player.findOne({
          where: { userId: notification.senderUserId },
          transaction: t
        });
        
        if (!existingPlayer) {
          const playerData = notification.metadata.playerData;
          await Player.create({
            userId: notification.senderUserId,
            teamId: notification.teamId,
            position: playerData.position || 'SUB',
            height: playerData.height || null,
            weight: playerData.weight || null,
            preferredFoot: playerData.preferredFoot || null,
            jerseyNumber: playerData.jerseyNumber || null
          }, { transaction: t });
        }
      }
      
      // Archive the original notification
      await notification.update({
        status: 'archived'
      }, { transaction: t });
      
      // Create acceptance notification for the requester
      await Notification.create({
        recipientUserId: notification.senderUserId,
        senderUserId: userId,
        teamId: notification.teamId,
        type: 'join_request_accepted',
        message: `Your request to join the team has been accepted!`,
        status: 'unread'
      }, { transaction: t });
      
      await t.commit();
      
      log.info(`Successfully accepted join request ${requestId}`);
      
      return sendSafeJson(res, {
        success: true,
        message: 'Join request accepted successfully'
      });
      
    } catch (error) {
      await t.rollback();
      log.error(`Error accepting join request ${requestId}:`, error);
      throw error;
    }
  })
);

/**
 * POST /api/teams/join-requests/:requestId/reject
 * Reject a team join request
 */
router.post('/join-requests/:requestId/reject',
  requireAuth,
  validate([
    param('requestId').isInt().withMessage('Request ID must be an integer'),
    body('reason').optional().isString().withMessage('Reason must be a string')
  ]),
  catchAsync(async (req, res) => {
    const { requestId } = req.params;
    const { reason = 'No reason provided' } = req.body;
    const userId = req.user.userId || req.user.id;
    
    log.info(`Rejecting join request ${requestId} by user ${userId}`);
    
    const t = await sequelize.transaction();
    
    try {
      const Notification = require('../../models/Notification');
      const UserTeam = require('../../models/UserTeam');
      
      // Get the notification
      const notification = await Notification.findByPk(requestId, { transaction: t });
      
      if (!notification || notification.type !== 'join_request') {
        await t.rollback();
        throw new ApiError('Join request not found', 404, 'RESOURCE_NOT_FOUND');
      }
      
      // Check if user is a manager of the team
      const userTeam = await UserTeam.findOne({
        where: {
          userId,
          teamId: notification.teamId,
          role: { [Op.in]: ['manager', 'assistant_manager'] }
        },
        transaction: t
      });
      
      if (!userTeam) {
        await t.rollback();
        throw new ApiError('Only team managers can reject join requests', 403, 'FORBIDDEN');
      }
      
      // Archive the original notification
      await notification.update({
        status: 'archived'
      }, { transaction: t });
      
      // Create rejection notification for the requester
      await Notification.create({
        recipientUserId: notification.senderUserId,
        senderUserId: userId,
        teamId: notification.teamId,
        type: 'join_request_rejected',
        message: `Your request to join the team has been declined. Reason: ${reason}`,
        status: 'unread'
      }, { transaction: t });
      
      await t.commit();
      
      log.info(`Successfully rejected join request ${requestId}`);
      
      return sendSafeJson(res, {
        success: true,
        message: 'Join request rejected successfully'
      });
      
    } catch (error) {
      await t.rollback();
      log.error(`Error rejecting join request ${requestId}:`, error);
      throw error;
    }
  })
);

module.exports = router;

import express from 'express';
import { param } from 'express-validator';
import { requireAuth } from '../middleware/auth';
import { catchAsync, ApiError } from '../middleware/errorHandler';
import { UserTeam, Notification } from '../models';
import sequelize from '../config/db';
import { Op } from 'sequelize';
import log from '../utils/log';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Teams
 *   description: Team management
 */

/**
 * @swagger
 * /api/teams/{id}/join-requests:
 *   get:
 *     summary: Get join requests for a team
 *     tags: [Teams]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Team ID
 *     responses:
 *       200:
 *         description: Returns the join requests for the team
 *       403:
 *         description: Forbidden - not a team manager
 */
router.get('/:id/join-requests',
  requireAuth,
  validate([
    param('id').isInt().withMessage('Team ID must be an integer')
  ]),
  catchAsync(async (req, res) => {
    const { id: teamId } = req.params;
    log.info(`TEAMROUTES/CORE (GET /:id/join-requests): Fetching join requests for team ${teamId}`);
    
    try {
      // Check if user is a team manager
      const userTeam = await UserTeam.findOne({
        where: {
          userId: req.user.userId,
          teamId,
          role: { [Op.in]: ['manager', 'assistant_manager'] }
        }
      });
      
      if (!userTeam) {
        log.warn(`User ${req.user.userId} attempted to view join requests for team ${teamId} without manager permissions`);
        throw new ApiError('Only team managers can view join requests', 403, 'FORBIDDEN');
      }
      
      // Get join request notifications for this team
      const Notification = require('../../models/Notification');
      
      const notifications = await Notification.findAll({
        where: {
          teamId: teamId,
          type: 'join_request',
          status: { [Op.in]: ['unread', 'read'] }
        },
        order: [['createdAt', 'DESC']],
        limit: 50
      });
      
      log.info(`Found ${notifications.length} join request notifications for team ${teamId}`);
      
      // Get user data for each request with better error handling
      const requestsWithUserData = [];
      const User = require('../../models/User');
      
      for (const request of notifications) {
        try {
          const user = await User.findByPk(request.senderUserId, {
            attributes: ['id', 'firstName', 'lastName', 'email', 'profileImageUrl']
          });
          
          if (user) {
            requestsWithUserData.push({
              id: request.id,
              senderName: `${user.firstName} ${user.lastName}`.trim(),
              senderEmail: user.email,
              senderAvatarUrl: user.profileImageUrl,
              message: request.message,
              createdAt: request.createdAt,
              metadata: request.metadata || {},
              status: request.status,
              senderUserId: request.senderUserId
            });
          } else {
            log.warn(`User ${request.senderUserId} not found for request ${request.id}`);
            requestsWithUserData.push({
              id: request.id,
              senderName: 'Unknown User',
              senderEmail: '',
              senderAvatarUrl: null,
              message: request.message,
              createdAt: request.createdAt,
              metadata: request.metadata || {},
              status: request.status,
              senderUserId: request.senderUserId
            });
          }
        } catch (userError) {
          log.error(`Error fetching user ${request.senderUserId} for request ${request.id}:`, userError);
          requestsWithUserData.push({
            id: request.id,
            senderName: 'Unknown User',
            senderEmail: '',
            senderAvatarUrl: null,
            message: request.message,
            createdAt: request.createdAt,
            metadata: request.metadata || {},
            status: request.status,
            senderUserId: request.senderUserId
          });
        }
      }
      
      log.info(`Successfully processed ${requestsWithUserData.length} join requests for team ${teamId}`);
      
      return sendSafeJson(res, {
        success: true,
        requests: requestsWithUserData
      });
      
    } catch (error) {
      log.error(`Error fetching join requests for team ${teamId}:`, error);
      
      if (error instanceof ApiError) {
        throw error;
      }
      
      throw new ApiError('Failed to fetch join requests', 500, 'INTERNAL_SERVER_ERROR');
    }
  })
);

/**
 * @swagger
 * /api/teams/join-requests/{requestId}/accept:
 *   post:
 *     summary: Accept a join request
 *     tags: [Teams]
 *     parameters:
 *       - in: path
 *         name: requestId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Join request ID
 *     responses:
 *       200:
 *         description: Join request accepted
 *       403:
 *         description: Forbidden - not a team manager
 *       404:
 *         description: Not found - join request not found
 */
router.post('/join-requests/:requestId/accept',
  requireAuth,
  validate([
    param('requestId').isInt().withMessage('Request ID must be an integer')
  ]),
  catchAsync(async (req, res) => {
    const { requestId } = req.params;
    log.info(`TEAMROUTES/CORE (POST /join-requests/:requestId/accept): Accepting join request ${requestId}`);
    
    try {
      const Notification = require('../../models/Notification');
      const UserTeam = require('../../models/UserTeam');
      const Player = require('../../models/Player');
      
      // Get the notification
      const notification = await Notification.findByPk(requestId);
      
      if (!notification || notification.type !== 'join_request') {
        throw new ApiError('Join request not found', 404, 'NOT_FOUND');
      }
      
      // Check if user is a team manager
      const userTeam = await UserTeam.findOne({
        where: {
          userId: req.user.userId,
          teamId: notification.teamId,
          role: { [Op.in]: ['manager', 'assistant_manager'] }
        }
      });
      
      if (!userTeam) {
        throw new ApiError('Only team managers can accept join requests', 403, 'FORBIDDEN');
      }
      
      const transaction = await sequelize.transaction();
      
      try {
        // Check if user is already a team member
        const existingMember = await UserTeam.findOne({
          where: {
            userId: notification.senderUserId,
            teamId: notification.teamId
          },
          transaction
        });
        
        if (existingMember) {
          await transaction.rollback();
          throw new ApiError('User is already a member of this team', 409, 'ALREADY_MEMBER');
        }
        
        // Add user to team
        await UserTeam.create({
          userId: notification.senderUserId,
          teamId: notification.teamId,
          role: 'athlete'
        }, { transaction });
        
        // Create player profile if metadata contains player data
        if (notification.metadata && notification.metadata.playerData) {
          try {
            const existingPlayer = await Player.findOne({
              where: { userId: notification.senderUserId },
              transaction
            });
            
            if (!existingPlayer) {
              const playerData = {
                userId: notification.senderUserId,
                teamId: notification.teamId,
                position: notification.metadata.playerData.position || 'midfielder',
                height: notification.metadata.playerData.height || null,
                weight: notification.metadata.playerData.weight || null,
                preferredFoot: notification.metadata.playerData.preferredFoot || null,
                jerseyNumber: notification.metadata.playerData.jerseyNumber || null,
                status: 'active'
              };
              
              const newPlayer = await Player.create(playerData, { transaction });
              log.info(`Created player profile for user ${notification.senderUserId}:`, newPlayer.id);
            }
          } catch (playerError) {
            log.warn(`Failed to create player profile:`, playerError);
            // Don't fail the transaction for player creation issues
          }
        }
        
        // Mark notification as accepted
        await notification.update({
          status: 'accepted',
          updatedAt: new Date()
        }, { transaction });
        
        await transaction.commit();
        
        log.info(`Successfully accepted join request ${requestId} for team ${notification.teamId}`);
        
        return sendSafeJson(res, {
          success: true,
          message: 'Join request accepted successfully'
        });
        
      } catch (error) {
        await transaction.rollback();
        throw error;
      }
      
    } catch (error) {
      log.error(`Error accepting join request ${requestId}:`, error);
      
      if (error instanceof ApiError) {
        throw error;
      }
      
      throw new ApiError('Failed to accept join request', 500, 'INTERNAL_SERVER_ERROR');
    }
  })
);

/**
 * @swagger
 * /api/teams/join-requests/{requestId}/reject:
 *   post:
 *     summary: Reject a join request
 *     tags: [Teams]
 *     parameters:
 *       - in: path
 *         name: requestId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Join request ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 description: Reason for rejection
 *     responses:
 *       200:
 *         description: Join request rejected
 *       403:
 *         description: Forbidden - not a team manager
 *       404:
 *         description: Not found - join request not found
 */
router.post('/join-requests/:requestId/reject',
  requireAuth,
  validate([
    param('requestId').isInt().withMessage('Request ID must be an integer')
  ]),
  catchAsync(async (req, res) => {
    const { requestId } = req.params;
    const { reason } = req.body;
    log.info(`TEAMROUTES/CORE (POST /join-requests/:requestId/reject): Rejecting join request ${requestId}`);
    
    try {
      const Notification = require('../../models/Notification');
      const UserTeam = require('../../models/UserTeam');
      
      // Get the notification
      const notification = await Notification.findByPk(requestId);
      
      if (!notification || notification.type !== 'join_request') {
        throw new ApiError('Join request not found', 404, 'NOT_FOUND');
      }
      
      // Check if user is a team manager
      const userTeam = await UserTeam.findOne({
        where: {
          userId: req.user.userId,
          teamId: notification.teamId,
          role: { [Op.in]: ['manager', 'assistant_manager'] }
        }
      });
      
      if (!userTeam) {
        throw new ApiError('Only team managers can reject join requests', 403, 'FORBIDDEN');
      }
      
      // Mark notification as rejected
      await notification.update({
        status: 'rejected',
        metadata: {
          ...notification.metadata,
          rejectionReason: reason || 'No reason provided'
        },
        updatedAt: new Date()
      });
      
      log.info(`Successfully rejected join request ${requestId} for team ${notification.teamId}`);
      
      return sendSafeJson(res, {
        success: true,
        message: 'Join request rejected successfully'
      });
      
    } catch (error) {
      log.error(`Error rejecting join request ${requestId}:`, error);
      
      if (error instanceof ApiError) {
        throw error;
      }
      
      throw new ApiError('Failed to reject join request', 500, 'INTERNAL_SERVER_ERROR');
    }
  })
);

export default router;
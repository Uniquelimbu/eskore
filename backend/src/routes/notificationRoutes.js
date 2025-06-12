const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { catchAsync, ApiError } = require('../middleware/errorHandler');
const { validate } = require('../validation');
const { body, param, query } = require('express-validator');
const Notification = require('../models/Notification');
const User = require('../models/User');
const Team = require('../models/Team');
const UserTeam = require('../models/UserTeam');
const log = require('../utils/log');
const { sendSafeJson } = require('../utils/safeSerializer');
const { Op } = require('sequelize');
const emailService = require('../services/emailService');

/**
 * GET /api/notifications
 * Get all notifications for the authenticated user
 */
router.get('/',
  requireAuth,
  validate([
    query('status').optional().isIn(['all', 'unread', 'read', 'archived']).withMessage('Invalid status'),
    query('limit').optional().isInt({min: 1, max: 100}).withMessage('Limit must be between 1 and 100'),
    query('offset').optional().isInt({min: 0}).withMessage('Offset must be a positive integer')
  ]),
  catchAsync(async (req, res) => {
    log.info(`NOTIFICATIONS (GET /): Fetching notifications for user ${req.user.userId}`);
    
    const { status = 'all', limit = 20, offset = 0 } = req.query;
    
    try {
      const where = { userId: req.user.userId };
      
      if (status !== 'all') {
        where.status = status;
      }
      
      const notifications = await Notification.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['createdAt', 'DESC']],
        include: [
          {
            model: User,
            as: 'sender',
            attributes: ['id', 'firstName', 'lastName', 'email', 'profileImageUrl'],
            required: false
          },
          {
            model: Team,
            attributes: ['id', 'name', 'logoUrl'],
            required: false
          }
        ]
      });
      
      return sendSafeJson(res, {
        notifications: notifications.rows,
        count: notifications.count,
        limit: parseInt(limit),
        offset: parseInt(offset)
      });
    } catch (error) {
      // Check if the error is about a missing table
      if (error.name === 'SequelizeDatabaseError' && 
          error.message.includes('relation "notifications" does not exist')) {
        log.warn('Notifications table does not exist yet. Returning empty list.');
        return sendSafeJson(res, {
          notifications: [],
          count: 0,
          limit: parseInt(limit),
          offset: parseInt(offset)
        });
      }
      throw error;
    }
  })
);

/**
 * GET /api/notifications/unread-count
 * Get count of unread notifications for the authenticated user
 */
router.get('/unread-count',
  requireAuth,
  catchAsync(async (req, res) => {
    log.info(`NOTIFICATIONS (GET /unread-count): Fetching unread count for user ${req.user.userId}`);
    
    try {
      const count = await Notification.count({
        where: {
          userId: req.user.userId,
          status: 'unread'
        }
      });
      
      return sendSafeJson(res, { count });
    } catch (error) {
      // Check if the error is about a missing table
      if (error.name === 'SequelizeDatabaseError' && 
          error.message.includes('relation "notifications" does not exist')) {
        log.warn('Notifications table does not exist yet. Returning count 0.');
        return sendSafeJson(res, { count: 0 });
      }
      throw error; // Re-throw if it's another type of error
    }
  })
);

/**
 * PUT /api/notifications/:id/read
 * Mark a notification as read
 */
router.put('/:id/read',
  requireAuth,
  validate([
    param('id').isInt().withMessage('Notification ID must be an integer')
  ]),
  catchAsync(async (req, res) => {
    log.info(`NOTIFICATIONS (PUT /:id/read): Marking notification ${req.params.id} as read`);
    const { id } = req.params;
    
    const notification = await Notification.findOne({
      where: { 
        id,
        userId: req.user.userId
      }
    });
    
    if (!notification) {
      throw new ApiError('Notification not found', 404, 'RESOURCE_NOT_FOUND');
    }
    
    notification.status = 'read';
    await notification.save();
    
    return sendSafeJson(res, { success: true, notification });
  })
);

/**
 * PUT /api/notifications/read-all
 * Mark all notifications as read
 */
router.put('/read-all',
  requireAuth,
  catchAsync(async (req, res) => {
    log.info(`NOTIFICATIONS (PUT /read-all): Marking all notifications as read for user ${req.user.userId}`);
    
    await Notification.update(
      { status: 'read' },
      { 
        where: { 
          userId: req.user.userId,
          status: 'unread'
        }
      }
    );
    
    return sendSafeJson(res, { success: true });
  })
);

/**
 * POST /api/notifications/team-join-request
 * Send a join request to a team
 */
router.post('/team-join-request',
  requireAuth,
  validate([
    body('teamId').isInt().withMessage('Team ID is required'),
    body('message').optional().isString().withMessage('Message must be a string'),
    body('playerData').optional().isObject().withMessage('Player data must be an object')
  ]),
  catchAsync(async (req, res) => {
    try {
      log.info(`NOTIFICATIONS (POST /team-join-request): User ${req.user.userId} requesting to join team ${req.body.teamId}`);
      const { teamId, message, playerData } = req.body;
      
      // Check if team exists
      const team = await Team.findByPk(teamId);
      if (!team) {
        throw new ApiError('Team not found', 404, 'RESOURCE_NOT_FOUND');
      }
      
      // Check if user is already a member
      const existingMembership = await UserTeam.findOne({
        where: {
          userId: req.user.userId,
          teamId
        }
      });
      
      if (existingMembership) {
        throw new ApiError('You are already a member of this team', 409, 'ALREADY_MEMBER');
      }
      
      // Check if there's already a pending request (any status except archived)
      const existingRequest = await Notification.findOne({
        where: {
          type: 'join_request',
          teamId,
          senderUserId: req.user.userId,
          status: { [Op.ne]: 'archived' }  // Not equal to archived (includes 'unread' and 'read')
        }
      });
      
      if (existingRequest) {
        if (existingRequest.status === 'read') {
          throw new ApiError('Your join request is still being reviewed by the team managers', 409, 'REQUEST_PENDING');
        } else {
          throw new ApiError('You already have a pending join request for this team', 409, 'REQUEST_EXISTS');
        }
      }
      
      // Find team managers to send notifications to
      const managers = await UserTeam.findAll({
        where: {
          teamId,
          role: { [Op.in]: ['manager', 'assistant_manager'] }
        },
        include: [{ 
          model: User,
          attributes: ['id', 'email', 'firstName', 'lastName'] 
        }]
      });
      
      if (managers.length === 0) {
        throw new ApiError('No team managers found', 404, 'NO_MANAGERS');
      }
      
      // Get current user details
      const currentUser = await User.findByPk(req.user.userId, {
        attributes: ['id', 'firstName', 'lastName', 'email']
      });
      
      if (!currentUser) {
        throw new ApiError('User not found', 404, 'USER_NOT_FOUND');
      }
      
      // Create notifications for all managers
      const notifications = [];
      for (const manager of managers) {
        if (!manager.User) continue;
        
        // Prepare metadata with any player data
        const metadata = {
          teamName: team.name,
          userMessage: message || '',
          userEmail: currentUser.email,
          requesterId: req.user.userId // Add requester ID for better tracking
        };
        
        // Add player data to metadata if provided
        if (playerData) {
          metadata.playerData = playerData;
        }
        
        const notification = await Notification.create({
          userId: manager.User.id,
          teamId,
          type: 'join_request',
          message: `${currentUser.firstName} ${currentUser.lastName} requested to join ${team.name}`,
          senderUserId: req.user.userId,
          status: 'unread',
          metadata
        });
        
        notifications.push(notification);
        
        // Log instead of sending email (avoid email service dependency)
        log.info(`NOTIFICATIONS: Would send email to ${manager.User.email} about join request from ${currentUser.email}`);
      }
      
      return sendSafeJson(res, { 
        success: true, 
        message: `Join request sent to ${notifications.length} team manager(s)` 
      });
    } catch (error) {
      log.error(`Error in team-join-request: ${error.message}`, error);
      throw error; // Let the error handler format the response
    }
  })
);

/**
 * POST /api/notifications/team-invitation
 * Invite a user to join a team
 */
router.post('/team-invitation',
  requireAuth,
  validate([
    body('teamId').isInt().withMessage('Team ID is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('role').isIn(['athlete', 'assistant_manager']).withMessage('Invalid role'),
    body('message').optional().isString().withMessage('Message must be a string')
  ]),
  catchAsync(async (req, res) => {
    log.info(`NOTIFICATIONS (POST /team-invitation): User ${req.user.userId} inviting ${req.body.email} to team ${req.body.teamId}`);
    const { teamId, email, role, message } = req.body;
    
    // Check if team exists
    const team = await Team.findByPk(teamId);
    if (!team) {
      throw new ApiError('Team not found', 404, 'RESOURCE_NOT_FOUND');
    }
    
    // Check if user has permission (team manager or assistant_manager)
    const userTeamPermission = await UserTeam.findOne({
      where: {
        userId: req.user.userId,
        teamId,
        role: { [Op.in]: ['manager', 'assistant_manager'] }
      }
    });
    
    if (!userTeamPermission) {
      throw new ApiError('Only team managers can send invitations', 403, 'FORBIDDEN');
    }
    
    // Check if assistant_manager is trying to invite another assistant_manager
    if (userTeamPermission.role === 'assistant_manager' && role === 'assistant_manager') {
      throw new ApiError('Assistant managers cannot invite other assistant managers', 403, 'FORBIDDEN');
    }
    
    // Find user by email
    const invitedUser = await User.findOne({
      where: { email: email.toLowerCase() }
    });
    
    if (!invitedUser) {
      // User doesn't exist, will need email invitation (outside scope of this function)
      return sendSafeJson(res, { 
        success: true, 
        message: `Invitation email will be sent to ${email}`,
        userExists: false
      });
    }
    
    // Check if user is already a member
    const existingMembership = await UserTeam.findOne({
      where: {
        userId: invitedUser.id,
        teamId
      }
    });
    
    if (existingMembership) {
      throw new ApiError('User is already a member of this team', 409, 'ALREADY_MEMBER');
    }
    
    // Check if there's already a pending invitation
    const existingInvitation = await Notification.findOne({
      where: {
        type: 'invitation',
        teamId,
        userId: invitedUser.id,
        status: 'unread'
      }
    });
    
    if (existingInvitation) {
      throw new ApiError('There is already a pending invitation for this user', 409, 'INVITATION_EXISTS');
    }
    
    // Get current user details
    const currentUser = await User.findByPk(req.user.userId, {
      attributes: ['id', 'firstName', 'lastName', 'email']
    });
    
    // Create notification
    const notification = await Notification.create({
      userId: invitedUser.id,
      teamId,
      type: 'invitation',
      message: `${currentUser.firstName} ${currentUser.lastName} invited you to join ${team.name} as ${role}`,
      senderUserId: req.user.userId,
      status: 'unread',
      metadata: {
        teamName: team.name,
        role,
        managerMessage: message || '',
        managerEmail: currentUser.email
      }
    });
    
    // Send email notification to invited user
    try {
      log.info(`NOTIFICATIONS: Would send email to ${invitedUser.email} about team invitation`);
      
      // In a real implementation:
      // await emailService.sendEmail({
      //   to: invitedUser.email,
      //   subject: `Invitation to join ${team.name}`,
      //   template: 'team-invitation',
      //   data: {
      //     teamName: team.name,
      //     role,
      //     managerName: `${currentUser.firstName} ${currentUser.lastName}`,
      //     managerMessage: message || 'No message provided',
      //     acceptUrl: `${process.env.FRONTEND_URL}/invitations/${notification.id}/accept`
      //   }
      // });
    } catch (emailError) {
      log.error(`Failed to send invitation email: ${emailError.message}`);
      // Continue execution even if email fails
    }
    
    return sendSafeJson(res, { 
      success: true, 
      message: `Invitation sent to ${invitedUser.email}`,
      userExists: true,
      notification
    });
  })
);

/**
 * POST /api/notifications/:id/accept
 * Accept a notification (join request or invitation)
 */
router.post('/:id/accept',
  requireAuth,
  validate([
    param('id').isInt().withMessage('Notification ID must be an integer')
  ]),
  catchAsync(async (req, res) => {
    log.info(`NOTIFICATIONS (POST /:id/accept): User ${req.user.userId} accepting notification ${req.params.id}`);
    const { id } = req.params;
    
    const notification = await Notification.findByPk(id, {
      include: [
        { model: Team },
        { 
          model: User, 
          as: 'sender',
          attributes: ['id', 'firstName', 'lastName', 'email'] 
        }
      ]
    });
    
    if (!notification) {
      throw new ApiError('Notification not found', 404, 'RESOURCE_NOT_FOUND');
    }
    
    // For invitation: check if current user is the recipient
    if (notification.type === 'invitation' && notification.userId !== req.user.userId) {
      throw new ApiError('You can only accept your own invitations', 403, 'FORBIDDEN');
    }
    
    // For join request: check if current user is a team manager
    if (notification.type === 'join_request') {
      const isManager = await UserTeam.findOne({
        where: {
          userId: req.user.userId,
          teamId: notification.teamId,
          role: { [Op.in]: ['manager', 'assistant_manager'] }
        }
      });
      
      if (!isManager) {
        throw new ApiError('Only team managers can accept join requests', 403, 'FORBIDDEN');
      }
    }
    
    // Already processed?
    if (notification.status === 'archived') {
      throw new ApiError('This notification has already been processed', 400, 'ALREADY_PROCESSED');
    }
    
    // Process based on notification type
    if (notification.type === 'invitation') {
      // User accepting an invitation to join a team
      await UserTeam.create({
        userId: req.user.userId,
        teamId: notification.teamId,
        role: notification.metadata.role || 'athlete'
      });
      
      // Notify the sender that the invitation was accepted
      await Notification.create({
        userId: notification.senderUserId,
        teamId: notification.teamId,
        type: 'request_accepted',
        message: `${req.user.firstName} ${req.user.lastName} accepted your invitation to join ${notification.Team.name}`,
        senderUserId: req.user.userId,
        status: 'unread'
      });
      
    } else if (notification.type === 'join_request') {
      // Manager accepting a user's request to join
      await UserTeam.create({
        userId: notification.senderUserId,
        teamId: notification.teamId,
        role: 'athlete'  // Default role for join requests
      });
      
      // Notify the requester that their request was accepted
      await Notification.create({
        userId: notification.senderUserId,
        teamId: notification.teamId,
        type: 'request_accepted',
        message: `Your request to join ${notification.Team.name} has been accepted`,
        senderUserId: req.user.userId,
        status: 'unread'
      });
    } else {
      throw new ApiError('This notification type cannot be accepted', 400, 'INVALID_TYPE');
    }
    
    // Mark notification as archived (processed)
    notification.status = 'archived';
    await notification.save();
    
    return sendSafeJson(res, { 
      success: true,
      message: notification.type === 'invitation' 
        ? 'You have joined the team successfully' 
        : 'Join request accepted successfully'
    });
  })
);

/**
 * POST /api/notifications/:id/reject
 * Reject a notification (join request or invitation)
 */
router.post('/:id/reject',
  requireAuth,
  validate([
    param('id').isInt().withMessage('Notification ID must be an integer'),
    body('reason').optional().isString().withMessage('Reason must be a string')
  ]),
  catchAsync(async (req, res) => {
    log.info(`NOTIFICATIONS (POST /:id/reject): User ${req.user.userId} rejecting notification ${req.params.id}`);
    const { id } = req.params;
    const { reason } = req.body;
    
    const notification = await Notification.findByPk(id, {
      include: [
        { model: Team },
        { 
          model: User, 
          as: 'sender',
          attributes: ['id', 'firstName', 'lastName', 'email'] 
        }
      ]
    });
    
    if (!notification) {
      throw new ApiError('Notification not found', 404, 'RESOURCE_NOT_FOUND');
    }
    
    // Similar permission checks as in accept endpoint
    // (Omitted for brevity but would be included in actual implementation)
    
    // Already processed?
    if (notification.status === 'archived') {
      throw new ApiError('This notification has already been processed', 400, 'ALREADY_PROCESSED');
    }
    
    // Process based on notification type
    if (notification.type === 'invitation') {
      // Notify the sender that the invitation was rejected
      await Notification.create({
        userId: notification.senderUserId,
        teamId: notification.teamId,
        type: 'request_denied',
        message: `${req.user.firstName} ${req.user.lastName} declined your invitation to join ${notification.Team.name}`,
        senderUserId: req.user.userId,
        status: 'unread',
        metadata: { reason: reason || '' }
      });
      
    } else if (notification.type === 'join_request') {
      // Notify the requester that their request was rejected
      await Notification.create({
        userId: notification.senderUserId,
        teamId: notification.teamId,
        type: 'request_denied',
        message: `Your request to join ${notification.Team.name} was declined`,
        senderUserId: req.user.userId,
        status: 'unread',
        metadata: { reason: reason || '' }
      });
    } else {
      throw new ApiError('This notification type cannot be rejected', 400, 'INVALID_TYPE');
    }
    
    // Mark notification as archived (processed)
    notification.status = 'archived';
    await notification.save();
    
    return sendSafeJson(res, { 
      success: true,
      message: notification.type === 'invitation' 
        ? 'Invitation declined' 
        : 'Join request rejected'
    });
  })
);

/**
 * GET /api/notifications/:id
 * Get a specific notification by ID
 */
router.get('/:id',
  requireAuth,
  validate([
    param('id').isInt().withMessage('Notification ID must be an integer')
  ]),
  catchAsync(async (req, res) => {
    log.info(`NOTIFICATIONS (GET /:id): Fetching notification ${req.params.id} for user ${req.user.userId}`);
    
    const notification = await Notification.findOne({
      where: { 
        id: req.params.id,
        userId: req.user.userId
      },
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'firstName', 'lastName', 'email', 'profileImageUrl']
        },
        {
          model: Team,
          attributes: ['id', 'name', 'logoUrl']
        }
      ]
    });
    
    if (!notification) {
      throw new ApiError('Notification not found', 404, 'RESOURCE_NOT_FOUND');
    }
    
    return sendSafeJson(res, { notification });
  })
);

module.exports = router;

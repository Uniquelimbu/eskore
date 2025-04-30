const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Role = require('../models/Role');
const UserRole = require('../models/UserRole');
const { body, validationResult } = require('express-validator');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { catchAsync, ApiError } = require('../middleware/errorHandler');
const { sanitizeUserData } = require('../utils/userUtils');
const { sendSafeJson } = require('../utils/safeSerializer');

/**
 * GET /api/users
 * Get a list of users (admin only)
 */
router.get('/', requireAdmin, catchAsync(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;
  
  const query = {
    attributes: ['id', 'email', 'firstName', 'lastName', 'role', 'status', 'createdAt', 'lastLogin'],
    limit,
    offset,
    order: [['createdAt', 'DESC']],
    include: [{
      model: Role,
      through: { attributes: [] },
      attributes: ['name']
    }]
  };
  
  // Add filter by role if specified
  if (req.query.role) {
    query.where = { role: req.query.role };
  }
  
  // Add search filter if specified
  if (req.query.search) {
    const searchTerm = `%${req.query.search}%`;
    query.where = {
      ...query.where,
      [Op.or]: [
        { email: { [Op.iLike]: searchTerm } },
        { firstName: { [Op.iLike]: searchTerm } },
        { lastName: { [Op.iLike]: searchTerm } }
      ]
    };
  }
  
  const { count, rows } = await User.findAndCountAll(query);
  
  // Sanitize each user
  const sanitizedUsers = rows.map(user => {
    const userData = user.toJSON();
    const sanitized = sanitizeUserData(userData, userData.role);
    
    // Add roles from the Roles relationship
    if (userData.Roles && userData.Roles.length > 0) {
      sanitized.roles = userData.Roles.map(role => role.name);
    }
    
    return sanitized;
  });
  
  return sendSafeJson(res, {
    users: sanitizedUsers,
    pagination: {
      total: count,
      page,
      limit,
      pages: Math.ceil(count / limit)
    }
  });
}));

/**
 * GET /api/users/:id
 * Get a single user by id (admin only or self)
 */
router.get('/:id', requireAuth, catchAsync(async (req, res) => {
  const userId = parseInt(req.params.id);
  
  // Check if user is requesting their own profile or is an admin
  if (userId !== req.user.id && req.user.role !== 'admin') {
    throw new ApiError('Forbidden - You can only view your own profile', 403, 'FORBIDDEN');
  }
  
  const user = await User.findByPk(userId, {
    attributes: ['id', 'email', 'firstName', 'lastName', 'middleName', 'dob', 'country', 
                 'height', 'position', 'role', 'status', 'lastLogin', 'createdAt'],
    include: [{
      model: Role,
      through: { attributes: [] },
      attributes: ['name']
    }]
  });
  
  if (!user) {
    throw new ApiError('User not found', 404, 'USER_NOT_FOUND');
  }
  
  const userData = user.toJSON();
  const sanitized = sanitizeUserData(userData, userData.role);
  
  // Add roles from the Roles relationship
  if (userData.Roles && userData.Roles.length > 0) {
    sanitized.roles = userData.Roles.map(role => role.name);
  }
  
  return sendSafeJson(res, sanitized);
}));

/**
 * PATCH /api/users/:id
 * Update a user (self or admin only)
 */
const validateUserUpdate = [
  body('firstName').optional().notEmpty().withMessage('First name cannot be empty'),
  body('lastName').optional().notEmpty().withMessage('Last name cannot be empty'),
  body('country').optional().isString().withMessage('Country must be a string'),
  body('height').optional().isFloat({ min: 0 }).withMessage('Height must be a positive number'),
  body('position').optional().isString().withMessage('Position must be a string'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Validation failed',
          fields: errors.mapped()
        }
      });
    }
    next();
  }
];

router.patch('/:id', requireAuth, validateUserUpdate, catchAsync(async (req, res) => {
  const userId = parseInt(req.params.id);
  
  // Check if user is updating their own profile or is an admin
  if (userId !== req.user.id && req.user.role !== 'admin') {
    throw new ApiError('Forbidden - You can only update your own profile', 403, 'FORBIDDEN');
  }
  
  // Only allow updating specific fields
  const allowedFields = ['firstName', 'lastName', 'middleName', 'country', 'height', 'position'];
  const updateData = {};
  
  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) {
      updateData[field] = req.body[field];
    }
  });
  
  // Admin-only fields
  if (req.user.role === 'admin') {
    if (req.body.status) updateData.status = req.body.status;
    if (req.body.role) updateData.role = req.body.role;
  }
  
  const user = await User.findByPk(userId);
  
  if (!user) {
    throw new ApiError('User not found', 404, 'USER_NOT_FOUND');
  }
  
  await user.update(updateData);
  
  // Update roles if provided (admin only)
  if (req.user.role === 'admin' && req.body.roles && Array.isArray(req.body.roles)) {
    // Delete existing roles
    await UserRole.destroy({ where: { userId } });
    
    // Add new roles
    if (req.body.roles.length > 0) {
      const roles = await Role.findAll({
        where: { name: req.body.roles }
      });
      
      if (roles.length > 0) {
        const userRoles = roles.map(role => ({
          userId,
          roleId: role.id
        }));
        await UserRole.bulkCreate(userRoles);
      }
    }
  }
  
  // Fetch updated user with roles
  const updatedUser = await User.findByPk(userId, {
    attributes: ['id', 'email', 'firstName', 'lastName', 'middleName', 'dob', 'country', 
                 'height', 'position', 'role', 'status', 'lastLogin'],
    include: [{
      model: Role,
      through: { attributes: [] },
      attributes: ['name']
    }]
  });
  
  const userData = updatedUser.toJSON();
  const sanitized = sanitizeUserData(userData, userData.role);
  
  // Add roles from the Roles relationship
  if (userData.Roles && userData.Roles.length > 0) {
    sanitized.roles = userData.Roles.map(role => role.name);
  }
  
  return sendSafeJson(res, {
    success: true,
    user: sanitized
  });
}));

/**
 * POST /api/users/:id/change-password
 * Change password
 */
router.post('/:id/change-password', requireAuth, 
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
  ],
  catchAsync(async (req, res) => {
    const userId = parseInt(req.params.id);
    
    // Only allow changing own password unless admin
    if (userId !== req.user.id && req.user.role !== 'admin') {
      throw new ApiError('Forbidden - You can only change your own password', 403, 'FORBIDDEN');
    }
    
    const { currentPassword, newPassword } = req.body;
    
    const user = await User.findByPk(userId);
    
    if (!user) {
      throw new ApiError('User not found', 404, 'USER_NOT_FOUND');
    }
    
    // Skip current password check if admin is changing someone else's password
    if (userId === req.user.id || req.user.role !== 'admin') {
      // Verify current password
      const isPasswordValid = await user.validatePassword(currentPassword);
      
      if (!isPasswordValid) {
        throw new ApiError('Current password is incorrect', 400, 'INVALID_PASSWORD');
      }
    }
    
    // Update password
    await user.update({ password: newPassword });
    
    return sendSafeJson(res, {
      success: true,
      message: 'Password updated successfully'
    });
  })
);

module.exports = router;

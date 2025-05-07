const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { catchAsync, ApiError } = require('../middleware/errorHandler');
const { validate, schemas } = require('../validation');
const User = require('../models/User');
const { sendSafeJson } = require('../utils/safeSerializer');
const { sanitizeUserData } = require('../utils/userUtils');

/**
 * GET /api/users/:id
 * Get user profile
 */
router.get('/:id', 
  requireAuth, 
  validate(schemas.user.userIdParam), 
  catchAsync(async (req, res) => {
    const { id } = req.params;
    
    // Users can only see their own profile unless they're admin
    if (parseInt(id) !== req.user.id && !req.user.roles.includes('admin')) {
      throw new ApiError('Forbidden - You can only view your own profile', 403, 'FORBIDDEN');
    }

    const user = await User.findByPk(id);
    if (!user) {
      throw new ApiError('User not found', 404, 'RESOURCE_NOT_FOUND');
    }

    const isPublicProfile = false; // This is a private view since we've authenticated
    const userJson = user.toJSON();
    const sanitizedUser = sanitizeUserData(userJson, req.user.role, isPublicProfile);

    return sendSafeJson(res, { user: sanitizedUser });
  })
);

/**
 * PATCH /api/users/:id
 * Update user profile
 */
router.patch('/:id', 
  requireAuth, 
  validate([
    ...schemas.user.userIdParam,
    ...schemas.user.updateProfileSchema
  ]), 
  catchAsync(async (req, res) => {
    const { id } = req.params;
    
    // Users can only update their own profile unless they're admin
    if (parseInt(id) !== req.user.id && !req.user.roles.includes('admin')) {
      throw new ApiError('Forbidden - You can only update your own profile', 403, 'FORBIDDEN');
    }

    const user = await User.findByPk(id);
    if (!user) {
      throw new ApiError('User not found', 404, 'RESOURCE_NOT_FOUND');
    }

    // Update only the fields that were provided
    const fieldsToUpdate = [
      'firstName', 'lastName', 'dob', 'country', 
      'height', 'position', 'bio'
    ];

    fieldsToUpdate.forEach(field => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    });

    await user.save();

    const userJson = user.toJSON();
    const sanitizedUser = sanitizeUserData(userJson, req.user.role, false);

    return sendSafeJson(res, { 
      success: true,
      message: 'Profile updated successfully',
      user: sanitizedUser
    });
  })
);

/**
 * POST /api/users/:id/change-password
 * Change user password
 */
router.post('/:id/change-password', 
  requireAuth, 
  validate([
    ...schemas.user.userIdParam,
    ...schemas.user.changePasswordSchema
  ]), 
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;
    
    // Users can only change their own password
    if (parseInt(id) !== req.user.id) {
      throw new ApiError('Forbidden - You can only change your own password', 403, 'FORBIDDEN');
    }

    const user = await User.findByPk(id);
    if (!user) {
      throw new ApiError('User not found', 404, 'RESOURCE_NOT_FOUND');
    }

    // Verify current password
    const isPasswordValid = await user.validatePassword(currentPassword);
    if (!isPasswordValid) {
      throw new ApiError('Current password is incorrect', 401, 'INVALID_CREDENTIALS');
    }

    // Update password (model hooks will handle hashing)
    user.password = newPassword;
    await user.save();

    return sendSafeJson(res, { 
      success: true,
      message: 'Password changed successfully'
    });
  })
);

module.exports = router;

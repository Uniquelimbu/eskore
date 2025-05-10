const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { catchAsync, ApiError } = require('../middleware/errorHandler');
const { validate, schemas } = require('../validation');
const User = require('../models/User');
const { sendSafeJson } = require('../utils/safeSerializer');
const { sanitizeUserData } = require('../utils/userUtils');

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User profile management
 */

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user profile by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the user to get.
 *     responses:
 *       200:
 *         description: User profile data.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/UserOutput' # Assuming a UserOutput schema for sanitized user data
 *       400:
 *         description: Invalid ID supplied
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (e.g., trying to access another user's profile without admin rights)
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.get('/:id', 
  requireAuth, 
  validate(schemas.user.userIdParam), 
  catchAsync(async (req, res) => {
    const { id } = req.params;
    
    // Users can only see their own profile unless they're admin
    if (parseInt(id) !== req.user.userId && !req.user.roles.includes('admin')) {
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
 * @swagger
 * /api/users/{id}:
 *   patch:
 *     summary: Update user profile by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the user to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserProfileInput' # Assuming an input schema for profile updates
 *     responses:
 *       200:
 *         description: Profile updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/UserOutput'
 *       400:
 *         description: Invalid input or ID
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (e.g., trying to update another user's profile without admin rights)
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
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
    if (parseInt(id) !== req.user.userId && !req.user.roles.includes('admin')) {
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
 * @swagger
 * /api/users/{id}/change-password:
 *   post:
 *     summary: Change user's password
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the user whose password to change.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 format: password
 *               newPassword:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Password changed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid input (e.g., new password doesn't meet criteria)
 *       401:
 *         description: Unauthorized (e.g., current password incorrect)
 *       403:
 *         description: Forbidden (e.g., trying to change another user's password)
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
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
    if (parseInt(id) !== req.user.userId) {
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

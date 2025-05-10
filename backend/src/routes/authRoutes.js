const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth');
const { catchAsync, ApiError } = require('../middleware/errorHandler');
const { failedLoginLimiter } = require('../utils/rateLimiters');
const { validate, schemas } = require('../validation');
const User = require('../models/User');
const logger = require('../utils/logger');

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication and user management
 */

// Routes with separated validation
/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Invalid input (e.g., email already exists, validation error)
 *       500:
 *         description: Server error
 */
router.post('/register', validate(schemas.auth.registerUserSchema), catchAsync(authController.registerUser));

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Log in a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Login successful, returns JWT token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User' # Assuming you have a User schema
 *       400:
 *         description: Invalid input (validation error)
 *       401:
 *         description: Invalid credentials
 *       429:
 *         description: Too many login attempts
 *       500:
 *         description: Server error
 */
router.post('/login', failedLoginLimiter, validate(schemas.auth.loginSchema), catchAsync(authController.login));

/**
 * @swagger
 * /api/auth/reset-password-request:
 *   post:
 *     summary: Request a password reset link
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Password reset email sent (if user exists)
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.post('/reset-password-request', validate(schemas.auth.passwordResetRequestSchema), catchAsync(authController.requestPasswordReset));

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Reset password using a token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - newPassword
 *             properties:
 *               token:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Invalid or expired token, or validation error
 *       500:
 *         description: Server error
 */
router.post('/reset-password', validate(schemas.auth.passwordResetSchema), catchAsync(authController.resetPassword));

// Routes that don't need validation
/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current authenticated user's details
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized (token missing or invalid)
 *       500:
 *         description: Server error
 */
router.get('/me', requireAuth, catchAsync(authController.getCurrentUser));

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Log out the current user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/logout', requireAuth, catchAsync(authController.logout));

// Add validation to check-email route
/**
 * @swagger
 * /api/auth/check-email:
 *   get:
 *     summary: Check if an email address is already registered
 *     tags: [Auth]
 *     parameters:
 *       - in: query
 *         name: email
 *         schema:
 *           type: string
 *           format: email
 *         required: true
 *         description: The email address to check
 *     responses:
 *       200:
 *         description: Email check result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 exists:
 *                   type: boolean
 *                 error:
 *                   type: string
 *       400:
 *         description: Invalid input (e.g., email not provided or invalid format)
 *       500:
 *         description: Server error during email check
 */
router.get('/check-email', validate(schemas.auth.checkEmailSchema), async (req, res) => {
  try {
    const email = String(req.query.email || '').toLowerCase().trim();

    // Check User table for the email
    const existingUser = await User.findOne({ 
      where: { email }, 
      attributes: ['id'] 
    });

    return res.json({ exists: existingUser !== null });

  } catch (err) {
    // Log the error for debugging, but don't leak details to the client
    logger.error('Error in /api/auth/check-email:', err);
    // Return a generic error and assume email doesn't exist to avoid blocking user
    return res.status(500).json({ exists: false, error: 'Internal server error during email check' });
  }
});

// OAuth routes
/**
 * @swagger
 * /api/auth/google:
 *   get:
 *     summary: Initiate Google OAuth authentication
 *     tags: [Auth]
 *     description: Redirects to Google for authentication.
 *     responses:
 *       302:
 *         description: Redirect to Google's OAuth consent screen.
 *       500:
 *         description: Server error
 */
router.get('/google', catchAsync(authController.googleAuth));

/**
 * @swagger
 * /api/auth/facebook:
 *   get:
 *     summary: Initiate Facebook OAuth authentication
 *     tags: [Auth]
 *     description: Redirects to Facebook for authentication.
 *     responses:
 *       302:
 *         description: Redirect to Facebook's OAuth consent screen.
 *       500:
 *         description: Server error
 */
router.get('/facebook', catchAsync(authController.facebookAuth));

module.exports = router;

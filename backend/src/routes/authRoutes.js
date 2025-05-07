const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth');
const { catchAsync, ApiError } = require('../middleware/errorHandler');
const { failedLoginLimiter } = require('../utils/rateLimiters');
const { validate, schemas } = require('../validation');
const User = require('../models/User');
const logger = require('../utils/logger');

// Routes with separated validation
router.post('/register', validate(schemas.auth.registerUserSchema), catchAsync(authController.registerUser));
router.post('/login', failedLoginLimiter, validate(schemas.auth.loginSchema), catchAsync(authController.login));
router.post('/reset-password-request', validate(schemas.auth.passwordResetRequestSchema), catchAsync(authController.requestPasswordReset));
router.post('/reset-password', validate(schemas.auth.passwordResetSchema), catchAsync(authController.resetPassword));

// Routes that don't need validation
router.get('/me', requireAuth, catchAsync(authController.getCurrentUser));
router.post('/logout', requireAuth, catchAsync(authController.logout));

// Add validation to check-email route
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
router.get('/google', catchAsync(authController.googleAuth));
router.get('/facebook', catchAsync(authController.facebookAuth));

module.exports = router;

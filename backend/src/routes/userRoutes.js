const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Role = require('../models/Role');
const { body, validationResult } = require('express-validator');
const { requireAuth } = require('../middleware/auth'); // requireAdmin removed
const { catchAsync, ApiError } = require('../middleware/errorHandler');
const { sanitizeUserData } = require('../utils/userUtils');
const { sendSafeJson } = require('../utils/safeSerializer');
const logger = require('../utils/logger');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { Op } = require('sequelize'); // Import Op

// --- Multer setup for profile image uploads ---
const profileImageDir = path.join(__dirname, '../../uploads/profile-images');
if (!fs.existsSync(profileImageDir)) {
  fs.mkdirSync(profileImageDir, { recursive: true });
}

const profileImageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, profileImageDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, `user-${req.user.id}-profile-${uniqueSuffix}${extension}`);
  }
});

const profileImageFileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/gif') {
    cb(null, true);
  } else {
    cb(new ApiError('Invalid file type. Only JPEG, PNG, GIF allowed.', 400, 'INVALID_FILE_TYPE'), false);
  }
};

const uploadProfileImage = multer({
  storage: profileImageStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: profileImageFileFilter
});

// Multer error handler middleware
const handleProfileImageMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    logger.error(`[userRoutes] Multer error during profile image upload: ${err.message}`, err);
    if (err.code === 'LIMIT_FILE_SIZE') {
      return next(new ApiError('File too large. Maximum size is 5MB.', 400, 'FILE_TOO_LARGE'));
    }
    return next(new ApiError(`File upload error: ${err.message}`, 400, 'MULTER_ERROR'));
  } else if (err) {
    logger.error(`[userRoutes] Non-Multer error during profile image upload: ${err.message}`, err);
    if (err instanceof ApiError) return next(err); // Forward ApiErrors
    return next(new ApiError('Could not process file upload.', 500, 'UPLOAD_PROCESSING_ERROR'));
  }
  next(); // No error
};
// --- End Multer Setup ---


/**
 * GET /api/users/profile
 * Get the current authenticated user's detailed profile.
 * This includes fields like bio, socialLinks, gameSpecificStats, etc.
 * Assumes these fields will be added to the User model via a new migration.
 */
router.get('/profile', requireAuth, catchAsync(async (req, res) => {
  logger.info(`[userRoutes] GET /profile for user ID: ${req.user.id}`);
  const user = await User.findByPk(req.user.id, {
    // Include any associations needed for a full profile, e.g., roles
    include: [{ model: Role, through: { attributes: [] }, attributes: ['name'] }]
  });

  if (!user) {
    throw new ApiError('User profile not found.', 404, 'USER_PROFILE_NOT_FOUND');
  }
  // Sanitize before sending. userUtils.sanitizeUserData should be updated
  // to handle new profile fields like bio, socialLinks, gameSpecificStats, profileImageUrl.
  const profileData = sanitizeUserData(user.toJSON(), req.user.role);
  return sendSafeJson(res, profileData);
}));

/**
 * PUT /api/users/profile
 * Update the current authenticated user's detailed profile.
 * Handles fields like firstName, lastName, bio, country, position, height,
 * socialLinks, gameSpecificStats.
 * Assumes these fields will be added to the User model via a new migration.
 */
router.put('/profile', requireAuth, [
  // Add validation for new profile fields as they are added to the User model
  body('firstName').optional().notEmpty().isString().trim().escape(),
  body('lastName').optional().notEmpty().isString().trim().escape(),
  body('bio').optional().isString().trim().escape().isLength({ max: 5000 }),
  body('country').optional().isString().trim().escape(),
  body('position').optional().isString().trim().escape(),
  body('height').optional().isFloat({ min: 0 }),
  body('socialLinks').optional().isJSON(), // Or .isObject() if parsed by body-parser
  body('gameSpecificStats').optional().isJSON(), // Or .isObject()
  // Add other updatable fields here
], catchAsync(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: { message: 'Validation failed', fields: errors.mapped() }
    });
  }

  logger.info(`[userRoutes] PUT /profile for user ID: ${req.user.id} with data: ${JSON.stringify(req.body)}`);
  const user = await User.findByPk(req.user.id);

  if (!user) {
    throw new ApiError('User profile not found.', 404, 'USER_PROFILE_NOT_FOUND');
  }

  // Define allowed fields for profile update
  const allowedProfileFields = [
    'firstName', 'lastName', 'middleName', 'dob', 'country', 'height', 'position',
    'bio', 'socialLinks', 'gameSpecificStats' // Add new profile fields
    // 'profileImageUrl' will be handled by a separate endpoint
  ];

  const updateData = {};
  allowedProfileFields.forEach(field => {
    if (req.body[field] !== undefined) {
      // Special handling for JSON fields if they come as strings
      if ((field === 'socialLinks' || field === 'gameSpecificStats') && typeof req.body[field] === 'string') {
        try {
          updateData[field] = JSON.parse(req.body[field]);
        } catch (e) {
          logger.warn(`[userRoutes] PUT /profile: Invalid JSON for field ${field} for user ID: ${req.user.id}`);
          // Optionally throw an error or skip updating this field
        }
      } else {
        updateData[field] = req.body[field];
      }
    }
  });

  await user.update(updateData);
  const updatedUser = await User.findByPk(req.user.id, {
    include: [{ model: Role, through: { attributes: [] }, attributes: ['name'] }]
  });
  const profileData = sanitizeUserData(updatedUser.toJSON(), req.user.role);
  return sendSafeJson(res, profileData);
}));

/**
 * PUT /api/users/profile/image
 * Update current authenticated user's profile image.
 * Placeholder: Actual implementation requires file upload middleware (e.g., multer).
 * Assumes 'profileImageUrl' field will be added to User model.
 */
router.put('/profile/image', requireAuth, uploadProfileImage.single('profileImage'), handleProfileImageMulterError, catchAsync(async (req, res) => {
  logger.info(`[userRoutes] PUT /profile/image for user ID: ${req.user.id}`);
  const user = await User.findByPk(req.user.id);
  if (!user) {
    // If file was uploaded, attempt to delete it to prevent orphans
    if (req.file && req.file.path) fs.unlink(req.file.path, err => { if(err) logger.error(`Failed to delete orphaned profile image: ${req.file.path}`, err);});
    throw new ApiError('User not found', 404, 'USER_NOT_FOUND');
  }

  if (!req.file) {
    throw new ApiError('No profile image file uploaded.', 400, 'VALIDATION_ERROR_NO_FILE');
  }

  // Potentially delete old image if it exists and is different
  if (user.profileImageUrl && user.profileImageUrl !== `/uploads/profile-images/${req.file.filename}`) {
      const oldImagePath = path.join(__dirname, '../../', user.profileImageUrl); // Construct absolute path
      if (fs.existsSync(oldImagePath) && user.profileImageUrl.startsWith('/uploads/profile-images/')) { // Basic check to avoid deleting unintended files
          fs.unlink(oldImagePath, err => {
              if (err) logger.error(`Failed to delete old profile image: ${oldImagePath}`, err);
              else logger.info(`Old profile image deleted: ${oldImagePath}`);
          });
      }
  }
  
  const profileImageUrl = `/uploads/profile-images/${req.file.filename}`;
  await user.update({ profileImageUrl });

  const updatedUser = await User.findByPk(req.user.id, {
    include: [{ model: Role, through: { attributes: [] }, attributes: ['name'] }]
  });
  const profileData = sanitizeUserData(updatedUser.toJSON(), req.user.role);
  return sendSafeJson(res, { success: true, message: 'Profile image updated successfully.', user: profileData });
}));

/**
 * GET /api/users/:userId/profile
 * Get a specific user's public-facing detailed profile by their ID.
 * Assumes profile fields (bio, etc.) will be added to User model.
 */
router.get('/:userId/profile', catchAsync(async (req, res) => { // No auth required for public profile view by ID
  const { userId } = req.params;
  logger.info(`[userRoutes] GET /:userId/profile for userId: ${userId}`);
  const user = await User.findByPk(userId, {
    // Select only public-safe fields and necessary associations
    attributes: ['id', 'email', 'firstName', 'lastName', 'country', 'position', 'profileImageUrl', 'bio', 'socialLinks', 'gameSpecificStats', 'createdAt'], // Add other public fields
    include: [{ model: Role, through: { attributes: [] }, attributes: ['name'] }] // Example: show roles
  });

  if (!user) {
    throw new ApiError('User profile not found.', 404, 'USER_PROFILE_NOT_FOUND');
  }
  // Sanitize before sending. userUtils.sanitizeUserData should be updated.
  const profileData = sanitizeUserData(user.toJSON(), user.role); // Use user's actual role for sanitization context
  return sendSafeJson(res, profileData);
}));

// Mock data for stats, activity etc. - replace with actual database interactions
// These should be adapted to fetch data related to the req.user.id
const mockUserStats = (userId, timeframe = 'all-time') => ({
  userId,
  timeframe,
  matchesPlayed: timeframe === 'week' ? 10 : (timeframe === 'month' ? 40 : 100),
  winRate: timeframe === 'week' ? 60 : (timeframe === 'month' ? 55 : 50),
  kda: timeframe === 'week' ? 1.8 : (timeframe === 'month' ? 1.6 : 1.5),
  // ... other stats
});

const mockUserActivity = (userId, limit = 5) => Array.from({ length: limit }, (_, i) => ({
  id: `activity${i + 1}`,
  userId,
  type: i % 2 === 0 ? 'match_played' : 'achievement_unlocked',
  description: i % 2 === 0 ? `Played a competitive match` : `Unlocked 'Top Player' achievement`,
  timestamp: new Date(Date.now() - i * 3600000).toISOString(),
  // ... other activity details
}));

const mockUserUpcomingMatches = (userId) => ([
  { id: 'matchUpcoming1', userId, game: 'Valorant', opponent: 'Team Alpha', date: new Date(Date.now() + 86400000).toISOString() },
  // ... other matches
]);

const mockUserGamePerformance = (userId, gameId) => ({
  userId,
  gameId,
  averageRank: 'Diamond 1',
  // ... other game performance details
});

/**
 * GET /api/users/stats
 * Get current authenticated user's stats.
 */
router.get('/stats', requireAuth, catchAsync(async (req, res) => {
  const { timeframe = 'all-time' } = req.query;
  logger.info(`[userRoutes] GET /stats for user ID: ${req.user.id}, timeframe: ${timeframe}`);
  // TODO: Fetch actual stats for req.user.id from database
  const stats = mockUserStats(req.user.id, timeframe);
  return sendSafeJson(res, stats);
}));

/**
 * GET /api/users/activity
 * Get current authenticated user's activity feed.
 */
router.get('/activity', requireAuth, catchAsync(async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  logger.info(`[userRoutes] GET /activity for user ID: ${req.user.id}, limit: ${limit}`);
  // TODO: Fetch actual activity for req.user.id from database
  const activities = mockUserActivity(req.user.id, limit);
  return sendSafeJson(res, activities);
}));

/**
 * GET /api/users/matches/upcoming
 * Get current authenticated user's upcoming matches.
 */
router.get('/matches/upcoming', requireAuth, catchAsync(async (req, res) => {
  logger.info(`[userRoutes] GET /matches/upcoming for user ID: ${req.user.id}`);
  // TODO: Fetch actual upcoming matches for req.user.id from database
  const matches = mockUserUpcomingMatches(req.user.id);
  return sendSafeJson(res, matches);
}));

/**
 * GET /api/users/games/:gameId/performance
 * Get current authenticated user's performance for a specific game.
 */
router.get('/games/:gameId/performance', requireAuth, catchAsync(async (req, res) => {
  const { gameId } = req.params;
  logger.info(`[userRoutes] GET /games/:gameId/performance for user ID: ${req.user.id}, gameId: ${gameId}`);
  // TODO: Fetch actual game performance for req.user.id and gameId
  const performance = mockUserGamePerformance(req.user.id, gameId);
  return sendSafeJson(res, performance);
}));

/**
 * GET /api/users/:id
 * Get a single user by id (self only)
 */
router.get('/:id', requireAuth, catchAsync(async (req, res) => {
  const userId = parseInt(req.params.id);
  
  // Check if user is requesting their own profile
  if (userId !== req.user.id) { // Admin check removed
    throw new ApiError('Forbidden - You can only view your own profile details', 403, 'FORBIDDEN');
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
 * Update a user (self only)
 * The new PUT /api/users/profile is for comprehensive self-profile updates.
 */
const validateUserUpdate = [
  body('firstName').optional().notEmpty().withMessage('First name cannot be empty').trim().escape(),
  body('lastName').optional().notEmpty().withMessage('Last name cannot be empty').trim().escape(),
  body('middleName').optional().isString().trim().escape(),
  body('dob').optional().isISO8601().toDate(),
  body('country').optional().isString().withMessage('Country must be a string').trim().escape(),
  body('height').optional().isFloat({ min: 0 }).withMessage('Height must be a positive number'),
  body('position').optional().isString().withMessage('Position must be a string').trim().escape(),
  // Add new profile fields to this validation if they can also be updated here
  body('bio').optional().isString().trim().escape().isLength({ max: 5000 }),
  body('socialLinks').optional().isJSON(), // Or .isObject()
  body('gameSpecificStats').optional().isJSON(), // Or .isObject()
  body('profileImageUrl').optional().isURL().trim(), // if can set this directly
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
  
  // Check if user is updating their own profile
  if (userId !== req.user.id) { // Admin check removed
    throw new ApiError('Forbidden - You can only update your own profile', 403, 'FORBIDDEN');
  }
  
  // Only allow updating specific fields
  const allowedFields = ['firstName', 'lastName', 'middleName', 'dob', 'country', 'height', 'position', 'bio', 'socialLinks', 'gameSpecificStats', 'profileImageUrl']; // Added new fields
  const updateData = {};
  
  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) {
      updateData[field] = req.body[field];
    }
  });
  
  const user = await User.findByPk(userId);
  
  if (!user) {
    throw new ApiError('User not found', 404, 'USER_NOT_FOUND');
  }
  
  await user.update(updateData);
  
  // Fetch updated user with roles
  const updatedUser = await User.findByPk(userId, {
    attributes: ['id', 'email', 'firstName', 'lastName', 'middleName', 'dob', 'country', 
                 'height', 'position', 'role', 'status', 'lastLogin', 'createdAt',
                 'bio', 'profileImageUrl', 'socialLinks', 'gameSpecificStats'], // Added new fields
    include: [{
      model: Role,
      through: { attributes: [] },
      attributes: ['name']
    }]
  });
  
  const userData = updatedUser.toJSON();
  // Ensure sanitizeUserData is aware of the new fields
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
    
    // Only allow changing own password
    if (userId !== req.user.id) { // Admin check removed
      throw new ApiError('Forbidden - You can only change your own password', 403, 'FORBIDDEN');
    }
    
    const { currentPassword, newPassword } = req.body;
    
    const user = await User.findByPk(userId);
    
    if (!user) {
      throw new ApiError('User not found', 404, 'USER_NOT_FOUND');
    }
    
    // Verify current password (always for self-change)
    const isPasswordValid = await user.validatePassword(currentPassword);
    
    if (!isPasswordValid) {
      throw new ApiError('Current password is incorrect', 400, 'INVALID_PASSWORD');
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

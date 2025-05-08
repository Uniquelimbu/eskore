const express = require('express');
const { requireAuth, requireTeamManager } = require('../middleware/auth'); // requireAdmin removed
const { catchAsync, ApiError } = require('../middleware/errorHandler');
const { validate, schemas } = require('../validation');
const router = express.Router();
const Team = require('../models/Team');
const UserTeam = require('../models/UserTeam');
const User = require('../models/User');
const { body, param, validationResult } = require('express-validator');
const { Op } = require('sequelize');
const { sendSafeJson } = require('../utils/safeSerializer');
const logger = require('../utils/logger'); // Assuming you have a logger utility
const sequelize = require('../config/db'); // Add Missing Import for Sequelize

// --- Multer setup for logo uploads ---
// ... (existing multer setup) ...
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '../../uploads/team-logos');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    logger.info(`TEAMROUTES.JS (Multer): Destination check for file: ${file.originalname}`);
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    const filename = file.fieldname + '-' + uniqueSuffix + extension;
    logger.info(`TEAMROUTES.JS (Multer): Generating filename: ${filename}`);
    cb(null, filename);
  }
});

const fileFilter = (req, file, cb) => {
  logger.info(`TEAMROUTES.JS (Multer): File filter check for mimetype: ${file.mimetype}`);
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/gif') {
    cb(null, true);
  } else {
    logger.warn(`TEAMROUTES.JS (Multer): Invalid file type: ${file.mimetype}`);
    cb(new ApiError('Invalid file type. Only JPEG, PNG, GIF allowed.', 400, 'INVALID_FILE_TYPE'), false);
  }
};

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: fileFilter
});
// --- End Multer Setup ---

logger.info('TEAMROUTES.JS: File loaded, router instance created. Multer configured.');

// Middleware for all routes in this router, to log entry
router.use((req, res, next) => {
  logger.info(`TEAMROUTES.JS (router.use): Request received for ${req.method} ${req.path} (Original URL: ${req.originalUrl})`);
  // logger.info(`TEAMROUTES.JS (router.use): Body: ${JSON.stringify(req.body)}`); // Already logged by Morgan with more context
  next();
});

// GET /api/teams
router.get('/', catchAsync(async (req, res) => {
  logger.info('TEAMROUTES.JS (GET /): Fetching all teams.');
  const teams = await Team.findAll();
  return sendSafeJson(res, {
    success: true,
    count: teams.length,
    teams
  });
}));

// GET /api/teams/:id
router.get('/:id', validate(schemas.team.teamIdParam), catchAsync(async (req, res) => {
  logger.info(`TEAMROUTES.JS (GET /:id): Fetching team with ID: ${req.params.id}`);
  const { id } = req.params;
  const team = await Team.findByPk(id, {
    include: [
      {
        model: User,
        through: { attributes: ['role'] },
        attributes: ['id', 'firstName', 'lastName', 'email']
      }
    ]
  });
  
  if (!team) {
    throw new ApiError('Team not found', 404, 'RESOURCE_NOT_FOUND');
  }
  
  return sendSafeJson(res, team);
}));

/**
 * GET /api/teams/:id/members
 * Fetches all members of a specific team
 * Requires authenticated user
 */
router.get('/:id/members', requireAuth, validate(schemas.team.teamIdParam), catchAsync(async (req, res) => {
  const { id: teamId } = req.params;
  logger.info(`TEAMROUTES.JS (GET /:id/members): Fetching members for team ID ${teamId}`);

  const teamExists = await Team.findByPk(teamId);
  if (!teamExists) {
    // Log this specific case for clarity, though the frontend might show a generic error
    logger.warn(`TEAMROUTES.JS (GET /:id/members): Team with ID ${teamId} not found when trying to fetch members.`);
    throw new ApiError('Team not found', 404, 'RESOURCE_NOT_FOUND');
  }

  // Fetch UserTeam entries which link Users to this Team, including the role
  const userTeamEntries = await UserTeam.findAll({
    where: { teamId },
    include: [{
      model: User,
      attributes: ['id', 'firstName', 'lastName', 'email', 'profileImageUrl'] // Specify user attributes
    }],
    attributes: ['role'] // Specify attributes from UserTeam model (role)
  });

  // Format the members list as expected by the frontend
  const formattedMembers = userTeamEntries.map(utEntry => {
    if (!utEntry.User) {
      // This case should ideally not happen with a successful include if the data is consistent
      logger.warn(`TEAMROUTES.JS (GET /:id/members): UserTeam entry found without a corresponding User. UserTeam ID: ${utEntry.id}, UserID: ${utEntry.userId}, TeamID: ${utEntry.teamId}`);
      return null;
    }
    const userJson = utEntry.User.toJSON();
    return {
      id: userJson.id,
      firstName: userJson.firstName,
      lastName: userJson.lastName,
      email: userJson.email,
      avatar: userJson.profileImageUrl, // Map profileImageUrl to avatar for frontend consistency
      role: utEntry.role,
      // position and jerseyNumber are not currently in User or UserTeam models.
      // Frontend Squad.js uses placeholders if these are null/undefined.
      position: utEntry.position || null, // If position was added to UserTeam
      jerseyNumber: utEntry.jerseyNumber || null // If jerseyNumber was added to UserTeam
    };
  }).filter(member => member !== null); // Filter out any nulls from inconsistent data

  logger.info(`TEAMROUTES.JS (GET /:id/members): Successfully fetched ${formattedMembers.length} members for team ID ${teamId}.`);
  return sendSafeJson(res, {
    success: true,
    count: formattedMembers.length,
    members: formattedMembers
  });
}));

/**
 * POST /api/teams
 * Creates a new team
 */
router.post('/', 
  requireAuth, 
  validate(schemas.team.createTeam), 
  catchAsync(async (req, res) => {
    logger.info(`TEAMROUTES.JS (POST /): ENTERING team creation logic. User: ${req.user?.email}, Body: ${JSON.stringify(req.body)}`);
    const { name, abbreviation, foundedYear, city, nickname } = req.body;
    let newTeam; 

    // Check if the user already owns a team
    const existingTeam = await UserTeam.findOne({
      where: {
        userId: req.user.id,
        role: 'manager'
      }
    });

    if (existingTeam) {
      logger.warn(`TEAMROUTES.JS (POST /): User ${req.user.id} (${req.user.email}) attempted to create a second team.`);
      throw new ApiError('You already own a team. Leave your current team before creating a new one.', 403, 'FORBIDDEN_MULTIPLE_TEAMS');
    }

    // No try-catch here, let catchAsync handle it.
    // Errors thrown (including ApiError from validation or manual throws) will be caught by catchAsync.

    logger.info(`TEAMROUTES.JS (POST /): Attempting Team.create with data: ${JSON.stringify({ name, abbreviation, foundedYear, city, nickname })}`);
    newTeam = await Team.create({
      name,
      abbreviation: abbreviation || null,
      foundedYear: foundedYear || null,
      city: city || null,
      nickname: nickname || null
      // email and passwordHash are not part of this form, should be null or handled separately if team can login
    });
    logger.info(`TEAMROUTES.JS (POST /): Team.create successful. New team ID: ${newTeam.id}`);

    if (!req.user || !req.user.id) {
      logger.error('TEAMROUTES.JS (POST /): CRITICAL - User ID not found in req.user for team ownership assignment. This should have been caught by requireAuth.');
      // Clean up the created team if user assignment fails
      if (newTeam && newTeam.id) {
        await Team.destroy({ where: { id: newTeam.id } });
        logger.warn(`TEAMROUTES.JS (POST /): Cleaned up orphaned team ${newTeam.id} due to missing user ID for owner assignment.`);
      }
      // Throw an error that catchAsync will handle
      throw new ApiError('Authenticated user ID is missing. Cannot assign team ownership.', 500, 'INTERNAL_SERVER_ERROR_AUTH_MISSING');
    }

    logger.info(`TEAMROUTES.JS (POST /): Attempting UserTeam.create for userId: ${req.user.id}, teamId: ${newTeam.id}, role: 'manager'`);
    await UserTeam.create({
      userId: req.user.id,
      teamId: newTeam.id,
      role: 'manager' // Always set as manager for creator
    });
    logger.info(`TEAMROUTES.JS (POST /): UserTeam.create successful. Team and ownership link created.`);

    return sendSafeJson(res, {
      success: true,
      message: 'Team created successfully!', // Added a message
      team: newTeam // Send the full newTeam object back
    }, 201);
  })
);

/**
 * POST /api/teams/:id/members
 * Adds a member to a team
 */
router.post('/:id/members', 
  requireAuth, 
  validate([
    ...schemas.team.teamIdParam,
    ...schemas.team.teamMemberSchema
  ]), 
  catchAsync(async (req, res) => {
  logger.info(`TEAMROUTES.JS (POST /:id/members): Adding member to team ID ${req.params.id} by user ${req.user?.email}. Body: ${JSON.stringify(req.body)}`);
  const { id } = req.params;
  const { userId, role = 'athlete' } = req.body;
  
  // Validate parameters
  if (!userId) {
    throw new ApiError('User ID is required', 400, 'VALIDATION_ERROR');
  }
  
  if (!['manager', 'assistant_manager', 'athlete', 'coach'].includes(role)) {
    throw new ApiError('Invalid role', 400, 'VALIDATION_ERROR');
  }
  
  // Check if team exists
  const team = await Team.findByPk(id);
  if (!team) {
    throw new ApiError('Team not found', 404, 'RESOURCE_NOT_FOUND');
  }
  
  // Check if user has permission (team owner or team manager)
  const userTeamPermission = await UserTeam.findOne({
    where: {
      userId: req.user.id,
      teamId: id,
      role: { [Op.in]: ['manager', 'assistant_manager'] }
    }
  });
  
  if (!userTeamPermission) {
    throw new ApiError('Forbidden - You must be a team owner or manager to add members', 403, 'FORBIDDEN');
  }
  
  if (userTeamPermission.role === 'assistant_manager' && ['manager', 'assistant_manager'].includes(role)) {
    throw new ApiError('Forbidden - Assistant managers can only add athletes and coaches', 403, 'FORBIDDEN');
  }
  
  // Check if user exists
  const user = await User.findByPk(userId);
  if (!user) {
    throw new ApiError('User not found', 404, 'USER_NOT_FOUND');
  }
  
  // Check if user is already in the team with the same role
  const existingMembership = await UserTeam.findOne({
    where: {
      userId,
      teamId: id,
      role
    }
  });
  
  if (existingMembership) {
    throw new ApiError('User already has this role in the team', 409, 'ALREADY_EXISTS');
  }
  
  // Add user to the team
  const userTeam = await UserTeam.create({
    userId,
    teamId: id,
    role: role || 'athlete'
  });
  
  return sendSafeJson(res, {
    success: true,
    message: 'User added to the team successfully',
    membership: userTeam
  }, 201);
}));

/**
 * DELETE /api/teams/:id/members/:userId
 * Removes a member from a team
 */
router.delete('/:id/members/:userId', 
  requireAuth, 
  validate([
    ...schemas.team.teamIdParam,
    param('userId').isInt().withMessage('User ID must be an integer').toInt()
  ]),
  catchAsync(async (req, res) => {
  logger.info(`TEAMROUTES.JS (DELETE /:id/members/:userId): Removing member ${req.params.userId} from team ${req.params.id} by user ${req.user?.email}.`);
  const { id, userId } = req.params;
  
  // Check if team exists
  const team = await Team.findByPk(id);
  if (!team) {
    throw new ApiError('Team not found', 404, 'RESOURCE_NOT_FOUND');
  }
  
  // Check if user has permission (team owner)
  const userTeamOwner = await UserTeam.findOne({
    where: {
      userId: req.user.id,
      teamId: id,
      role: 'manager'
    }
  });
  
  if (!userTeamOwner) {
    // Allow managers to remove athletes or coaches they added? Or only owners?
    // Current logic: only owners can remove any member.
    // If self-removal is allowed, that's a different check (e.g. if req.user.id === parseInt(userId))
    throw new ApiError('Forbidden - You must be a team owner to remove members', 403, 'FORBIDDEN');
  }
  
  // Prevent owner from removing themselves if they are the sole owner? (Consider this logic)

  // Start a transaction
  const t = await sequelize.transaction();
    
  try {
    // Check if the user to be removed is the manager
    const memberToRemove = await UserTeam.findOne({
      where: {
        teamId: id,
        userId: userId
      },
      transaction: t
    });
    
    if (!memberToRemove) {
      await t.rollback();
      throw new ApiError('Member not found in this team', 404, 'RESOURCE_NOT_FOUND');
    }
    
    // Count total team members
    const memberCount = await UserTeam.count({
      where: { teamId: id },
      transaction: t
    });
    
    // Prevent removing a manager if they're not the only member
    if (memberToRemove.role === 'manager' && memberCount > 1) {
      await t.rollback();
      throw new ApiError('Please transfer manager role before leaving the team', 403, 'FORBIDDEN_MANAGER_LEAVE');
    }
    
    // Remove the member
    await memberToRemove.destroy({ transaction: t });
    
    // If there's exactly one member left after this removal, promote them to manager
    if (memberCount - 1 === 1) {
      const lastMember = await UserTeam.findOne({
        where: { 
          teamId: id,
          userId: { [Op.ne]: userId }
        },
        transaction: t
      });
      
      if (lastMember) {
        lastMember.role = 'manager';
        await lastMember.save({ transaction: t });
        logger.info(`TEAMROUTES.JS (DELETE /:id/members/:userId): Auto-promoted last member to manager: ${lastMember.userId}`);
      }
    }
    
    await t.commit();
    
    return sendSafeJson(res, {
      success: true,
      message: 'Team member removed successfully'
    });
  } catch (error) {
    await t.rollback();
    throw error;
  }
}));

/**
 * PATCH /api/teams/:id
 * Updates a team
 * Requires team ownership or manager role
 */
router.patch('/:id', 
  requireAuth, 
  validate([
    ...schemas.team.teamIdParam,
    ...schemas.team.teamSchema
  ]), 
  catchAsync(async (req, res) => { // Added validateTeam here too if general update uses same fields
  logger.info(`TEAMROUTES.JS (PATCH /:id): Updating team ID ${req.params.id} by user ${req.user?.email}. Body: ${JSON.stringify(req.body)}`);
  const { id } = req.params;
  // Destructure all updatable fields from validateTeam
  const { name, abbreviation, foundedYear, city, nickname } = req.body;

  const team = await Team.findByPk(id);
  if (!team) {
    throw new ApiError('Team not found', 404, 'RESOURCE_NOT_FOUND');
  }
  
  // Check if user is team owner or manager
  const userTeam = await UserTeam.findOne({
    where: {
      userId: req.user.id,
      teamId: id,
      role: { [Op.in]: ['manager', 'assistant_manager'] } // Updated roles
    }
  });
  
  if (!userTeam) {
    throw new ApiError('Forbidden - You must be a team owner or manager to update it', 403, 'FORBIDDEN_TEAM_UPDATE');
  }
  
  // Update only provided fields
  if (name !== undefined) team.name = name;
  if (abbreviation !== undefined) team.abbreviation = abbreviation;
  if (foundedYear !== undefined) team.foundedYear = foundedYear;
  if (city !== undefined) team.city = city;
  if (nickname !== undefined) team.nickname = nickname;
  // logoUrl is handled by a separate endpoint

  await team.save();
  return sendSafeJson(res, {
    success: true,
    team
  });
}));

/**
 * PATCH /api/teams/:id/logo
 * Updates a team's logo
 * Requires team ownership or manager role
 */
// Multer error handler middleware
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    logger.error(`TEAMROUTES.JS (Multer Error Handler): Multer error: ${err.message}`, err);
    if (err.code === 'LIMIT_FILE_SIZE') {
      return next(new ApiError('File too large. Maximum size is 5MB.', 400, 'FILE_TOO_LARGE'));
    }
    return next(new ApiError(`File upload error: ${err.message}`, 400, 'MULTER_ERROR'));
  } else if (err) { // Handle errors from fileFilter (ApiError instances) or other unexpected errors
    logger.error(`TEAMROUTES.JS (Multer Error Handler): Non-Multer error during upload: ${err.message}`, err);
    if (err instanceof ApiError) return next(err); // Forward ApiErrors
    return next(new ApiError('Could not process file upload.', 500, 'UPLOAD_PROCESSING_ERROR'));
  }
  next(); // No error
};

router.patch('/:id/logo', 
  requireAuth, 
  validate(schemas.team.teamIdParam),
  upload.single('logo'), // Multer middleware for single file upload
  handleMulterError, // Custom Multer error handler
  catchAsync(async (req, res, next) => {
    logger.info(`TEAMROUTES.JS (PATCH /:id/logo): Updating logo for team ID ${req.params.id} by user ${req.user?.email}`);
    const { id } = req.params;
  
    const team = await Team.findByPk(id);
    if (!team) {
      throw new ApiError('Team not found', 404, 'RESOURCE_NOT_FOUND');
    }
    
    // Check if user is team owner or manager
    const userTeam = await UserTeam.findOne({
      where: {
        userId: req.user.id,
        teamId: id,
        role: { [Op.in]: ['manager', 'assistant_manager'] }
      }
    });
    
    if (!userTeam) {
      throw new ApiError('Forbidden - You must be a team owner or manager to update it', 403, 'FORBIDDEN');
    }
    
    // Process the uploaded file
    if (!req.file) {
      logger.warn(`TEAMROUTES.JS (PATCH /:id/logo): No logo file uploaded for team ID ${id}.`);
      throw new ApiError('No logo file uploaded. Please select a file.', 400, 'VALIDATION_ERROR_NO_FILE');
    }
    
    // Save the logo URL (relative path, ensure /uploads is served statically)
    const logoUrl = `/uploads/team-logos/${req.file.filename}`;
    logger.info(`TEAMROUTES.JS (PATCH /:id/logo): New logo URL for team ${id}: ${logoUrl}`);
    team.logoUrl = logoUrl;
    await team.save();
    
    return sendSafeJson(res, {
      success: true,
      team
    });
  })
);

/**
 * DELETE /api/teams/:id
 * Deletes a team
 */
router.delete('/:id',
  requireAuth,
  validate(schemas.team.teamIdParam),
  catchAsync(async (req, res) => {
    logger.info(`TEAMROUTES.JS (DELETE /:id): Deleting team ID ${req.params.id} by user ${req.user?.email}`);
    const { id } = req.params;
    
    // Start a transaction for atomicity
    const t = await sequelize.transaction();
    
    try {
      const team = await Team.findByPk(id, { transaction: t });
      if (!team) {
        await t.rollback();
        throw new ApiError('Team not found', 404, 'RESOURCE_NOT_FOUND');
      }

      // Check if user is on this team as a manager
      const userTeam = await UserTeam.findOne({
        where: {
          userId: req.user.id,
          teamId: id,
          role: 'manager'
        },
        transaction: t
      });

      if (!userTeam) {
        await t.rollback();
        throw new ApiError('Only team managers can delete teams', 403, 'FORBIDDEN');
      }
      
      // Count team members
      const memberCount = await UserTeam.count({
        where: { teamId: id },
        transaction: t
      });
      
      logger.info(`TEAMROUTES.JS (DELETE /:id): Team ${id} has ${memberCount} members, requester role is ${userTeam.role}`);
      
      // Only allow deletion if this is the only member
      if (memberCount > 1) {
        await t.rollback();
        throw new ApiError('Teams with multiple members cannot be deleted. Remove all other members first.', 403, 'FORBIDDEN_TEAM_DELETE');
      }
      
      // Delete all associated data
      // 1. Team memberships
      const deletedMemberships = await UserTeam.destroy({ 
        where: { teamId: id },
        transaction: t 
      });
      
      logger.info(`TEAMROUTES.JS (DELETE /:id): Deleted ${deletedMemberships} team memberships`);
      
      // 2. Tournament registrations if they exist
      try {
        const TeamTournament = require('../models/TeamTournament');
        const deletedTournaments = await TeamTournament.destroy({ 
          where: { teamId: id },
          transaction: t 
        });
        logger.info(`TEAMROUTES.JS (DELETE /:id): Deleted ${deletedTournaments} tournament registrations`);
      } catch (err) {
        logger.warn(`TEAMROUTES.JS (DELETE /:id): Error deleting tournament registrations: ${err.message}`);
        // Continue with deletion even if this fails
      }
      
      // 3. Other team related data
      // ... existing cleanup code ...
      
      // Finally delete the team
      await team.destroy({ transaction: t });
      
      // Commit transaction
      await t.commit();
      
      logger.info(`TEAMROUTES.JS (DELETE /:id): Team ${id} successfully deleted by user ${req.user.id}`);
      
      return sendSafeJson(res, {
        success: true,
        message: 'Team deleted successfully'
      });
    } catch (error) {
      await t.rollback();
      logger.error(`TEAMROUTES.JS (DELETE /:id): Error deleting team ${id}: ${error.message}`);
      throw error;
    }
  })
);

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
    logger.info(`TEAMROUTES.JS (POST /:id/transfer-manager): Transferring manager role in team ${req.params.id}, from user ${req.user?.id} to user ${req.body.newManagerId}`);
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
          userId: req.user.id,
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
      
      logger.info(`TEAMROUTES.JS (POST /:id/transfer-manager): Manager role transferred from ${req.user.id} to ${newManagerId} for team ${id}`);
      
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
 * GET /api/teams/user/:userId
 * Get all teams a user is a member of
 */
router.get('/user/:userId', 
  requireAuth, 
  validate([
    param('userId').isInt().withMessage('User ID must be an integer').toInt()
  ]),
  catchAsync(async (req, res) => {
  logger.info(`TEAMROUTES.JS (GET /user/:userId): Fetching teams for user ID ${req.params.userId}, requested by user ${req.user?.email}.`);
  const { userId } = req.params;
  
  // Users can only see their own teams
  if (parseInt(userId) !== req.user.id) { // Admin check removed
    throw new ApiError('Forbidden - You can only view your own teams', 403, 'FORBIDDEN');
  }
  
  // Get all teams for the user
  const userTeams = await UserTeam.findAll({
    where: { userId },
    include: [
      {
        model: Team,
        attributes: ['id', 'name', 'logoUrl']
      }
    ]
  });
  
  // Map the teams with their roles
  const teams = userTeams.map(ut => ({
    ...ut.Team.toJSON(),
    role: ut.role
  }));
    
  return sendSafeJson(res, { teams });
}));

/**
 * POST /api/teams/:id/promote-last-member
 * Promote the last remaining member to manager
 * Only works if there's exactly one member in the team and that's the requester
 */
router.post('/:id/promote-last-member', 
  requireAuth, 
  validate(schemas.team.teamIdParam),
  catchAsync(async (req, res) => {
    logger.info(`TEAMROUTES.JS (POST /:id/promote-last-member): Promoting last member for team ID ${req.params.id}, User: ${req.user?.email}`);
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
          userId: req.user.id,
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
      
      logger.info(`TEAMROUTES.JS (POST /:id/promote-last-member): User ${req.user.id} promoted to manager for team ${id}`);
      
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

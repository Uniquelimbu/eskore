const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { requireAuth } = require('../../middleware/auth');
const { catchAsync, ApiError } = require('../../middleware/errorHandler');
const { validate, schemas } = require('../../validation');
const Team = require('../../models/Team');
const UserTeam = require('../../models/UserTeam');
const { sendSafeJson } = require('../../utils/safeSerializer');
const log = require('../../utils/log');
const { MAX_FILE_SIZE_MB } = require('../../config/constants');
const { Op } = require('sequelize');

// --- Multer setup for logo uploads ---
const uploadDir = path.join(__dirname, '../../../uploads/team-logos');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    log.info(`TEAMROUTES/MEDIA (Multer): Destination check for file: ${file.originalname}`);
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    const filename = file.fieldname + '-' + uniqueSuffix + extension;
    log.info(`TEAMROUTES/MEDIA (Multer): Generating filename: ${filename}`);
    cb(null, filename);
  }
});

const fileFilter = (req, file, cb) => {
  log.info(`TEAMROUTES/MEDIA (Multer): File filter check for mimetype: ${file.mimetype}`);
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/gif') {
    cb(null, true);
  } else {
    log.warn(`TEAMROUTES/MEDIA (Multer): Invalid file type: ${file.mimetype}`);
    cb(new ApiError('Invalid file type. Only JPEG, PNG, GIF allowed.', 400, 'INVALID_FILE_TYPE'), false);
  }
};

const upload = multer({ 
  storage: storage,
  limits: { fileSize: MAX_FILE_SIZE_MB * 1024 * 1024 },
  fileFilter: fileFilter
});

// Multer error handler middleware
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    log.error(`TEAMROUTES/MEDIA (Multer Error Handler): Multer error: ${err.message}`, err);
    if (err.code === 'LIMIT_FILE_SIZE') {
      return next(new ApiError('File too large. Maximum size is 5MB.', 400, 'FILE_TOO_LARGE'));
    }
    return next(new ApiError(`File upload error: ${err.message}`, 400, 'MULTER_ERROR'));
  } else if (err) {
    log.error(`TEAMROUTES/MEDIA (Multer Error Handler): Non-Multer error during upload: ${err.message}`, err);
    if (err instanceof ApiError) return next(err);
    return next(new ApiError('Could not process file upload.', 500, 'UPLOAD_PROCESSING_ERROR'));
  }
  next();
};

/**
 * PATCH /api/teams/:id/logo
 * Updates a team's logo
 */
router.patch('/:id/logo', 
  requireAuth, 
  validate(schemas.team.teamIdParam),
  upload.single('logo'),
  handleMulterError,
  catchAsync(async (req, res, next) => {
    log.info(`TEAMROUTES/MEDIA (PATCH /:id/logo): Updating logo for team ID ${req.params.id} by user ${req.user?.email}`);
    const { id } = req.params;
  
    const team = await Team.findByPk(id);
    if (!team) {
      throw new ApiError('Team not found', 404, 'RESOURCE_NOT_FOUND');
    }
    
    // Check if user is team manager or assistant manager
    const userTeam = await UserTeam.findOne({
      where: {
        userId: req.user.userId,
        teamId: id,
        role: { [Op.in]: ['manager', 'assistant_manager'] }
      }
    });
    
    if (!userTeam) {
      throw new ApiError('Forbidden - You must be a team manager or assistant manager to update it', 403, 'FORBIDDEN');
    }
    
    // Process the uploaded file
    if (!req.file) {
      log.warn(`TEAMROUTES/MEDIA (PATCH /:id/logo): No logo file uploaded for team ID ${id}.`);
      throw new ApiError('No logo file uploaded. Please select a file.', 400, 'VALIDATION_ERROR_NO_FILE');
    }
    
    // Save the logo URL (relative path, ensure /uploads is served statically)
    const logoUrl = `/uploads/team-logos/${req.file.filename}`;
    log.info(`TEAMROUTES/MEDIA (PATCH /:id/logo): New logo URL for team ${id}: ${logoUrl}`);
    team.logoUrl = logoUrl;
    await team.save();
    
    return sendSafeJson(res, {
      success: true,
      team
    });
  })
);

/**
 * DELETE /api/teams/:id/logo
 * Removes a team's logo
 */
router.delete('/:id/logo', 
  requireAuth, 
  validate(schemas.team.teamIdParam),
  catchAsync(async (req, res, next) => {
    log.info(`TEAMROUTES/MEDIA (DELETE /:id/logo): Removing logo for team ID ${req.params.id} by user ${req.user?.email}`);
    const { id } = req.params;
  
    const team = await Team.findByPk(id);
    if (!team) {
      throw new ApiError('Team not found', 404, 'RESOURCE_NOT_FOUND');
    }
    
    // Check if user is team manager or assistant manager
    const userTeam = await UserTeam.findOne({
      where: {
        userId: req.user.userId,
        teamId: id,
        role: { [Op.in]: ['manager', 'assistant_manager'] }
      }
    });
    
    if (!userTeam) {
      throw new ApiError('Forbidden - You must be a team manager or assistant manager to update it', 403, 'FORBIDDEN');
    }
    
    // If the team has a logo, clear it
    if (team.logoUrl) {
      // Optionally: delete the actual file from the server
      try {
        const logoPath = path.join(__dirname, '../../../', team.logoUrl.replace(/^\//, ''));
        if (fs.existsSync(logoPath)) {
          fs.unlinkSync(logoPath);
          log.info(`TEAMROUTES/MEDIA (DELETE /:id/logo): Deleted logo file at ${logoPath}`);
        }
      } catch (fileError) {
        log.warn(`TEAMROUTES/MEDIA (DELETE /:id/logo): Failed to delete logo file: ${fileError.message}`);
        // Continue with the operation even if file deletion fails
      }
      
      // Clear the logoUrl in the database
      team.logoUrl = null;
      await team.save();
      log.info(`TEAMROUTES/MEDIA (DELETE /:id/logo): Removed logo URL for team ${id}`);
    }
    
    return sendSafeJson(res, {
      success: true,
      team
    });
  })
);

module.exports = router;
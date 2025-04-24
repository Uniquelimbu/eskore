const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { Op } = require('sequelize');
const { ApiError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');
const { sanitizeUserData } = require('../utils/userUtils');
// Removed toSafeObject as sendSafeJson handles it
const { sendSafeJson } = require('../utils/safeSerializer'); // Use the robust serializer

// Model imports
const Athlete = require('../models/Athlete');
const User = require('../models/User');
const Team = require('../models/Team');
const Manager = require('../models/Manager');

// Helper function to generate JWT token with improved security
const generateToken = (userId, role) => {
  return jwt.sign(
    { 
      userId, 
      role,
      // Add issued time for tracking
      iat: Math.floor(Date.now() / 1000),
      // Add a unique token ID to help with token revocation if needed
      jti: require('crypto').randomBytes(16).toString('hex')
    },
    process.env.JWT_SECRET || 'your-default-secret',
    { expiresIn: '7d' }  // 7 days expiration
  );
};

// Secure cookie options
const getCookieOptions = () => ({
  httpOnly: true, // Must be true to prevent XSS
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/',
  // sameSite: 'strict' is most secure, but 'lax' might be needed if redirects occur across sites
  sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
  // secure: true should always be used in production (requires HTTPS)
  secure: process.env.NODE_ENV === 'production',
});


// Login function that checks multiple tables
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError('Email and password required', 400, 'MISSING_CREDENTIALS');
  }

  const lowerCaseEmail = String(email).toLowerCase().trim();
  logger.info(`Login attempt for email: ${lowerCaseEmail}`);

  let userInstance = null;
  let userType = null;
  let userId = null;
  let passwordToCompare = null;

  try {
    // Find user across relevant tables
    // Prioritize User table (for admins) then Athlete, Manager, Team
    userInstance = await User.findOne({ where: { email: lowerCaseEmail }, attributes: ['id', 'email', 'password', 'role'] });
    if (userInstance) {
      userType = 'user'; // Could be admin or regular user
      userId = userInstance.id;
      passwordToCompare = userInstance.password; // Hashed password from User table
      logger.debug(`User found in User table: ${userId}, Role: ${userInstance.role}`);

      // If admin, try to fetch associated athlete data for richer profile
      if (userInstance.role === 'admin' || userInstance.role === 'athlete_admin') {
        const athleteRecord = await Athlete.findOne({
          where: { email: lowerCaseEmail },
          attributes: { exclude: ['passwordHash', 'createdAt', 'updatedAt'] } // Exclude sensitive/unneeded fields
        });
        if (athleteRecord) {
          // Merge athlete data into userInstance for sanitization later
          // Be careful not to overwrite essential User fields like id, role
          userInstance = { ...athleteRecord.toJSON(), ...userInstance.toJSON() };
          logger.debug(`Admin user ${userId} has associated athlete record ${athleteRecord.id}`);
        }
      }

    } else {
      userInstance = await Athlete.findOne({ where: { email: lowerCaseEmail }, attributes: { exclude: ['createdAt', 'updatedAt'] } });
      if (userInstance) {
        userType = 'athlete';
        userId = userInstance.id;
        passwordToCompare = userInstance.passwordHash; // Hashed password from Athlete table
        logger.debug(`User found in Athlete table: ${userId}`);
      }
      // Add checks for Manager and Team if login via those tables is supported
      // else if (...) { ... }
    }

    // If user not found in any relevant table
    if (!userInstance || !userType || !passwordToCompare) {
      logger.warn(`User not found or password field missing for email: ${lowerCaseEmail}`);
      throw new ApiError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }

    // Validate password
    const isPasswordValid = await bcrypt.compare(password, passwordToCompare);

    if (!isPasswordValid) {
      logger.warn(`Invalid password for ${userType}: ${lowerCaseEmail}`);
      throw new ApiError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }

    // Password is valid, proceed with token generation and response

    // Determine the role to put in the token (use User role if found there, otherwise userType)
    const tokenRole = userInstance.role && userType === 'user' ? userInstance.role : userType;
    const token = generateToken(userId, tokenRole);

    // Set the secure cookie
    const cookieOptions = getCookieOptions();
    res.cookie('auth_token', token, cookieOptions);
    logger.debug('Auth cookie set with options:', cookieOptions);

    // Sanitize user data before sending
    // Pass the determined role (tokenRole) to ensure correct sanitization
    const safeUserData = sanitizeUserData(userInstance, tokenRole);

    if (!safeUserData) {
        logger.error(`Login failed: Could not sanitize user data for id=${userId}`);
        throw new ApiError('Internal server error during login', 500, 'AUTH_SANITIZE_ERROR');
    }

    logger.info(`Successful login for ${userType}: ${lowerCaseEmail}, UserID: ${userId}`);

    // Determine redirect URL (optional, frontend might handle routing)
    let redirectUrl = '/dashboard'; // Default
    // Adjust based on role if needed
    // if (tokenRole === 'admin' || tokenRole === 'athlete_admin') redirectUrl = '/admin/dashboard';
    // else if (tokenRole === 'athlete') redirectUrl = '/athlete/dashboard';

    // Use sendSafeJson for the final response
    return sendSafeJson(res, {
      success: true,
      // token: token, // Optionally include token in body if needed by frontend (cookie is primary)
      user: safeUserData,
      redirectUrl // Include if frontend uses it
    });

  } catch (error) {
    // Handle known application errors
    if (error instanceof ApiError) {
      // Log specific auth errors differently if needed
      if (error.statusCode === 401) {
         logger.warn(`Login failed for ${lowerCaseEmail}: ${error.message} (Code: ${error.errorCode})`);
      } else {
         logger.error(`Login error for ${lowerCaseEmail}: ${error.message} (Code: ${error.errorCode})`);
      }
      throw error; // Re-throw for the global error handler
    }

    // Log unexpected errors
    logger.error(`Unexpected login error for ${lowerCaseEmail}:`, error);

    // Return a generic safe error response
    throw new ApiError('Login failed due to an internal error', 500, 'AUTH_FAILURE');
  }
};

// Register a new athlete
exports.registerAthlete = async (req, res) => {
  let {
    firstName, lastName, middleName, email, password, dob,
    height, position, country
  } = req.body;

  // Normalize email
  const lowerCaseEmail = String(email || '').toLowerCase().trim();

  // Robust: Check for email in all relevant tables (User, Athlete, Team, Manager)
  const [existingUser, existingAthlete, existingTeam, existingManager] = await Promise.all([
    User.findOne({ where: { email: lowerCaseEmail }, attributes: ['id'] }),
    Athlete.findOne({ where: { email: lowerCaseEmail }, attributes: ['id'] }),
    // Add Team and Manager checks if they have email fields and uniqueness constraints
    // Team.findOne({ where: { email: lowerCaseEmail }, attributes: ['id'] }),
    // Manager.findOne({ where: { email: lowerCaseEmail }, attributes: ['id'] }),
  ]);
  if (existingUser || existingAthlete /* || existingTeam || existingManager */) {
    throw new ApiError('Email already in use', 409, 'EMAIL_IN_USE');
  }

  try {
    // Create athlete record. Password will be hashed by the Athlete model's beforeCreate hook.
    const athlete = await Athlete.create({
      firstName,
      middleName: middleName || null, // Ensure null if empty
      lastName,
      email: lowerCaseEmail,
      passwordHash: password, // Pass plain password to be hashed by hook
      dob,
      height,
      position,
      country
    });

    // Generate JWT token
    const token = generateToken(athlete.id, 'athlete');

    // Set HTTP-only cookie
    const cookieOptions = getCookieOptions();
    res.cookie('auth_token', token, cookieOptions);

    // Sanitize the newly created athlete data
    const safeAthleteData = sanitizeUserData(athlete, 'athlete');

    if (!safeAthleteData) {
        logger.error(`Registration failed: Could not sanitize new athlete data for id=${athlete.id}`);
        throw new ApiError('Internal server error after registration', 500, 'AUTH_SANITIZE_ERROR');
    }

    logger.info(`Athlete registered successfully: ${lowerCaseEmail}, ID: ${athlete.id}`);

    // Use sendSafeJson for the response
    return sendSafeJson(res, {
      success: true,
      message: 'Athlete registered successfully',
      // token: token, // Optionally include token
      athlete: safeAthleteData
    }, 201); // Use 201 Created status

  } catch (error) {
     if (error instanceof ApiError) {
       logger.error(`Athlete registration error for ${lowerCaseEmail}: ${error.message} (Code: ${error.errorCode})`);
       throw error;
     }
     // Handle potential validation errors from Sequelize if not caught by express-validator
     if (error.name === 'SequelizeValidationError') {
        const messages = error.errors.map(e => e.message).join(', ');
        logger.warn(`Athlete registration validation failed for ${lowerCaseEmail}: ${messages}`);
        throw new ApiError(`Validation failed: ${messages}`, 400, 'VALIDATION_ERROR');
     }
     logger.error(`Unexpected athlete registration error for ${lowerCaseEmail}:`, error);
     throw new ApiError('Registration failed due to an internal error', 500, 'REGISTRATION_FAILURE');
  }
};

// Google OAuth handler
exports.googleAuth = async (req, res) => {
  // Implementation would follow similar pattern to login
  res.redirect(`/athlete/home?token=sample-token`);
};

// Facebook OAuth handler
exports.facebookAuth = async (req, res) => {
  // Implementation would follow similar pattern to login
  res.redirect(`/athlete/home?token=sample-token`);
};

// Update logout function for better security and reliability
exports.logout = async (req, res) => {
  try {
    // Clear cookie with same settings used to create it
    const cookieOptions = getCookieOptions();
    // Ensure domain is not set if it wasn't set during creation, or set it explicitly if needed
    // delete cookieOptions.maxAge; // MaxAge is for setting, not clearing
    res.clearCookie('auth_token', {
        httpOnly: cookieOptions.httpOnly,
        path: cookieOptions.path,
        sameSite: cookieOptions.sameSite,
        secure: cookieOptions.secure,
        // domain: cookieOptions.domain // Add if domain was specified when setting
    });

    logger.info(`User logged out successfully (cookie cleared). UserID from token (if available): ${req.user?.id}`);

    // Use a direct response method to bypass potential serialization issues
    // Send minimal success response
    res.status(200).setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({
      success: true,
      message: 'Logged out successfully'
    }));
  } catch (error) {
    logger.error('Logout error:', error);
    // Avoid sending detailed errors during logout
    res.status(500).setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({
      success: false,
      error: {
        message: 'Logout failed due to an internal error'
      }
    }));
  }
};
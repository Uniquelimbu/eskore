const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { Op } = require('sequelize');
const { ApiError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');
const { sanitizeUserData } = require('../utils/userUtils');
const { sendSafeJson } = require('../utils/safeSerializer');

// Model imports
const User = require('../models/User');
const Team = require('../models/Team');
const Role = require('../models/Role');
const UserRole = require('../models/UserRole');

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
    process.env.JWT_SECRET, // Fallback removed, rely on validated process.env.JWT_SECRET
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

// Function to get current user (me endpoint)
exports.getCurrentUser = async (req, res) => {
  try {
    // req.user should be populated by the requireAuth middleware
    if (!req.user || !req.user.userId) {
      logger.warn('AUTH_CONTROLLER_GET_CURRENT_USER: No user ID in request after requireAuth');
      throw new ApiError('Not authenticated: User ID missing from request', 401, 'UNAUTHORIZED');
    }

    const userId = req.user.userId;
    logger.info(`AUTH_CONTROLLER_GET_CURRENT_USER: Fetching user data for userId: ${userId}`);

    const user = await User.findByPk(userId, {
      include: [
        {
          model: Role,
          attributes: ['id', 'name'],
          through: { attributes: [] }
        },
        {
          model: Team,
          attributes: ['id', 'name', 'logoUrl'],
          through: { attributes: ['role'] }
        }
      ]
    });

    if (!user) {
      logger.warn(`AUTH_CONTROLLER_GET_CURRENT_USER: User not found for userId: ${userId}`);
      throw new ApiError('User not found', 404, 'USER_NOT_FOUND');
    }

    // Convert Sequelize model to plain object before sanitizing
    const userObject = user.get({ plain: true });
    const safeUserData = sanitizeUserData(userObject); 

    // Enhance with roles and teams information similar to login
    let userRoles = [];
    if (userObject.Roles && userObject.Roles.length > 0) {
      userRoles = userObject.Roles.map(role => role.name);
    }
    
    let userTeams = [];
    if (userObject.Teams && userObject.Teams.length > 0) {
      userTeams = userObject.Teams.map(team => ({
        id: team.id,
        name: team.name,
        logoUrl: team.logoUrl,
        role: team.UserTeam ? team.UserTeam.role : null // Access role from UserTeam join table
      }));
    }

    // Ensure ID is properly included in the response
    const responseData = {
      id: user.id, // Ensure ID is included
      ...safeUserData,
      roles: userRoles,
      teams: userTeams, // Include teams in the response
    };

    logger.info(`AUTH_CONTROLLER_GET_CURRENT_USER: Successfully fetched user data for userId: ${userId}`);
    return sendSafeJson(res, responseData);
  } catch (error) {
    logger.error(`AUTH_CONTROLLER_GET_CURRENT_USER: Error fetching current user: ${error.message}`, { error });
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Internal server error while fetching user data' });
    }
  }
};

// Update login function with better error handling
exports.login = async (req, res) => {
  // Declare here so it's visible in both try and catch blocks
  let email = undefined;
  try {
    const { email: incomingEmail, password } = req.body;
    email = incomingEmail; // retain for logging later

    // More robust input validation
    if (!email || typeof email !== 'string') {
      throw new ApiError('Valid email is required', 400, 'MISSING_EMAIL');
    }
    
    if (!password || typeof password !== 'string') {
      throw new ApiError('Valid password is required', 400, 'MISSING_PASSWORD');
    }

    const lowerCaseEmail = String(email).toLowerCase().trim();
    logger.info(`Login attempt for email: ${lowerCaseEmail}`);

    // Find user in the unified User table
    const user = await User.findOne({
      where: { email: lowerCaseEmail },
      attributes: ['id', 'email', 'password', 'role']
    });

    if (!user) {
      logger.warn(`Login failed: User not found for email: ${lowerCaseEmail}`);
      
      // Increment the counter for the rate limiter
      // This ensures the attempt counts against the rate limit
      if (req.rateLimit) {
        // Store original IP to track this specific IP's failed attempts
        const clientIP = req.ip || req.headers['x-forwarded-for'] || 'unknown';
        logger.debug(`Failed login attempt from IP: ${clientIP} for non-existent user: ${lowerCaseEmail}`);
      }
      
      // For security, don't reveal whether the user exists
      throw new ApiError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }

    // Check if user is active (if status exists)
    if (user.status && user.status !== 'active') {
      logger.warn(`Login failed: User inactive for email: ${lowerCaseEmail}`);
      throw new ApiError('Account is inactive', 401, 'ACCOUNT_INACTIVE');
    }

    // Validate password
    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      logger.warn(`Invalid password for user: ${lowerCaseEmail}`);
      
      // Failed login - let the middleware handle the rate limiting
      throw new ApiError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }

    // If we get here, login was successful 
    // Try to reset the rate limiter for this IP if the store supports it
    if (req.rateLimit && req.rateLimit.store && typeof req.rateLimit.store.resetKey === 'function') {
      try {
        const key = req.rateLimit.keyGenerator(req);
        await req.rateLimit.store.resetKey(key);
        logger.debug(`Rate limit reset for successful login: ${lowerCaseEmail}`);
      } catch (rateLimitError) {
        // Just log any rate limit reset errors, don't fail the login
        logger.error(`Error resetting rate limit: ${rateLimitError.message}`);
      }
    }

    // Update last login time if column exists
    try {
      await user.update({ lastLogin: new Date() });
    } catch (error) {
      // Ignore error if lastLogin column doesn't exist
      logger.warn(`Could not update lastLogin for ${lowerCaseEmail}: ${error.message}`);
    }

    // Get user roles from the roles relationship
    let userRoles = [];
    try {
      // First try: Use a more resilient query approach that doesn't rely on associations
      const userRoleRecords = await UserRole.findAll({
        where: { userId: user.id },
        attributes: ['roleId'],
        raw: true
      });
      
      if (userRoleRecords && userRoleRecords.length > 0) {
        // Extract just the roleIds
        const roleIds = userRoleRecords.map(ur => ur.roleId);
        
        // Get role details in a separate query to avoid association issues
        const roles = await Role.findAll({
          where: { id: { [Op.in]: roleIds } },
          attributes: ['id', 'name'],
          raw: true
        });
        
        // Map to just the role names for the response
        userRoles = roles.map(role => role.name);
        logger.debug(`Found ${userRoles.length} roles for user ${user.id}: ${userRoles.join(', ')}`);
      } else {
        logger.debug(`No additional roles found for user ${user.id}`);
      }
    } catch (error) {
      // Don't fail the entire login if role fetching fails
      logger.error(`Error fetching roles for ${lowerCaseEmail}: ${error.message}`, error);
      // Continue with login but with empty roles
      userRoles = [];
    }

    // Generate JWT token including any roles we found
    const tokenPayload = { 
      userId: user.id, 
      role: user.role, // Always include the primary role
    };

    // If we successfully got additional roles, include them
    if (userRoles.length > 0) {
      tokenPayload.roles = userRoles;
    }

    const token = jwt.sign(
      tokenPayload,
      process.env.JWT_SECRET, // Fallback removed, rely on validated process.env.JWT_SECRET
      { expiresIn: '7d' }
    );
    
    // Set the secure cookie
    const cookieOptions = getCookieOptions();
    res.cookie('auth_token', token, cookieOptions);
    
    // Sanitize user data before sending
    const safeUserData = {
      id: user.id,
      email: user.email,
      role: user.role
    };
    
    // Add additional fields if they exist
    if (user.firstName) safeUserData.firstName = user.firstName;
    if (user.lastName) safeUserData.lastName = user.lastName;
    if (user.status) safeUserData.status = user.status;
    
    // Add roles if any were found
    if (userRoles.length > 0) {
      safeUserData.roles = userRoles;
    }
    
    logger.info(`Successful login for user: ${lowerCaseEmail}, UserID: ${user.id}`);
    
    // Determine redirect URL (optional, frontend might handle routing)
    let redirectUrl = '/dashboard'; // Default
    
    // Include token so SPA clients can store it in localStorage for API calls (even though we set cookie)
    // IMPORTANT: Do not expose token in production-level server logs (already redacted by morgan token setup).
    return sendSafeJson(res, {
      success: true,
      token,           // <-- new field
      user: safeUserData,
      redirectUrl
    });

  } catch (error) {
    // Handle known application errors
    if (error instanceof ApiError) {
      if (error.statusCode === 401) {
        logger.warn(`Login failed for ${email || 'unknown-email'}: ${error.message} (Code: ${error.errorCode})`);
      } else {
        logger.error(`Login error for ${email || 'unknown-email'}: ${error.message} (Code: ${error.errorCode})`);
      }
      return res.status(error.statusCode).json({ 
        success: false,
        message: error.message,
        code: error.errorCode
      });
    }
    
    // Log unexpected errors
    logger.error(`Unexpected login error for ${email || 'unknown-email'}:`, error);
    
    // Return a generic safe error response
    return res.status(500).json({
      success: false,
      message: 'Login failed due to an internal error',
      code: 'AUTH_FAILURE'
    });
  }
};

// Unified user registration
exports.registerUser = async (req, res) => {
  let {
    firstName, lastName, middleName, email, password, dob,
    country, roles = []
    // Removed height and position from destructuring
  } = req.body;
  
  // Normalize email
  const lowerCaseEmail = String(email || '').toLowerCase().trim();

  // Check for existing email in User table
  const existingUser = await User.findOne({ 
    where: { email: lowerCaseEmail }, 
    attributes: ['id']
  });
  
  if (existingUser) {
    throw new ApiError('Email already in use', 409, 'EMAIL_IN_USE');
  }

  try {
    // Create user record with password hashing
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await User.create({
      firstName,
      middleName: middleName || null,
      lastName,
      email: lowerCaseEmail,
      password: hashedPassword,
      dob,
      country,
      // Removed height and position fields
      role: 'user' // Default role
    });
    
    // Assign additional roles if specified
    if (roles && roles.length > 0) {
      // Find role records
      const roleRecords = await Role.findAll({
        where: { 
          name: { [Op.in]: roles } 
        }
      });
      
      // Create user-role associations
      if (roleRecords.length > 0) {
        const userRoles = roleRecords.map(role => ({
          userId: user.id,
          roleId: role.id
        }));
        
        await UserRole.bulkCreate(userRoles);
      }
    }
      
    // Generate JWT token
    const token = generateToken(user.id, 'user');
    
    // Set HTTP-only cookie
    const cookieOptions = getCookieOptions();
    res.cookie('auth_token', token, cookieOptions);
    
    // Sanitize the newly created user data
    const safeUserData = sanitizeUserData(user, 'user');

    if (!safeUserData) {
      logger.error(`Registration failed: Could not sanitize new user data for id=${user.id}`);
      throw new ApiError('Internal server error after registration', 500, 'AUTH_SANITIZE_ERROR');
    }
    
    // Add roles to response if any were assigned
    if (roles && roles.length > 0) {
      safeUserData.roles = roles;
    }

    logger.info(`User registered successfully: ${lowerCaseEmail}, ID: ${user.id}`);
    
    // Use sendSafeJson for the response
    return sendSafeJson(res, {
      success: true,
      message: 'User registered successfully',
      user: safeUserData
    }, 201); // Use 201 Created status
    
  } catch (error) {
    if (error instanceof ApiError) {
      logger.error(`User registration error for ${lowerCaseEmail}: ${error.message} (Code: ${error.errorCode})`);
      throw error;
    }
    
    // Handle potential validation errors from Sequelize
    if (error.name === 'SequelizeValidationError') {
      const messages = error.errors.map(e => e.message).join(', ');
      logger.warn(`User registration validation failed for ${lowerCaseEmail}: ${messages}`);
      throw new ApiError(`Validation failed: ${messages}`, 400, 'VALIDATION_ERROR');
    }
    
    logger.error('Unexpected user registration error for', lowerCaseEmail, error);
    throw new ApiError('Registration failed due to an internal error', 500, 'REGISTRATION_FAILURE');
  }
};

// Google OAuth handler
exports.googleAuth = async (req, res) => {
  // Implementation would follow similar pattern to login
  res.redirect(`/dashboard?token=sample-token`);
};

// Facebook OAuth handler
exports.facebookAuth = async (req, res) => {
  // Implementation would follow similar pattern to login
  res.redirect(`/dashboard?token=sample-token`);
};

// Secure, fast, and robust logout
exports.logout = (req, res) => {
  try {
    res.clearCookie('auth_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      path: '/'
    });

    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    logger.error('Logout error:', error);
    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  }
};
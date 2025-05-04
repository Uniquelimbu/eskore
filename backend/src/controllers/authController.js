const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { Op } = require('sequelize');
const { ApiError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');
const { sanitizeUserData } = require('../utils/userUtils');
const { sendSafeJson } = require('../utils/safeSerializer');

// Model imports
// Remove or comment out the legacy model imports
// const Athlete = require('../models/Athlete');
const User = require('../models/User');
const Team = require('../models/Team');
// const Manager = require('../models/Manager');
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

// Login function that now uses the unified User model
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError('Email and password required', 400, 'MISSING_CREDENTIALS');
  }

  const lowerCaseEmail = String(email).toLowerCase().trim();
  logger.info(`Login attempt for email: ${lowerCaseEmail}`);

  try {
    // Find user in the unified User table
    // Modify query to only select columns that are guaranteed to exist
    const user = await User.findOne({
      where: { email: lowerCaseEmail },
      attributes: ['id', 'email', 'password', 'role']
    });

    if (!user) {
      logger.warn(`Login failed: User not found for email: ${lowerCaseEmail}`);
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
      throw new ApiError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }

    // Update last login time if column exists
    try {
      await user.update({ lastLogin: new Date() });
    } catch (error) {
      // Ignore error if lastLogin column doesn't exist
      logger.warn(`Could not update lastLogin for ${lowerCaseEmail}: ${error.message}`);
    }

    // Get user roles from the roles relationship
    const userRoles = [];
    try {
      const roles = await UserRole.findAll({
        where: { userId: user.id },
        include: [{ model: Role, attributes: ['name'] }]
      });
      
      if (roles && roles.length > 0) {
        userRoles.push(...roles.map(ur => ur.Role.name));
      }
    } catch (error) {
      // Don't silently ignore all errors - check for specific expected errors
      if (error.name === 'SequelizeConnectionError' || 
          error.name === 'SequelizeConnectionRefusedError' ||
          error.message.includes('relation "roles" does not exist')) {
        // These are expected errors when roles table doesn't exist
        logger.warn(`Could not fetch roles for ${lowerCaseEmail}: ${error.message}`);
      } else {
        // For other unexpected errors, log as error and include in response
        logger.error(`Database error while fetching roles for ${lowerCaseEmail}:`, error);
        throw new ApiError('Error fetching user roles', 500, 'ROLE_FETCH_ERROR');
      }
    }

    // Generate JWT token using the main role from the user table
    const token = generateToken(user.id, user.role);

    // Set the secure cookie
    const cookieOptions = getCookieOptions();
    res.cookie('auth_token', token, cookieOptions);

    // Sanitize user data before sending - create a basic version that works with minimal schema
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

    // Use sendSafeJson for the final response
    return sendSafeJson(res, {
      success: true,
      user: safeUserData,
      redirectUrl
    });

  } catch (error) {
    // Handle known application errors
    if (error instanceof ApiError) {
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

// Unified user registration
exports.registerUser = async (req, res) => {
  let {
    firstName, lastName, middleName, email, password, dob,
    country, height, position, roles = []
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
      height,
      position,
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

// Update logout function for better security and reliability
exports.logout = async (req, res) => {
  try {
    // Clear auth cookie if it exists
    res.clearCookie('auth_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    // Ensure a consistent response format with other endpoints
    return res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    logger.error('Logout error:', error);
    // Never expose details during security operations like logout
    // Use bypassing technique to avoid any possible serialization issues
    res.status(500).setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      success: false,
      error: {
        message: 'Logout failed - please clear cookies manually',
        code: 'LOGOUT_ERROR'
      }
    }));
  }
};
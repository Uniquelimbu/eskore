const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { Op } = require('sequelize');
const { ApiError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');
const { sanitizeUserData } = require('../utils/userUtils');
const { sendSafeJson } = require('../utils/safeSerializer');

// Model imports
const Athlete = require('../models/Athlete');
const User = require('../models/User');
const Team = require('../models/Team');
const Manager = require('../models/Manager');
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
    const user = await User.findOne({
      where: { email: lowerCaseEmail },
      attributes: ['id', 'email', 'password', 'role', 'firstName', 'lastName', 'status']
    });

    if (!user || user.status !== 'active') {
      logger.warn(`Login failed: User not found or inactive for email: ${lowerCaseEmail}`);
      throw new ApiError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }

    // Validate password
    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      logger.warn(`Invalid password for user: ${lowerCaseEmail}`);
      throw new ApiError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }

    // Update last login time
    await user.update({ lastLogin: new Date() });

    // Get user roles from the roles relationship
    const userRoles = await UserRole.findAll({
      where: { userId: user.id },
      include: [{ model: Role, attributes: ['name'] }]
    });

    const rolesToAdd = [];
    if (userRoles && userRoles.length > 0) {
      rolesToAdd.push(...userRoles.map(ur => ur.Role.name));
    }

    // Generate JWT token using the main role from the user table
    const token = generateToken(user.id, user.role);

    // Set the secure cookie
    const cookieOptions = getCookieOptions();
    res.cookie('auth_token', token, cookieOptions);

    // Sanitize user data before sending
    const safeUserData = sanitizeUserData(user.toJSON(), user.role);
    
    if (!safeUserData) {
      logger.error(`Login failed: Could not sanitize user data for id=${user.id}`);
      throw new ApiError('Internal server error during login', 500, 'AUTH_SANITIZE_ERROR');
    }

    // Add additional roles to the user data (if any)
    if (rolesToAdd.length > 0) {
      safeUserData.roles = rolesToAdd;
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
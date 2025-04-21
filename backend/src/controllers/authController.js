const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { Op } = require('sequelize');
const { ApiError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');
const { sanitizeUserData } = require('../utils/userUtils');
const { toSafeObject } = require('../utils/serializationUtils');
const { sendSafeJson } = require('../utils/safeSerializer');

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

// Login function that checks multiple tables
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError('Email and password required', 400, 'MISSING_CREDENTIALS');
  }

  logger.info(`Login attempt for email: ${email}`);
  
  let userInstance = null;
  let userType = null;
  let userId = null;
  let athleteUser = null;
  
  try {
    // First check in User table
    userInstance = await User.findOne({ 
      where: { email },
      attributes: ['id', 'email', 'password', 'role']
    });
    
    if (userInstance) {
      userType = 'user';
      userId = userInstance.id;
      logger.debug(`User found: ${userInstance.id}`);
      
      // For admin users, also check if they have an athlete record
      if (userInstance.role === 'admin' || userInstance.role === 'athlete_admin') {
        const athleteRecord = await Athlete.findOne({
          where: { email },
          attributes: ['id', 'firstName', 'lastName', 'position', 'country']
        });
        
        // If admin has an athlete record, treat them as an athlete
        if (athleteRecord) {
          // Keep the user record for authentication but use athlete data
          athleteUser = athleteRecord;
          logger.debug(`Admin has athlete record: ${athleteRecord.id}`);
        }
      }
    }
    
    // If not found in User table, check in Athlete table
    if (!userInstance) {
      userInstance = await Athlete.findOne({ 
        where: { email },
        attributes: ['id', 'firstName', 'lastName', 'email', 'passwordHash', 'position', 'country']
      });
      
      if (userInstance) {
        userType = 'athlete';
        userId = userInstance.id;
        logger.debug(`Athlete found: ${userInstance.firstName} ${userInstance.lastName}`);
      }
    }
    
    // If not found in Athlete table, check in Manager table
    if (!userInstance) {
      try {
        userInstance = await Manager.findOne({ 
          where: { email },
          attributes: ['id', 'firstName', 'lastName', 'email', 'passwordHash']
        });
        
        if (userInstance) {
          userType = 'manager';
          userId = userInstance.id;
          logger.debug(`Manager found with ID: ${userInstance.id}`);
        }
      } catch (err) {
        logger.error(`Error checking manager: ${err.message}`);
        // Continue the flow even if Manager model fails
      }
    }
    
    // If not found in Manager table, check in Team table
    if (!userInstance) {
      try {
        userInstance = await Team.findOne({ 
          where: { email },
          attributes: ['id', 'name', 'email', 'passwordHash']
        });
        
        if (userInstance) {
          userType = 'team';
          userId = userInstance.id;
          logger.debug(`Team found: ${userInstance.name}`);
        }
      } catch (err) {
        logger.error(`Error checking team: ${err.message}`);
      }
    }
    
    // If user not found in any table
    if (!userInstance) {
      logger.warn(`User not found in any table for email: ${email}`);
      throw new ApiError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }
    
    // Validate password based on user type
    let isPasswordValid = false;
    
    try {
      logger.debug(`Authenticating ${userType} with email ${email}`);
      
      if (userType === 'athlete') {
        logger.debug(`Athlete password hash: ${userInstance.passwordHash ? userInstance.passwordHash.substring(0, 20) + '...' : 'null'}`);
        isPasswordValid = await bcrypt.compare(password, userInstance.passwordHash);
      } else if (userType === 'user') {
        isPasswordValid = await bcrypt.compare(password, userInstance.password);
      } else {
        const passwordField = userInstance.passwordHash ? 'passwordHash' : 'password';
        isPasswordValid = await bcrypt.compare(password, userInstance[passwordField]);
      }
  
      logger.debug(`Password validation result: ${isPasswordValid}`);
    } catch (err) {
      if (err instanceof ApiError) throw err;
      logger.error(`Error validating password for ${email}:`, err);
      throw new ApiError('Error processing login', 500, 'AUTH_ERROR');
    }
    
    if (!isPasswordValid) {
      logger.warn(`Invalid password for ${userType}: ${email}`);
      throw new ApiError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }
    
    // Create JWT token
    const token = generateToken(userId, userType);
    
    // Configure cookie settings with enhanced security
    const cookieOptions = {
      httpOnly: true, // Prevent JavaScript access
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/', // Available across the entire site
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      secure: process.env.NODE_ENV === 'production'
    };
    
    // Set the cookie
    res.cookie('auth_token', token, cookieOptions);
    logger.debug('Auth cookie set with options:', cookieOptions);
    
    // Create a minimal, safe user object with only essential data
    const safeUserData = {
      id: parseInt(userId, 10) || 0,
      email: String(email).substring(0, 255),
      role: String(userType).substring(0, 50)
    };
    
    // Add minimal fields based on user type - be very conservative
    if (userType === 'athlete' && userInstance) {
      if (userInstance.firstName) {
        safeUserData.firstName = String(userInstance.firstName).substring(0, 100);
      }
      if (userInstance.lastName) {
        safeUserData.lastName = String(userInstance.lastName).substring(0, 100);
      }
    } else if (userType === 'team' && userInstance && userInstance.name) {
      safeUserData.name = String(userInstance.name).substring(0, 200);
    }
    
    // After successful authentication, handle admin with athlete data
    if (userType === 'user' && (userInstance.role === 'admin' || userInstance.role === 'athlete_admin') && athleteUser) {
      // Add athlete fields to the user data
      if (athleteUser.firstName) {
        safeUserData.firstName = String(athleteUser.firstName).substring(0, 100);
      }
      if (athleteUser.lastName) {
        safeUserData.lastName = String(athleteUser.lastName).substring(0, 100);
      }
      if (athleteUser.position) {
        safeUserData.position = String(athleteUser.position).substring(0, 10);
      }
      // Keep admin role for permissions
      safeUserData.role = String(userInstance.role).substring(0, 50);
    }
    
    logger.info(`Successful login for ${userType}: ${email}`);
    
    // Determine redirect URL based on user role
    let redirectUrl = '/dashboard'; // Default
    
    // Send all users (admin, user, athlete) to athlete dashboard for now
    if (userType === 'athlete' || userType === 'admin' || userType === 'user') {
      redirectUrl = '/athlete/home';
    } else if (userType === 'team') {
      redirectUrl = '/team/dashboard';
    } else if (userType === 'manager') {
      redirectUrl = '/manager/dashboard';
    }
    
    // Use our ultra-safe direct response method
    return sendSafeJson(res, {
      success: true,
      token,
      user: safeUserData,
      redirectUrl  // Add the redirectUrl to the response
    });
    
  } catch (error) {
    // Handle known application errors
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Log the error for debugging
    logger.error(`Unexpected login error for ${email}:`, error);
    
    // Return a safe error response
    throw new ApiError('Login failed', 500, 'AUTH_FAILURE');
  }
};

// Register a new athlete
exports.registerAthlete = async (req, res) => {
  const { 
    firstName, lastName, email, password, dob, 
    height, position, country, province, district, city 
  } = req.body;

  // Check if athlete with this email already exists
  const existingAthlete = await Athlete.findOne({ where: { email } });
  if (existingAthlete) {
    throw new ApiError('Email already in use', 400, 'EMAIL_IN_USE');
  }

  // Create athlete record
  const athlete = await Athlete.create({
    firstName,
    lastName,
    email,
    passwordHash: password, // Will be hashed by the model hook
    dob,
    height,
    position,
    country,
    province,
    district,
    city
  });

  // Generate JWT token
  const token = generateToken(athlete.id, 'athlete');

  // Set HTTP-only cookie
  res.cookie('auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000
  });

  // Create a strictly safe user object that will never fail
  const safeUserData = {
    id: Number(athlete.id) || 0,
    email: String(email || ''),
    firstName: String(firstName || ''),
    lastName: String(lastName || ''),
    role: 'athlete'
  };
  
  res.status(201).json({
    success: true,
    message: 'Athlete registered successfully',
    token,
    athlete: safeUserData
  });
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

// Update logout function for better security and to avoid serialization issues
exports.logout = async (req, res) => {
  try {
    // Clear cookie with same settings used to create it
    res.clearCookie('auth_token', {
      httpOnly: true,
      path: '/',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      secure: process.env.NODE_ENV === 'production'
    });
    
    // Use direct response to avoid serialization middleware issues
    res.status(200).setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({
      success: true,
      message: 'Logged out successfully'
    }));
  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({
      success: false,
      error: {
        message: 'Error processing logout'
      }
    }));
  }
};
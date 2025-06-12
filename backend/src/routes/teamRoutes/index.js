const express = require('express');
const router = express.Router();
const log = require('../../utils/log');

// Import all team route modules
const coreRoutes = require('./coreRoutes');
const memberRoutes = require('./memberRoutes');
const mediaRoutes = require('./mediaRoutes');
const playerRoutes = require('./playerRoutes');
const managerRoutes = require('./managerRoutes');
const managementRoutes = require('./managementRoutes');
const searchRoutes = require('./searchRoutes');
const joinRequestRoutes = require('./joinRequestRoutes');

// Middleware for all routes in this router, skip excessive logging
router.use((req, res, next) => {
  // Skip logging for timestamp/polling requests
  if (!req.originalUrl.includes('_t=')) {
    log.info(`TEAMROUTES/INDEX (router.use): Request received for ${req.method} ${req.path}`);
  }
  next();
});

// Mount join request routes FIRST to ensure they get priority
// These routes handle /teams/join-requests/:id/* patterns
router.use('/', joinRequestRoutes);

// Mount member routes
// These routes handle /teams/:id/members/* patterns  
router.use('/', memberRoutes);

// Mount all the team-related routes
log.info('TEAMROUTES/INDEX: Loading team routes');
router.use('/', coreRoutes);         // Basic team CRUD operations
router.use('/', mediaRoutes);        // Logo and media handling
router.use('/', playerRoutes);       // Player-related operations
router.use('/', managerRoutes);      // Manager routes
router.use('/', managementRoutes);   // Management routes (transfer, promote)
router.use('/', searchRoutes);       // Search functionality

log.info('TEAMROUTES/INDEX: All team routes loaded successfully');

module.exports = router;

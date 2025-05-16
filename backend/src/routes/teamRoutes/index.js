const express = require('express');
const router = express.Router();
const log = require('../../utils/log');

// Import all team route modules
const coreRoutes = require('./coreRoutes');
const memberRoutes = require('./memberRoutes');
const mediaRoutes = require('./mediaRoutes');
const managementRoutes = require('./managementRoutes');
const searchRoutes = require('./searchRoutes');

// Middleware for all routes in this router, to log entry
router.use((req, res, next) => {
  log.info(`TEAMROUTES/INDEX (router.use): Request received for ${req.method} ${req.path} (Original URL: ${req.originalUrl})`);
  next();
});

// Mount all the team-related routes
router.use('/', coreRoutes);         // Basic team CRUD operations
router.use('/', memberRoutes);       // Team membership operations
router.use('/', mediaRoutes);        // Logo and media handling
router.use('/', managementRoutes);   // Role transfers and team management
router.use('/', searchRoutes);       // Search functionality

module.exports = router;

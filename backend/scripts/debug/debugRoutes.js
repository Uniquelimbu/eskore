/**
 * Analyzes all routes in the application to verify they can be parsed correctly
 * Useful for diagnosing path-to-regexp errors
 * 
 * Usage: node scripts/debug/debugRoutes.js
 */
const express = require('express');

// Create a temporary router to register routes for inspection
const tempApp = express();

// Load and initialize all route files in a controlled environment
const authRoutes = require('../../src/routes/authRoutes');
const teamRoutes = require('../../src/routes/teamRoutes/index'); // Updated to explicitly use index.js
const matchRoutes = require('../../src/routes/matchRoutes');
const leagueRoutes = require('../../src/routes/leagueRoutes');
const standingsRoutes = require('../../src/routes/standingsRoutes');
// const locationRoutes = require('../../src/routes/locationRoutes');

// Function to safely evaluate routes
function inspectRoutes(router, basePath = '') {
  try {
    const routes = [];
    
    if (router.stack) {
      router.stack.forEach(item => {
        if (item.route) {
          const path = basePath + item.route.path;
          const methods = Object.keys(item.route.methods).map(m => m.toUpperCase()).join(', ');
          routes.push(`${methods} ${path}`);
        } else if (item.name === 'router' && item.handle.stack) {
          // Nested router
          const nestedPath = item.regexp.toString().replace('\\/?(?=\\/|$)/i', '').replace(/^\/\^|\/\$/g, '');
          const nestedRoutes = inspectRoutes(item.handle, basePath + nestedPath);
          routes.push(...nestedRoutes);
        }
      });
    }
    
    return routes;
  } catch (error) {
    console.error(`Error inspecting routes at ${basePath}:`, error.message);
    return [`ERROR: ${basePath} - ${error.message}`];
  }
}

// Try to register routes safely
console.log('🔍 Analyzing route paths for potential issues...');

let success = true;

// Test all routes for potential path-to-regexp errors
try {
  tempApp.use('/api/auth', authRoutes);
  tempApp.use('/api/teams', teamRoutes);
  tempApp.use('/api/matches', matchRoutes);
  tempApp.use('/api/leagues', leagueRoutes);
  tempApp.use('/api/standings', standingsRoutes);
  // tempApp.use('/api/locations', locationRoutes);

  // Inspect and print all routes
  const allRoutes = inspectRoutes(tempApp._router);
  console.log('\n📋 All detected routes:');
  allRoutes.forEach(route => console.log(`  ${route}`));
  
  console.log(`\n✅ Found ${allRoutes.length} routes with no path parsing errors.`);
} catch (error) {
  console.error('❌ Error in route registration:', error);
  console.error('\nThe above error suggests a problem with path-to-regexp parsing in your routes.');
  success = false;
}

// Ensure the script exits with appropriate code
process.exit(success ? 0 : 1);

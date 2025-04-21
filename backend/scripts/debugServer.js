require('dotenv').config();
const express = require('express');
const logger = require('../src/utils/logger');

// Create a minimal express server to debug issues
const app = express();

// Basic CORS handling
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  return next();
});

// Debug middleware to log all URL processing
app.use((req, res, next) => {
  console.log(`[DEBUG] Processing URL: ${req.url}, Method: ${req.method}`);
  next();
});

// Basic routes for testing
app.get('/', (req, res) => {
  res.json({ message: 'Debug server running' });
});

// Add a test route with problematic URL pattern
app.get('/test/:param', (req, res) => {
  res.json({ param: req.params.param });
});

// Start the server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Debug server running on port ${PORT}`);
  console.log('Testing path-to-regexp functionality...');
});

// Test path-to-regexp directly to see if it fails
try {
  const { pathToRegexp } = require('path-to-regexp');
  const testPattern = '/test/:param';
  const testResult = pathToRegexp(testPattern);
  console.log(`✓ path-to-regexp works correctly with pattern: ${testPattern}`);
} catch (error) {
  console.error('✗ path-to-regexp test failed:', error);
}

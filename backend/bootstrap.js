// MINIMAL SERVER FOR BOOTSTRAPPING THE APP
try {
  require('dotenv').config();
} catch (error) {
  console.warn('Warning: .env file not found or invalid. Using default values.');
}

const http = require('http');
const express = require('express');

// Create the simplest possible express app
const app = express();

// Just a health check endpoint with improved response
app.get('/', (req, res) => {
  res.json({
    status: 'healthy',
    message: 'Minimal server running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Start server with no dependencies
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// Add error handling for server startup
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Error: Port ${PORT} is already in use. Choose another port.`);
  } else {
    console.error(`❌ Server error:`, error.message);
  }
  process.exit(1);
});

// Start the server with proper error handling
server.listen(PORT, () => {
  console.log(`✅ Minimal bootstrap server running on ${PORT}`);
  console.log('Use this minimal server for testing and dependency debugging');
});

// Handle graceful shutdown
const gracefulShutdown = () => {
  console.log('Received shutdown signal, closing HTTP server...');
  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });
  
  // Force close if it takes too long
  setTimeout(() => {
    console.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

// Listen for termination signals
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  gracefulShutdown();
});

// Add handler for unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Promise Rejection:', reason);
  // Log the promise that caused the rejection
  console.error('Promise:', promise);
  gracefulShutdown();
});

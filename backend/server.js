require('dotenv').config();
const http = require('http');
const app = require('./src/app');
const logger = require('./src/utils/logger');
const { dbReady } = require('./src/config/db');
const socketIo = require('socket.io');
const validateConfig = require('./src/config/config.validator');
const SocketManager = require('./src/sockets/socketManager');
const setupSwagger = require('./src/docs/swagger');
const initializeModels = require('./src/models/init');

// Validate environment configuration
const config = validateConfig();
const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);

// Set up Socket.IO
const io = socketIo(server, {
  cors: {
    origin: config.ALLOWED_ORIGINS ? config.ALLOWED_ORIGINS.split(',').map(o => o.trim()) : ['http://localhost:3000'],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Initialize socket manager
const socketManager = new SocketManager(io);

// Make io accessible to our routes via req.app.locals
app.locals.io = io;
app.locals.socketManager = socketManager;

// Set up Swagger API docs
setupSwagger(app);

// Handle graceful shutdown
const gracefulShutdown = async (signal) => {
  logger.info(`${signal} received. Starting graceful shutdown...`);
  
  // Close HTTP server (stop accepting new requests)
  server.close(() => {
    logger.info('HTTP server closed.');
  });
  
  try {
    logger.info('Closing database connections...');
    
    // Close database connections
    const db = require('./src/config/db');
    if (db && typeof db.close === 'function') {
      await db.close();
      logger.info('Database connections closed');
    }
    
    logger.info('Graceful shutdown completed.');
    process.exit(0);
  } catch (err) {
    logger.error('Error during graceful shutdown:', err);
    process.exit(1);
  }
};

// Handle termination signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions and rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection:', { reason, promise });
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  // It's often safer to exit the process after an uncaught exception
  if (process.env.NODE_ENV === 'production') {
    gracefulShutdown('UNCAUGHT_EXCEPTION');
  }
});

// Function to start the server
async function startServer() {
  try {
    // Wait for database connection
    const isConnected = await dbReady;
    
    if (!isConnected) {
      logger.error('Database connection failed after retries. Server not starting.');
      process.exit(1);
    }
    
    // Initialize models with safer serialization
    logger.info('Initializing models...');
    const modelsInitialized = initializeModels();
    if (!modelsInitialized) {
      logger.warn('Model initialization might have issues. Proceeding with caution.');
    } else {
      logger.info('All models successfully initialized with enhanced serialization');
    }

    // Start the server
    server.listen(PORT, () => {
      logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
      console.log(`
      ╭───────────────────────────────────────────────╮
      │                                               │
      │   🚀 eSkore API Server running on port ${PORT}    │
      │                                               │
      │   🔗 Local:    http://localhost:${PORT}          │
      │   🌐 API Docs: http://localhost:${PORT}/api-docs  │
      │                                               │
      ╰───────────────────────────────────────────────╯
      `);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();
require('dotenv').config();
const express = require('express');
const cors = require('cors'); // Restored
const cookieParser = require('cookie-parser'); // Restored
const morgan = require('morgan'); // Restored
const path = require('path');
const fs = require('fs');
const helmet = require('helmet');
const compression = require('compression');

const logger = require('./utils/logger'); // Restored
logger.info('APP.JS: Application starting...'); // Restored

// Define custom Morgan token for request body
// This should be defined before morgan is used with the ':body' token
morgan.token('body', (req, res) => {
  if (req.body && Object.keys(req.body).length > 0) {
    // WARNING: This will log the request body.
    // Ensure sensitive data (e.g., passwords) is redacted in production.
    try {
      const bodyToLog = { ...req.body }; // Clone to avoid modifying original
      if (bodyToLog.password) {
        bodyToLog.password = '[REDACTED]';
      }
      // Add other sensitive fields to redact as necessary
      // e.g., if (bodyToLog.email) bodyToLog.email = '[REDACTED]';
      return JSON.stringify(bodyToLog);
    } catch (e) {
      // Use logger if available, otherwise console
      const log = (logger && logger.warn) ? logger.warn : console.warn;
      log('APP.JS: Morgan token "body" - Error stringifying/redacting req.body', { error: e.message });
      return 'ErrorInBodySerialization';
    }
  }
  return '-'; // Placeholder for no body or empty body
});

const { globalErrorHandler, ApiError } = require('./middleware/errorHandler'); // Restored
const corsErrorHandler = require('./middleware/corsErrorHandler'); // Added for specific CORS error handling
const bodyParserErrorHandler = require('./middleware/bodyParserErrorHandler'); // Import the new middleware

// --- Route requires ---
const authRoutes = require('./routes/authRoutes'); // Restored
const userRoutes = require('./routes/userRoutes'); // Restored
const teamRoutes = require('./routes/teamRoutes'); // Now imports the index.js from teamRoutes folder
const tournamentRoutes = require('./routes/tournamentRoutes'); // Restored
const leagueRoutes = require('./routes/leagueRoutes'); // Restored
const matchRoutes = require('./routes/matchRoutes'); // Restored
const leaderboardRoutes = require('./routes/leaderboardRoutes'); // Restored
const formationRoutes = require('./routes/formationRoutes'); // Add the new route
const teamSearchRoutes = require('./routes/teamSearchRoutes'); // New route for /api/teams-search

const app = express();

// --- VERY EARLY RAW REQUEST LOGGER ---
app.use((req, res, next) => {
  // Skip logging for OPTIONS requests (CORS preflight)
  if (req.method === 'OPTIONS') {
    return next();
  }
  
  // Skip logging for requests with timestamp parameters (polling)
  if (req.originalUrl.includes('_t=')) {
    return next();
  }
  
  // Add request ID for tracing through the request lifecycle
  req.requestId = Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
  
  // Using logger here if available, otherwise console for very early stages
  if (logger && typeof logger.info === 'function') {
    logger.info(`APP.JS [${req.requestId}]: INCOMING REQUEST --- Method: ${req.method}, URL: ${req.originalUrl}`);
  } else {
    // Fallback to console.log if logger or logger.info is not available
    console.log(`APP.JS [${req.requestId}]: INCOMING REQUEST --- Method: ${req.method}, URL: ${req.originalUrl}`);
  }
  next();
});

// --- CORE MIDDLEWARE ---
logger.info('APP.JS: Configuring CORS...'); // Restored

// Read CORS settings from environment variables
const allowedOriginsEnv = process.env.ALLOWED_ORIGINS || 'http://localhost:3000';
const allowedMethodsEnv = process.env.ALLOWED_METHODS || 'GET,POST,PUT,PATCH,DELETE,OPTIONS';
const allowedHeadersEnv = process.env.ALLOWED_HEADERS || 'Content-Type,Authorization';

const allowedOrigins = allowedOriginsEnv.split(',').map(o => o.trim());
const allowedMethods = allowedMethodsEnv.split(',').map(m => m.trim());
const allowedHeaders = allowedHeadersEnv.split(',').map(h => h.trim());

logger.info(`CORS: Allowed origins: ${allowedOrigins.join(', ')}`);
logger.info(`CORS: Allowed methods: ${allowedMethods.join(', ')}`);
logger.info(`CORS: Allowed headers: ${allowedHeaders.join(', ')}`);

// Create a CORS configuration that strictly only allows the specified origins
const corsOptions = {
  credentials: true,
  origin: (origin, callback) => {
    // Only allow origins that are explicitly in the allowedOrigins list
    // Also allow undefined origin (same-origin requests)
    if (!origin) {
      // Same-origin requests (no origin header)
      callback(null, true);
      return;
    }
    
    if (allowedOrigins.includes(origin)) {
      // Origin is in the allowed list
      callback(null, true);
    } else {
      // Origin is not allowed
      logger.warn(`CORS: Origin not allowed by Express CORS: ${origin}. Allowed: ${allowedOrigins.join(', ')}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: allowedMethods.join(','),
  allowedHeaders: allowedHeaders.join(','),
  preflightContinue: false,  // Handle OPTIONS requests fully in CORS middleware
  optionsSuccessStatus: 204  // Some legacy browsers choke on 204
};

// Add methods and headers to corsOptions if they're defined
if (allowedMethods && allowedMethods.length > 0) {
  corsOptions.methods = allowedMethods.join(',');
}

if (allowedHeaders && allowedHeaders.length > 0) {
  corsOptions.allowedHeaders = allowedHeaders.join(',');
}
app.use(cors(corsOptions)); // Using updated corsOptions
logger.info('APP.JS: CORS configured.'); // Restored

logger.info('APP.JS: Configuring Cookie Parser...'); // Restored
app.use(cookieParser()); // Restored
logger.info('APP.JS: Cookie Parser configured.'); // Restored

logger.info('APP.JS: Configuring Body Parsers (json, urlencoded)...'); // Restored
app.use(express.json({ 
  limit: '10mb',
  // Save raw body for debugging
  verify: (req, res, buf) => {
    req.rawBody = buf.toString();
  }
}));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Add the body parser error handler immediately after the parsers
app.use(bodyParserErrorHandler);

logger.info('APP.JS: Body Parsers configured.'); // Restored

// Update Morgan logging to also skip timestamp requests
logger.info('APP.JS: Configuring Morgan (HTTP logger)...'); // Restored
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body', {
    stream: { 
      write: message => {
        // Extract request ID from the active request if available
        const reqId = req => req.requestId ? `[${req.requestId}]` : '';
        logger.info(message.trim(), reqId);
      } 
    },
    skip: function (req, res) { 
      return req.url === '/api/ping' || req.method === 'OPTIONS' || req.originalUrl.includes('_t='); 
    }
})); // Restored
logger.info('APP.JS: Morgan configured.'); // Restored

logger.info('APP.JS: Configuring static file serving for /uploads...'); // Restored
app.use('/uploads', express.static(path.join(__dirname, '../uploads'))); // Original path restored
logger.info(`APP.JS: Static file serving for /uploads configured from ${path.join(__dirname, '../uploads')}`); // Restored

// Load models through the index.js file to ensure proper initialization
try {
  const models = require('./models');
  logger.info('Models loaded successfully');
} catch (error) {
  logger.error('Error loading models:', error);
}

// --- API Routes ---
logger.info('APP.JS: Configuring API routes...'); 

// Add a healthcheck endpoint first to detect API availability
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes); 
app.use('/api/users', userRoutes); 
app.use('/api/teams', teamRoutes); 
app.use('/api/tournaments', tournamentRoutes); 
app.use('/api/leagues', leagueRoutes); 
app.use('/api/matches', matchRoutes); 
app.use('/api/leaderboards', leaderboardRoutes); 
app.use('/api', teamSearchRoutes); // Mount standalone search route

// Add debug log before registering formation routes
logger.info('APP.JS: Registering formation routes at /api/formations'); 
app.use('/api/formations', formationRoutes);
logger.info('APP.JS: Formation routes registered successfully');

logger.info('APP.JS: API routes configured.'); 

// --- SERVE FRONTEND BUILD IN PRODUCTION ---
if (process.env.NODE_ENV === 'production') {
  const clientBuildPath = path.join(__dirname, '../../frontend/build');
  if (fs.existsSync(clientBuildPath)) {
    logger.info(`APP.JS: Serving static frontend from ${clientBuildPath}`);
    app.use(express.static(clientBuildPath));

    // For any non-API route, send back index.html so that React Router can handle it
    app.get('*', (req, res, next) => {
      // Skip if the route starts with /api or /uploads (already handled)
      if (req.originalUrl.startsWith('/api') || req.originalUrl.startsWith('/uploads')) {
        return next();
      }
      res.sendFile(path.join(clientBuildPath, 'index.html'));
    });
  } else {
    logger.warn(`APP.JS: Expected React build directory not found at ${clientBuildPath}. Frontend will not be served by Express.`);
  }
}

// --- OTHER ROUTES AND HANDLERS ---
// No need for app.options - the main CORS middleware will handle preflight requests
app.get('/api/ping', (req, res) => { // Restored
  logger.info('APP.JS: GET /api/ping received');
  res.status(200).json({ success: true, message: 'pong', timestamp: new Date() });
});

// Handle 404 for API routes specifically
app.use('/api', (req, res, next) => { // Restored API 404 Handler
  // Enhanced logging for 404 errors to help troubleshoot
  logger.warn(`API 404: No endpoint found for ${req.method} ${req.originalUrl} [${req.requestId}]`);
  next(new ApiError('API endpoint not found', 404, 'NOT_FOUND'));
});

// Custom error handler for route processing errors
app.use((err, req, res, next) => {
  if (err && err.name === 'SyntaxError') {
    logger.error(`Route processing error [${req.requestId}]: ${err.message}`, err);
    return res.status(400).json({
      error: {
        message: 'Invalid JSON format in request',
        code: 'INVALID_JSON'
      }
    });
  }
  
  if (err && err.code === 'ECONNREFUSED') {
    logger.error(`Database connection error [${req.requestId}]: ${err.message}`, err);
    return res.status(503).json({
      error: {
        message: 'Database service unavailable',
        code: 'DB_UNAVAILABLE'
      }
    });
  }
  
  // Forward to the global error handler for other errors
  next(err);
});

// Custom CORS error handler, placed before the global error handler
app.use(corsErrorHandler);

// Global error handler - Update to include request ID
app.use((err, req, res, next) => {
  const requestId = req.requestId || 'unknown';
  
  // Log error with request ID for correlation
  logger.error(`Global error handler [${requestId}]: ${err.message}`, {
    url: req.originalUrl,
    method: req.method,
    statusCode: err.statusCode || 500,
    stack: err.stack
  });
  
  // ...rest of globalErrorHandler remains the same
  // Use the existing globalErrorHandler implementation
  globalErrorHandler(err, req, res, next);
});

logger.info('APP.JS: Application setup complete with enhanced error handling.');
module.exports = app;
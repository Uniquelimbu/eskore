require('dotenv').config();
const express = require('express');
const cors = require('cors'); // Restored
const cookieParser = require('cookie-parser'); // Restored
const morgan = require('morgan'); // Restored
const path = require('path');

const logger = require('./utils/logger'); // Restored
logger.info('APP.JS: Application starting...'); // Restored

const { globalErrorHandler, ApiError } = require('./middleware/errorHandler'); // Restored
const corsErrorHandler = require('./middleware/corsErrorHandler'); // Added for specific CORS error handling

// --- Route requires ---
const authRoutes = require('./routes/authRoutes'); // Restored
const userRoutes = require('./routes/userRoutes'); // Restored
const teamRoutes = require('./routes/teamRoutes'); // Restored
const tournamentRoutes = require('./routes/tournamentRoutes'); // Restored
const leagueRoutes = require('./routes/leagueRoutes'); // Restored
const matchRoutes = require('./routes/matchRoutes'); // Restored
const leaderboardRoutes = require('./routes/leaderboardRoutes'); // Restored

const app = express();

// --- VERY EARLY RAW REQUEST LOGGER ---
app.use((req, res, next) => {
  // Using logger here if available, otherwise console for very early stages
  // Changed from (logger || console).log to logger.info for correct Winston usage
  if (logger && typeof logger.info === 'function') {
    logger.info(`APP.JS: RAW INCOMING REQUEST --- Method: ${req.method}, URL: ${req.originalUrl}`);
  } else {
    // Fallback to console.log if logger or logger.info is not available
    console.log(`APP.JS: RAW INCOMING REQUEST --- Method: ${req.method}, URL: ${req.originalUrl}`);
  }
  next();
});

// --- CORE MIDDLEWARE ---
logger.info('APP.JS: Configuring CORS...'); // Restored

const corsOptions = {
  credentials: true,
  origin: (origin, callback) => {
    // Use ALLOWED_ORIGINS from .env, which is also used by Socket.IO and validated
    // Default to 'http://localhost:3000' if ALLOWED_ORIGINS is not set
    const allowedOriginsEnv = process.env.ALLOWED_ORIGINS || 'http://localhost:3000';
    const allowedOrigins = allowedOriginsEnv.split(',').map(o => o.trim());

    // Allow if origin is in the list, if it's undefined (e.g. same-origin requests not setting Origin header),
    // or if '*' is explicitly in the allowedOrigins list.
    if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      logger.warn(`CORS: Origin not allowed by Express CORS: ${origin}. Allowed: ${allowedOrigins.join(', ')}`);
      // Pass an error to the callback. This will be handled by an error-handling middleware.
      callback(new Error('Not allowed by CORS'));
    }
  }
};
app.use(cors(corsOptions)); // Using updated corsOptions
logger.info('APP.JS: CORS configured.'); // Restored

logger.info('APP.JS: Configuring Cookie Parser...'); // Restored
app.use(cookieParser()); // Restored
logger.info('APP.JS: Cookie Parser configured.'); // Restored

logger.info('APP.JS: Configuring Body Parsers (json, urlencoded)...'); // Restored
app.use(express.json({ limit: '10mb' })); // Restored
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Restored
logger.info('APP.JS: Body Parsers configured.'); // Restored

logger.info('APP.JS: Configuring Morgan (HTTP logger)...'); // Restored
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body', {
    stream: { write: message => logger.info(message.trim()) },
    skip: function (req, res) { return req.url === '/api/ping'; }
})); // Restored
logger.info('APP.JS: Morgan configured.'); // Restored

logger.info('APP.JS: Configuring static file serving for /uploads...'); // Restored
app.use('/uploads', express.static(path.join(__dirname, '../uploads'))); // Original path restored
logger.info(`APP.JS: Static file serving for /uploads configured from ${path.join(__dirname, '../uploads')}`); // Restored

// --- API Routes ---
logger.info('APP.JS: Configuring API routes...'); // Restored
app.use('/api/auth', authRoutes); // Restored
app.use('/api/users', userRoutes); // Restored
app.use('/api/teams', teamRoutes); // Restored
app.use('/api/tournaments', tournamentRoutes); // Restored
app.use('/api/leagues', leagueRoutes); // Restored
app.use('/api/matches', matchRoutes); // Restored
app.use('/api/leaderboards', leaderboardRoutes); // Restored
logger.info('APP.JS: API routes configured.'); // Restored

// --- OTHER ROUTES AND HANDLERS ---
// app.options('*', cors()); // This remains commented out - THIS WAS THE FIX FOR THE ORIGINAL ERROR
app.get('/api/ping', (req, res) => { // Restored
  logger.info('APP.JS: GET /api/ping received');
  res.status(200).json({ success: true, message: 'pong', timestamp: new Date() });
});

// Handle 404 for API routes specifically
app.use('/api', (req, res, next) => { // Restored API 404 Handler
  next(new ApiError('API endpoint not found', 404, 'NOT_FOUND'));
});

// Custom CORS error handler, placed before the global error handler
app.use(corsErrorHandler);

app.use(globalErrorHandler); // Restored

logger.info('APP.JS: Application setup complete (all original app.js handlers restored, CORS updated).'); // Updated log
module.exports = app;
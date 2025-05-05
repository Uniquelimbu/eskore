require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const { errorHandler } = require('./middleware/errorHandler');
const { requestLogger, responseHandler } = require('./middleware/requestMiddleware');
const { safeJsonMiddleware } = require('./middleware/safeResponseMiddleware');
const tokenRefreshMiddleware = require('./middleware/tokenRefresh');
const logger = require('./utils/logger');
const {
  healthCheckLimiter,
  apiLimiter,
  authLimiter,
  failedLoginLimiter
} = require('./utils/rateLimiters');

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: []
    }
  }
}));

// Health check endpoint and limiter
app.get('/api/health', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.status(200);
  const responseText = '{"status":"ok","timestamp":"' +
    new Date().toISOString() +
    '","server":"eSkore API","uptime":' +
    process.uptime() + '}';
  res.end(responseText);
});
app.use('/api/health', healthCheckLimiter);

// Essential Middleware - ORDER MATTERS!
app.use(cookieParser());
app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Logging middleware
app.use(requestLogger);
app.use(morgan('combined', { stream: logger.stream }));

// Response handling middleware
app.use(safeJsonMiddleware);
app.use(responseHandler);

// CORS Middleware
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
    res.header('Access-Control-Allow-Origin', origin || 'http://localhost:3000');
    res.header('Access-Control-Allow-Credentials', 'true');
    // Only log for non-health check endpoints and only on the first request or every 50th request
    if (req.path !== '/api/health' && req.originalUrl !== '/api/health') {
      // Use a counter in app.locals to track request frequency
      app.locals.corsLogCounter = (app.locals.corsLogCounter || 0) + 1;
      if (app.locals.corsLogCounter === 1 || app.locals.corsLogCounter % 50 === 0) {
        console.log(`CORS: Allowing origin ${origin || 'http://localhost:3000'} in development mode (Path: ${req.path})`);
      }
    }
  } else {
    const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(',').map(o => o.trim());
    if (origin && allowedOrigins.includes(origin)) {
      res.header('Access-Control-Allow-Origin', origin);
      res.header('Access-Control-Allow-Credentials', 'true');
    } else {
      console.warn(`CORS: Blocked request from origin ${origin} - not in allowed list: ${allowedOrigins.join(', ')}`);
    }
  }
  res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.header('Access-Control-Max-Age', '86400');
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  next();
});

// Rate limiters
app.use('/api/', apiLimiter);

// JWT config
app.set('jwt', {
  secret: process.env.JWT_SECRET,
  options: {
    expiresIn: '7d',
    algorithm: 'HS256'
  }
});

// Root route
app.get('/', (req, res) => {
  res.status(200).send({
    message: 'eskore.com API Running',
    version: process.env.VERSION || '1.0.0',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// API Routes
const authRoutes = require('./routes/authRoutes');
const standingsRoutes = require('./routes/standingsRoutes');
const leagueRoutes = require('./routes/leagueRoutes');
const teamRoutes = require('./routes/teamRoutes');
const matchRoutes = require('./routes/matchRoutes');
const tournamentRoutes = require('./routes/tournamentRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/standings', standingsRoutes);
app.use('/api/leagues', leagueRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/tournaments', tournamentRoutes);

// 404 handler for unknown API routes
app.use('/api', (req, res) => {
  res.status(404).json({ error: { message: 'API route not found', code: 'NOT_FOUND' } });
});

// Centralized error handler
app.use(errorHandler);

module.exports = app;
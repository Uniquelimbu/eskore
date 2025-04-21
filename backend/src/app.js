require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { errorHandler } = require('./middleware/errorHandler');
const { requestLogger, responseHandler } = require('./middleware/requestMiddleware');
const logger = require('./utils/logger');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const { safeJsonMiddleware } = require('./middleware/safeResponseMiddleware');
const tokenRefreshMiddleware = require('./middleware/tokenRefresh');

const app = express();

// Security middleware - single helmet instance with proper config
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

// Updated CORS implementation with more robust handling
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  // Development environment - accept all origins or localhost
  if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
    // Accept requests from any origin in development mode
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
  } 
  // Production environment - check against allowed origins
  else {
    const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(',').map(o => o.trim());
    
    if (origin && allowedOrigins.includes(origin)) {
      res.header('Access-Control-Allow-Origin', origin);
      res.header('Access-Control-Allow-Credentials', 'true');
    } else {
      console.warn(`CORS: Blocked request from origin ${origin} - not in allowed list: ${allowedOrigins.join(', ')}`);
    }
  }
  
  // Common headers for all environments
  res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.header('Access-Control-Max-Age', '86400'); // 24 hours
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  
  next();
});

// Rate limiting with different strategies based on routes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { message: 'Too many requests', code: 'RATE_LIMIT_EXCEEDED' } }
});

// More strict limiter for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // More restrictive
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { message: 'Too many authentication attempts', code: 'AUTH_RATE_LIMIT' } }
});

// Add a dedicated health check endpoint BEFORE any middleware that might cause problems
// This must be defined before the JSON handling or compression middleware
app.get('/api/health', (req, res) => {
  // Direct response with minimal processing
  res.setHeader('Content-Type', 'application/json');
  res.status(200);
  
  // Pre-stringify the response to avoid any JSON serialization issues
  const responseText = '{"status":"ok","timestamp":"' + 
    new Date().toISOString() + 
    '","server":"eSkore API","uptime":' + 
    process.uptime() + '}';
  
  // Write directly to the response
  res.end(responseText);
});

// Add a special rate limit just for the health check endpoint
const healthCheckLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // limit each IP to 20 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.status(429).end('{"error":{"message":"Too many health checks","code":"HEALTH_RATE_LIMIT"}}');
  }
});

app.use('/api/health', healthCheckLimiter);

// Optimized middleware order for performance
app.use(compression()); // Compress all responses
app.use(cookieParser()); // Parse cookies early
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false, limit: '1mb' }));
app.use(requestLogger); // Add request ID and logging
app.use(safeJsonMiddleware); // Safe JSON handling
app.use(responseHandler); // Standardize response format
app.use(morgan('combined', { stream: logger.stream })); // Request logging

// Add a bypass middleware for critical endpoints
app.use('/api/auth/logout', (req, res, next) => {
  // Special handling - bypass all serialization middleware
  if (req.method === 'POST') {
    req.bypassSerialization = true;
  }
  next();
});

// Apply token refresh middleware only to routes that need authentication
// This improves performance by not running token checks on public routes
app.use('/api/auth/me', tokenRefreshMiddleware); // For auth check endpoints
app.use('/api/teams', tokenRefreshMiddleware); // For protected team data
app.use('/api/matches', tokenRefreshMiddleware); // For protected match data
app.use('/api/leagues', tokenRefreshMiddleware); // For protected league data
// Skip token refresh for /api/auth/login and /api/auth/register to avoid unnecessary processing

// Apply rate limiters
app.use('/api/auth/', authLimiter);
app.use('/api/', apiLimiter);

// JWT configuration - update with more secure defaults
app.set('jwt', {
  secret: process.env.JWT_SECRET,
  options: { 
    expiresIn: '7d',
    algorithm: 'HS256' // Explicitly set algorithm for security
  }
});

// Health check route - simplified to avoid serialization issues
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
const teamRoutes = require('./routes/teamRoutes');
const matchRoutes = require('./routes/matchRoutes');
const standingsRoutes = require('./routes/standingsRoutes');
const leagueRoutes = require('./routes/leagueRoutes');
const locationRoutes = require('./routes/locationRoutes');

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/standings', standingsRoutes);
app.use('/api/leagues', leagueRoutes);
app.use('/api/locations', locationRoutes);

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    error: { 
      message: 'Route not found', 
      code: 'ROUTE_NOT_FOUND',
      path: req.path
    } 
  });
});

// Use the centralized error handler middleware
app.use(errorHandler);

module.exports = app;
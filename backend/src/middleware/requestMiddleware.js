const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

/**
 * Middleware to assign a unique ID to each request and log request details
 */
exports.requestLogger = (req, res, next) => {
  // Generate unique request ID
  req.id = uuidv4();
  
  // Add request ID to response headers
  res.setHeader('X-Request-ID', req.id);
  
  // Log request details
  logger.info({
    requestId: req.id,
    method: req.method,
    path: req.path,
    query: req.query,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    userId: req.user?.id
  });
  
  // Track response time
  const start = Date.now();
  
  // Log response details when complete
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info({
      requestId: req.id,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userId: req.user?.id
    });
  });
  
  next();
};

/**
 * Middleware to ensure all responses follow a standard format
 */
exports.responseHandler = (req, res, next) => {
  // Store original send
  const originalSend = res.send;
  
  // Override send method to standardize responses
  res.send = function (body) {
    // Skip if error (handled by error middleware) or already formatted
    if (res.statusCode >= 400 || (typeof body === 'object' && (body.success !== undefined))) {
      return originalSend.call(this, body);
    }
    
    // Format successful responses consistently
    const formattedBody = {
      success: true,
      data: body,
      requestId: req.id
    };
    
    return originalSend.call(this, formattedBody);
  };
  
  next();
};

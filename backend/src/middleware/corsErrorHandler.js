const logger = require('../utils/logger');

/**
 * Custom middleware to handle CORS errors better
 */
const corsErrorHandler = (err, req, res, next) => {
  if (err.message === 'Not allowed by CORS') {
    logger.warn({
      message: 'CORS error',
      origin: req.headers.origin,
      path: req.path,
      method: req.method,
      ip: req.ip
    });
    
    return res.status(403).json({
      success: false,
      error: {
        message: 'CORS error: Origin not allowed',
        code: 'CORS_ERROR'
      }
    });
  }
  
  // For other errors, pass to the next error handler
  next(err);
};

module.exports = corsErrorHandler;

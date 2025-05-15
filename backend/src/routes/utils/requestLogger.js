/**
 * Request logging middleware for API request tracking
 * 
 * This utility logs incoming API requests for debugging and monitoring purposes.
 */
const morgan = require('morgan');
const logger = require('../../utils/logger');

/**
 * Custom Morgan token for request body
 * Never log sensitive fields like passwords
 */
morgan.token('body', (req) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    return '-';
  }
  
  // Create a sanitized copy of the request body
  const sanitizedBody = { ...req.body };
  
  // Remove sensitive fields
  const sensitiveFields = ['password', 'passwordConfirm', 'token', 'secret', 'apiKey', 'credit_card'];
  sensitiveFields.forEach(field => {
    if (sanitizedBody[field]) {
      sanitizedBody[field] = '[REDACTED]';
    }
  });
  
  return JSON.stringify(sanitizedBody);
});

// Create different formats for development and production
const developmentFormat = ':method :url :status :response-time ms - :body';
const productionFormat = ':remote-addr - :method :url :status :response-time ms - :res[content-length]';

// Create middleware for different environments
const requestLogger = morgan(
  process.env.NODE_ENV === 'production' ? productionFormat : developmentFormat,
  {
    stream: {
      write: (message) => logger.info(message.trim())
    },
    skip: (req, res) => {
      // Skip logging for health check endpoints
      return req.url === '/api/health' || req.url === '/health';
    }
  }
);

module.exports = requestLogger;

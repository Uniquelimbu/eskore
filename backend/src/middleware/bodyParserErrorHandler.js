let logger;
try {
  // Attempt to import the centralized logger
  // This can fail in very early bootstrap stages or during tests
  // where the logger might not yet be built / mocked.
  // If it fails, gracefully fall back to using the console so that
  // body-parser errors never crash the application.
  logger = require('../utils/logger');
} catch (importErr) {
  /* eslint-disable no-console */
  logger = {
    info: console.log,
    warn: console.warn,
    error: console.error,
    debug: console.debug,
  };
  console.warn('[bodyParserErrorHandler] Falling back to console logger:', importErr.message);
  /* eslint-enable no-console */
}

/**
 * Middleware to handle body parser errors
 */
function bodyParserErrorHandler(err, req, res, next) {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    // Handle JSON parsing errors
    logger.warn(`Body parser error: ${err.message}`, {
      path: req.path,
      method: req.method,
      contentType: req.headers['content-type'],
      body: req.rawBody || req.body || '(empty body)'
    });
    
    return res.status(400).json({
      success: false,
      message: 'Invalid request body format',
      details: 'Please ensure your request contains valid JSON data'
    });
  }
  
  // Pass error to next handler if not a body parser error
  return next(err);
}

module.exports = bodyParserErrorHandler;

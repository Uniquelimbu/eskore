const logger = require('./logger'); // existing winston-style logger

// Thin wrapper so rest of code can import one module
module.exports = {
  info: (msg, meta) => logger ? logger.info(msg, meta) : console.log(msg, meta || ''),
  warn: (msg, meta) => logger ? logger.warn(msg, meta) : console.warn(msg, meta || ''),
  error: (msg, meta) => logger ? logger.error(msg, meta) : console.error(msg, meta || '')
}; 
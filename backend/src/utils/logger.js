const winston = require('winston');
require('winston-daily-rotate-file');
const path = require('path');
const fs = require('fs');

// Ensure logs directory exists
const logDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// Define log format
const logFormat = winston.format.printf(({ level, message, timestamp, stack, ...meta }) => {
  return `${timestamp} [${level.toUpperCase()}]: ${message}${stack ? `\n${stack}` : ''}${
    Object.keys(meta).length ? `\n${JSON.stringify(meta, null, 2)}` : ''
  }`;
});

// Add a filter to reduce repetitive CORS logs
const corsFilter = winston.format((info) => {
  // If it's a CORS log and we've seen too many of them, filter it out
  if (typeof info.message === 'string' && 
      info.message.includes('CORS: Allowing origin') &&
      !info.message.includes('blocked')) {
    
    // Use static variable to track CORS log count
    corsFilter.count = (corsFilter.count || 0) + 1;
    
    // Only keep every 50th log or the first one
    if (corsFilter.count === 1 || corsFilter.count % 50 === 0) {
      return info;
    }
    
    // Filter out this log entry
    return false;
  }
  
  return info;
});

// Configure transport for daily rotate file
const fileRotateTransport = new winston.transports.DailyRotateFile({
  filename: path.join(logDir, 'application-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxFiles: '14d',
  maxSize: '20m',
  level: 'info'
});

// Create logger instance
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    corsFilter(), // Add the filter here
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'eskore-api' },
  transports: [
    // Write to all logs with level 'info' and below to the combined file
    fileRotateTransport,
    // Console logger for development
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        logFormat
      ),
    }),
  ],
  // Don't exit on handled exceptions
  exitOnError: false
});

// Create a stream object for Morgan integration
logger.stream = {
  write: (message) => logger.info(message.trim()),
};

module.exports = logger;

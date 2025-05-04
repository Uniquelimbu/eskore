/**
 * Utility script to clean up old log files
 * Useful for clearing space or removing sensitive information
 * 
 * Usage: node scripts/utils/cleanupLogs.js
 */
const fs = require('fs');
const path = require('path');

const logDir = path.join(process.cwd(), 'logs');

try {
  if (fs.existsSync(logDir)) {
    console.log('Cleaning log directory...');
    const files = fs.readdirSync(logDir);
    
    if (files.length === 0) {
      console.log('No log files found to delete.');
      process.exit(0);
    }
    
    console.log(`Found ${files.length} log files.`);
    
    let deletedCount = 0;
    files.forEach(file => {
      if (file.startsWith('application-') && file.endsWith('.log')) {
        fs.unlinkSync(path.join(logDir, file));
        deletedCount++;
      }
    });
    
    console.log(`✅ Successfully deleted ${deletedCount} log files.`);
  } else {
    console.log('Log directory does not exist. Nothing to clean up.');
  }
} catch (error) {
  console.error('Error cleaning logs:', error.message);
  process.exit(1);
}

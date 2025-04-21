/**
 * Utility to detect overly aggressive health check pings
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const readline = require('readline');

async function analyzeHealthChecks() {
  console.log('🔍 Analyzing health check request frequency...');
  
  // Get the most recent log file
  const logDir = path.join(__dirname, '..', 'logs');
  let logFiles = [];
  
  try {
    logFiles = fs.readdirSync(logDir)
      .filter(file => file.startsWith('application-') && file.endsWith('.log'))
      .map(file => ({
        name: file,
        path: path.join(logDir, file),
        date: fs.statSync(path.join(logDir, file)).mtime
      }))
      .sort((a, b) => b.date - a.date); // Sort by most recent
  } catch (error) {
    console.error('❌ Error reading log directory:', error.message);
    return;
  }
  
  if (logFiles.length === 0) {
    console.log('No log files found.');
    return;
  }
  
  console.log(`Analyzing most recent log file: ${logFiles[0].name}`);
  
  // Read the file and count health check requests
  const fileStream = fs.createReadStream(logFiles[0].path);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });
  
  let healthCheckCount = 0;
  let firstTimestamp = null;
  let lastTimestamp = null;
  
  for await (const line of rl) {
    if (line.includes('GET /api/health')) {
      healthCheckCount++;
      
      // Try to extract timestamp from log line
      const timestampMatch = line.match(/\[(.*?)\]/);
      if (timestampMatch && timestampMatch[1]) {
        const timestamp = new Date(timestampMatch[1].replace(':', ' ', 1));
        if (!firstTimestamp) firstTimestamp = timestamp;
        lastTimestamp = timestamp;
      }
    }
  }
  
  if (healthCheckCount === 0) {
    console.log('No health check requests found in the log.');
    return;
  }
  
  // Calculate frequency
  const totalTimeMs = lastTimestamp - firstTimestamp;
  const totalTimeMinutes = totalTimeMs / (1000 * 60);
  const requestsPerMinute = totalTimeMinutes > 0 ? 
    healthCheckCount / totalTimeMinutes : healthCheckCount;
  
  console.log(`Found ${healthCheckCount} health check requests`);
  console.log(`Time span: ${totalTimeMinutes.toFixed(2)} minutes`);
  console.log(`Average frequency: ${requestsPerMinute.toFixed(2)} requests per minute`);
  
  // Provide recommendations based on frequency
  if (requestsPerMinute > 10) {
    console.log('\n⚠️ RECOMMENDATION: Health check frequency is too high');
    console.log('This can cause performance issues. Consider:');
    console.log('1. Reducing frontend polling frequency');
    console.log('2. Implementing a caching strategy for health status');
    console.log('3. Using WebSockets instead of polling for real-time status');
  } else {
    console.log('\n✅ Health check frequency appears reasonable');
  }
}

analyzeHealthChecks().catch(console.error);

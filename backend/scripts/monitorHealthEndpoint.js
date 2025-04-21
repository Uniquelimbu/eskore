/**
 * Diagnostic tool to monitor health endpoint responses
 * Usage: node scripts/monitorHealthEndpoint.js
 */
require('dotenv').config();
const axios = require('axios');
const http = require('http');

// Constants
const NUM_REQUESTS = 10;
const DELAY_MS = 500;
const API_URL = process.env.API_URL || 'http://localhost:5000';
const HEALTH_ENDPOINT = `${API_URL}/api/health`;

// Custom HTTP agent with longer timeout
const agent = new http.Agent({ 
  keepAlive: true,
  maxSockets: 1, // Force sequential requests
  timeout: 10000
});

async function makeHealthRequest(id) {
  console.log(`Request ${id}: Sending health check to ${HEALTH_ENDPOINT}`);
  
  try {
    const startTime = Date.now();
    const response = await axios.get(HEALTH_ENDPOINT, {
      timeout: 5000,
      httpAgent: agent,
      validateStatus: () => true // Don't throw on error status
    });
    const endTime = Date.now();
    
    console.log(`Request ${id}: Status ${response.status}, ${endTime - startTime}ms`);
    if (response.status !== 200) {
      console.log(`Request ${id}: Error response:`, response.data);
    } else {
      console.log(`Request ${id}: Valid response received`);
    }
    return true;
  } catch (error) {
    console.error(`Request ${id}: Failed:`, error.message);
    return false;
  }
}

async function monitorHealthEndpoint() {
  console.log(`🔍 Testing health endpoint ${HEALTH_ENDPOINT}`);
  console.log(`Making ${NUM_REQUESTS} requests with ${DELAY_MS}ms delay between each`);
  console.log('-----------------------------------------------------------');
  
  let successCount = 0;
  
  for (let i = 1; i <= NUM_REQUESTS; i++) {
    const success = await makeHealthRequest(i);
    if (success) successCount++;
    
    // Add delay between requests
    if (i < NUM_REQUESTS) {
      await new Promise(resolve => setTimeout(resolve, DELAY_MS));
    }
  }
  
  console.log('-----------------------------------------------------------');
  console.log(`Results: ${successCount}/${NUM_REQUESTS} successful requests`);
  
  if (successCount === NUM_REQUESTS) {
    console.log('✅ Health endpoint is working properly');
  } else {
    console.log(`⚠️ Health endpoint failed ${NUM_REQUESTS - successCount} times`);
    console.log('Review the server logs for more details on the failures');
  }
}

monitorHealthEndpoint().catch(error => {
  console.error('Script error:', error);
  process.exit(1);
});

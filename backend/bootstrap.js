// MINIMAL SERVER FOR BOOTSTRAPPING THE APP
require('dotenv').config();
const http = require('http');
const express = require('express');

// Create the simplest possible express app
const app = express();

// Just a health check endpoint
app.get('/', (req, res) => {
  res.send('Minimal server running');
});

// Start server with no dependencies
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Minimal bootstrap server running on ${PORT}`);
  console.log('Use this minimal server for testing and dependency debugging');
});

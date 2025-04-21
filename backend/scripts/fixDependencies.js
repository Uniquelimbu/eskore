const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Core dependencies that might be causing issues
const criticalDependencies = [
  'express@5.1.0', 
  'cors@^2.8.5',
  'path-to-regexp@6.2.1', // Force latest version
  'cookie-parser@^1.4.6',
  'dotenv@^16.0.3',
  'bcrypt@^5.1.0'
];

console.log('🔍 Checking for potentially problematic dependencies...');

try {
  // Force reinstall critical dependencies with exact versions
  console.log('🔄 Reinstalling critical dependencies...');
  execSync(`npm install ${criticalDependencies.join(' ')} --save`, { stdio: 'inherit' });
  
  console.log('✅ Dependencies fixed successfully!\n');
  console.log('🚀 You should now be able to start the server without path-to-regexp errors.');
} catch (error) {
  console.error('❌ Error fixing dependencies:', error.message);
  process.exit(1);
}

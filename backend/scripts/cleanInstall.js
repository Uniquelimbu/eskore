const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Directory to clean
const nodeModulesDir = path.join(__dirname, '..', 'node_modules');
const packageLockFile = path.join(__dirname, '..', 'package-lock.json');

console.log('🧹 Starting clean installation process...');

try {
  // Remove node_modules and package-lock.json
  console.log('Removing node_modules directory...');
  if (fs.existsSync(nodeModulesDir)) {
    execSync(`rmdir /s /q "${nodeModulesDir}"`, { stdio: 'inherit' });
  }
  
  console.log('Removing package-lock.json...');
  if (fs.existsSync(packageLockFile)) {
    fs.unlinkSync(packageLockFile);
  }
  
  // Install specific versions to avoid the problematic path-to-regexp
  console.log('Installing core dependencies with specific versions...');
  execSync('npm install express@^5.1.0 path-to-regexp@^6.2.1 router@^1.3.8 --save-exact', { stdio: 'inherit' });
  
  // Now reinstall all other dependencies
  console.log('Installing remaining dependencies...');
  execSync('npm install', { stdio: 'inherit' });
  
  console.log('✅ Clean installation completed successfully!');
  console.log('Try running the bootstrap.js file first to test: node bootstrap.js');
  console.log('If that works, then try the full server: npm run dev');
} catch (error) {
  console.error('❌ Error during clean installation:', error.message);
  process.exit(1);
}

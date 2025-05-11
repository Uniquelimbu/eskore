// This is a JavaScript file that generates the _redirects file during build
// It's a more reliable way to ensure the file is created correctly

const fs = require('fs');
const path = require('path');

// Create the _redirects file with proper content
const redirectsContent = `/* /index.html 200`;

// Write the file to the build directory
fs.writeFileSync(
  path.join(__dirname, '../build/_redirects'), 
  redirectsContent
);

console.log('✅ Created _redirects file for production deployment');

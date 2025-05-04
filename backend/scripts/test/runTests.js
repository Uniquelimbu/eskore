/**
 * Master test script that runs all critical tests in sequence
 * 
 * Usage: 
 *   node scripts/test/runTests.js [test-name]
 */
require('dotenv').config();
const { spawn } = require('child_process');
const path = require('path');

// Define the available tests and their scripts
const tests = {
  'auth': ['authTest.js'],
  'serialization': ['serializationTest.js'],
  'all': ['authTest.js', 'serializationTest.js']
};

// Get the requested test(s) from command line args or default to 'all'
const requestedTest = process.argv[2] || 'all';

// Make sure it's a valid test name
if (!tests[requestedTest]) {
  console.error(`❌ Unknown test "${requestedTest}". Available options: ${Object.keys(tests).join(', ')}`);
  process.exit(1);
}

const scriptsToRun = tests[requestedTest];
console.log(`🧪 Running ${requestedTest} tests...\n`);

// Run each script sequentially
async function runScripts() {
  for (const script of scriptsToRun) {
    console.log(`\n🔍 Running ${script}...\n${'-'.repeat(50)}`);
    
    // Run the script as a child process and wait for it to complete
    const result = await new Promise((resolve) => {
      const child = spawn('node', [path.join(__dirname, script)], {
        stdio: 'inherit'
      });
      
      let hasExited = false;
      
      child.on('close', (code) => {
        hasExited = true;
        resolve({ success: code === 0, code });
      });
      
      // Add timeout handling
      setTimeout(() => {
        if (!hasExited) {
          console.error(`\n⏱️ Test ${script} timed out after 30 seconds!`);
          child.kill();
          resolve({ success: false, code: 'TIMEOUT' });
        }
      }, 30000); // 30 second timeout
    });
    
    if (!result.success) {
      console.error(`\n❌ Test ${script} failed with code: ${result.code}!`);
      process.exit(1);
    }
    
    console.log(`\n✅ ${script} completed successfully\n${'-'.repeat(50)}`);
  }
  
  console.log('\n🎉 All tests passed successfully!');
}

runScripts().catch(err => {
  console.error('❌ Error running tests:', err);
  process.exit(1);
});

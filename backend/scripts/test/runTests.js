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
      
      child.on('close', (code) => {
        resolve(code === 0);
      });
    });
    
    if (!result) {
      console.error(`\n❌ Test ${script} failed!`);
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

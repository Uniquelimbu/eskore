require('dotenv').config();
const { toSerializable } = require('../src/utils/userUtils');

// Import all models to test
const Athlete = require('../src/models/Athlete');
const User = require('../src/models/User');
const Team = require('../src/models/Team');
const Manager = require('../src/models/Manager');

// Maximum safe string length for console display
const MAX_DISPLAY_LENGTH = 500;

/**
 * Helper to try JSON.stringify and catch errors
 * 
 * @param {Object} obj - Object to stringify
 * @param {Number} [spaces=2] - Number of spaces to use in formatting
 * @returns {String} JSON string or error message
 */
function trySerialization(obj, spaces = 2) {
  try {
    return JSON.stringify(obj, null, spaces);
  } catch (error) {
    return `Error: ${error.message}`;
  }
}

/**
 * Test the serialization of an object
 * 
 * @param {String} label - Description of what's being tested
 * @param {Object} obj - Object to test
 */
function testObject(label, obj) {
  console.log(`\n--------- Testing ${label} ---------`);
  
  // Try direct serialization
  console.log('Direct serialization:');
  const directResult = trySerialization(obj);
  if (directResult.startsWith('Error:')) {
    console.log(`❌ Failed: ${directResult}`);
  } else {
    const shortened = directResult.length > MAX_DISPLAY_LENGTH ? 
      directResult.substring(0, MAX_DISPLAY_LENGTH) + '...' : 
      directResult;
    console.log(`✅ Success (${directResult.length} chars)`);
    console.log(shortened);
  }
  
  // Try with toSerializable
  console.log('\nUsing toSerializable:');
  const safeObj = toSerializable(obj);
  const safeResult = trySerialization(safeObj);
  if (safeResult.startsWith('Error:')) {
    console.log(`❌ Failed: ${safeResult}`);
  } else {
    const shortened = safeResult.length > MAX_DISPLAY_LENGTH ? 
      safeResult.substring(0, MAX_DISPLAY_LENGTH) + '...' : 
      safeResult;
    console.log(`✅ Success (${safeResult.length} chars)`);
    console.log(shortened);
  }
}

// Run the test suite
async function main() {
  console.log('🔍 Serialization Debug Tool');
  console.log('============================');
  
  // Test a circular reference object
  const circularObj = { name: 'Test' };
  circularObj.self = circularObj; // Create circular reference
  testObject('Circular reference', circularObj);
  
  // Test database objects
  try {
    // Test an Athlete
    console.log('\nFetching data from database...');
    const athlete = await Athlete.findOne();
    if (athlete) {
      testObject('Athlete model', athlete);
      testObject('Athlete.toJSON()', athlete.toJSON());
    } else {
      console.log('⚠️ No athlete record found');
    }
    
    // Test user model
    const user = await User.findOne();
    if (user) {
      testObject('User model', user);
    }
    
    console.log('\n✅ Test completed');
  } catch (error) {
    console.error('❌ Error fetching data:', error);
  } finally {
    process.exit();
  }
}

main();

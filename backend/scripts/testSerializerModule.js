/**
 * Tests the safeSerializer module functionality
 */
require('dotenv').config();
const { createSafeJson, sendSafeJson } = require('../src/utils/safeSerializer');

// Object with circular reference
const obj = { name: "Test" };
obj.self = obj;

// Add some more problematic data
obj.binary = Buffer.from('test');
obj.fn = function() { return 'test'; };
obj.longText = 'x'.repeat(10000);
obj.date = new Date();

// Test the serializer
console.log('🧪 Testing safeSerializer module...');

try {
  const json = createSafeJson(obj);
  console.log('✅ Serialization succeeded');
  console.log('Result preview:', json.substring(0, 100) + '...');
  
  // Parse it back to verify it's valid JSON
  const parsed = JSON.parse(json);
  console.log('✅ JSON is valid and can be parsed back');
  console.log('Parsed keys:', Object.keys(parsed));
} catch (error) {
  console.error('❌ Serialization failed:', error);
}

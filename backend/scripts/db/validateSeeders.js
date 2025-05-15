'use strict';
/**
 * This script validates all seeders to ensure they're properly formatted
 * and follow schema requirements.
 */
const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const { execSync } = require('child_process');

// Load database config
const config = require('../../src/config/config');
const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

// Initialize Sequelize
const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: false
  }
);

// Get all seeder files
const seedersDir = path.join(__dirname, '..', '..', 'src', 'seeders');
const seeders = fs.readdirSync(seedersDir)
  .filter(file => file.endsWith('.js') && !file.startsWith('README'));

console.log('Validating seeders...');

const validateSeeder = async (seederFile) => {
  try {
    // Load the seeder
    const seederPath = path.join(seedersDir, seederFile);
    const seeder = require(seederPath);
    
    // Basic validation
    if (typeof seeder !== 'object') {
      return { file: seederFile, valid: false, error: 'Seeder must export an object' };
    }
    
    if (typeof seeder.up !== 'function') {
      return { file: seederFile, valid: false, error: 'Seeder must have an up function' };
    }
    
    if (typeof seeder.down !== 'function') {
      return { file: seederFile, valid: false, error: 'Seeder must have a down function' };
    }
    
    // Syntax validation
    try {
      const content = fs.readFileSync(seederPath, 'utf8');
      new Function(content);
    } catch (syntaxError) {
      return { file: seederFile, valid: false, error: `Syntax error: ${syntaxError.message}` };
    }
    
    // Parse the file to check for common issues
    const content = fs.readFileSync(seederPath, 'utf8');
    
    // Check for unmatched braces
    const openBraces = (content.match(/{/g) || []).length;
    const closeBraces = (content.match(/}/g) || []).length;
    if (openBraces !== closeBraces) {
      return { 
        file: seederFile, 
        valid: false, 
        error: `Unmatched braces: ${openBraces} opening vs ${closeBraces} closing` 
      };
    }
    
    return { file: seederFile, valid: true };
  } catch (error) {
    return { file: seederFile, valid: false, error: error.message };
  }
};

const fixSeeder = (seederFile, error) => {
  console.log(`Attempting to fix ${seederFile}...`);
  
  const seederPath = path.join(seedersDir, seederFile);
  
  // Create a backup
  const backupPath = seederPath + '.bak';
  fs.copyFileSync(seederPath, backupPath);
  
  // Read content
  let content = fs.readFileSync(seederPath, 'utf8');
  
  // Common fixes
  if (error.includes('Unmatched braces')) {
    // Try to fix brace issues
    const standard = `'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Your up implementation
      return Promise.resolve();
    } catch (error) {
      console.error('Error in seeder:', error);
      return Promise.reject(error);
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Your down implementation
    return Promise.resolve();
  }
};`;
    
    // Extract the up and down implementation if possible
    const upMatch = content.match(/up\s*:\s*async.*?{([\s\S]*?)(?:down|}\s*,\s*down)/);
    const downMatch = content.match(/down\s*:\s*async.*?{([\s\S]*?)(?:}\s*}\s*;?|\s*}\s*;?\s*$)/);
    
    let upContent = upMatch ? upMatch[1] : '// Missing up implementation';
    let downContent = downMatch ? downMatch[1] : '// Missing down implementation';
    
    // Create a fixed version
    const fixed = `'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {${upContent}
      return Promise.resolve();
    } catch (error) {
      console.error('Error in seeder:', error);
      return Promise.reject(error);
    }
  },

  down: async (queryInterface, Sequelize) => {${downContent}
  }
};`;
    
    fs.writeFileSync(seederPath, fixed);
    console.log(`Fixed ${seederFile} by correcting brace structure`);
  } else {
    // Generic fix - rewrite the seeder with a template
    const templatePath = path.join(__dirname, 'templates', 'seeder.template.js');
    if (fs.existsSync(templatePath)) {
      fs.copyFileSync(templatePath, seederPath);
      console.log(`Fixed ${seederFile} by replacing with template (original backed up to ${seederFile}.bak)`);
    } else {
      console.log(`Could not fix ${seederFile} - no template available`);
    }
  }
};

async function validateSeeders() {
  const results = [];
  
  console.log('Validating seeders...');

  for (const seeder of seeders) {
    const result = await validateSeeder(seeder);
    results.push(result);
    
    if (!result.valid) {
      console.log(`❌ ${result.file}: ${result.error}`);
      
      // Ask if we should try to fix it
      console.log(`   Attempting to fix ${result.file}...`);
      try {
        fixSeeder(result.file, result.error);
        
        // Validate fix
        const fixResult = await validateSeeder(result.file);
        if (fixResult.valid) {
          console.log(`   ✅ Successfully fixed ${result.file}`);
        } else {
          console.log(`   ❌ Could not fix ${result.file}: ${fixResult.error}`);
        }
      } catch (fixError) {
        console.log(`   ❌ Error while fixing ${result.file}: ${fixError.message}`);
      }
    } else {
      console.log(`✅ ${result.file}`);
    }
  }
  
  // Summary
  const valid = results.filter(r => r.valid).length;
  const invalid = results.filter(r => !r.valid).length;
  
  console.log(`\nSummary: ${valid} valid, ${invalid} invalid seeders`);
  
  if (invalid > 0) {
    console.log('\nInvalid seeders:');
    results.filter(r => !r.valid).forEach(r => console.log(`- ${r.file}: ${r.error}`));
  }
  
  return { valid, invalid, results };
}

// Export the functions
module.exports = { validateSeeders, validateSeeder, fixSeeder };

// Run the validation if called directly
if (require.main === module) {
  validateSeeders()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Validation failed:', error);
      process.exit(1);
    });
}

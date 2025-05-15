/**
 * Template Generator Script
 * 
 * Uses the database templates to generate new files like migrations,
 * seeds, and other database-related scripts.
 */

const fs = require('fs');
const path = require('path');
const { validateTemplate } = require('./templates/utilities/template-validator');

/**
 * Generates a new file from a template
 * @param {string} templatePath Path to the template file
 * @param {Object} params Parameters to pass to the template
 * @param {string} outputPath Where to save the generated file
 * @returns {Promise<string>} Path to the generated file
 */
async function generateFromTemplate(templatePath, params, outputPath) {
  try {
    // Validate template
    const templateType = path.basename(path.dirname(templatePath));
    const validation = validateTemplate(templatePath, templateType);
    
    if (!validation.valid) {
      console.error('Template validation failed:', validation.errors);
      throw new Error('Invalid template');
    }
    
    // Load and execute template
    const template = require(templatePath);
    const result = template(params);
    
    // Create output directory if it doesn't exist
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Determine output format based on template result type
    let content;
    if (typeof result === 'string') {
      content = result;
    } else if (typeof result === 'object') {
      if (result.up && result.down) {
        // Migration format
        content = `'use strict';

module.exports = {
  up: ${result.up},
  
  down: ${result.down}
};`;
      } else {
        // Generic object
        content = `'use strict';

module.exports = ${JSON.stringify(result, null, 2)};`;
      }
    } else {
      throw new Error('Template returned unexpected format');
    }
    
    // Write the file
    fs.writeFileSync(outputPath, content);
    console.log(`Generated file: ${outputPath}`);
    return outputPath;
  } catch (error) {
    console.error('Error generating from template:', error);
    throw error;
  }
}

/**
 * Generate a new migration
 * @param {string} name Name of the migration
 * @param {string} template Template to use
 * @param {Object} params Parameters for the template
 */
async function generateMigration(name, template, params) {
  const timestamp = new Date().toISOString().replace(/[-T:.Z]/g, '').slice(0, 14);
  const filename = `${timestamp}-${name}.js`;
  const migrationsDir = path.resolve(__dirname, '../../migrations');
  const outputPath = path.join(migrationsDir, filename);
  
  const templatePath = path.resolve(__dirname, `./templates/migrations/${template}.js`);
  return generateFromTemplate(templatePath, params, outputPath);
}

// Export functions
module.exports = {
  generateFromTemplate,
  generateMigration
};

// If run directly from command line
if (require.main === module) {
  // Simple CLI interface
  const [,, command, ...args] = process.argv;
  
  switch (command) {
    case 'migration':
      const [name, template, paramsJson] = args;
      if (!name || !template) {
        console.error('Usage: node generate-from-template.js migration <name> <template> [paramsJson]');
        process.exit(1);
      }
      const params = paramsJson ? JSON.parse(paramsJson) : {};
      generateMigration(name, template, params)
        .then(() => process.exit(0))
        .catch(err => {
          console.error(err);
          process.exit(1);
        });
      break;
      
    default:
      console.error('Unknown command. Available commands: migration');
      process.exit(1);
  }
}

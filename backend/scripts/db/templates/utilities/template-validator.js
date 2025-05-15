/**
 * Template Validator
 * 
 * Validates database templates against predefined schemas to ensure they meet
 * project standards before use in production.
 * 
 * @version 1.1.0
 * @author Eskore Development Team
 * @updated 2023-12-15
 */

const fs = require('fs');
const path = require('path');

/**
 * Validates a template against its expected schema
 * @param {string} templatePath Path to the template file
 * @param {string} templateType Type of template (migration, seed, etc.)
 * @returns {Object} Validation result {valid: boolean, errors: string[], file: string}
 */
function validateTemplate(templatePath, templateType) {
  // Ensure template exists
  if (!fs.existsSync(templatePath)) {
    return {
      valid: false,
      errors: [`Template file does not exist: ${templatePath}`],
      file: path.basename(templatePath)
    };
  }
  
  try {
    const templateContent = fs.readFileSync(templatePath, 'utf8');
    const errors = [];
    
    // Basic validation for all templates
    if (!templateContent.includes('/**')) {
      errors.push('Missing documentation header comment');
    }
    
    // Check for version information
    if (!templateContent.includes('@version') && !templateContent.includes('Last Updated:')) {
      errors.push('Missing version information (@version or Last Updated)');
    }
    
    // Check module exports
    if (!templateContent.includes('module.exports')) {
      errors.push('Template does not export anything');
    }
    
    // Check for syntax errors
    try {
      // Test that the file is valid JavaScript
      new Function(templateContent);
    } catch (syntaxError) {
      errors.push(`Syntax error: ${syntaxError.message}`);
    }
    
    // Type-specific validation
    switch(templateType) {
      case 'migration':
        if (!templateContent.includes('up') || !templateContent.includes('down')) {
          errors.push('Migration template must include both "up" and "down" functions');
        }
        
        // Ensure transaction handling
        if (!templateContent.includes('queryInterface')) {
          errors.push('Migration template should use queryInterface');
        }
        break;
        
      case 'seed':
        if (!templateContent.includes('bulkInsert') && !templateContent.includes('create')) {
          errors.push('Seed template should use bulkInsert or create methods');
        }
        
        // Ensure error handling
        if (!templateContent.includes('try') || !templateContent.includes('catch')) {
          errors.push('Seed template should include try-catch error handling');
        }
        break;
        
      case 'schema':
        if (!templateContent.includes('model') && !templateContent.includes('Model')) {
          errors.push('Schema template should define a model');
        }
        break;
        
      case 'query':
        if (!templateContent.includes('params') && !templateContent.includes('parameters')) {
          errors.push('Query template should parameterize input values');
        }
        break;
    }
    
    return {
      valid: errors.length === 0,
      errors,
      file: path.basename(templatePath)
    };
  } catch (error) {
    return {
      valid: false,
      errors: [`Error reading/parsing template: ${error.message}`],
      file: path.basename(templatePath)
    };
  }
}

/**
 * Validates all templates in a directory
 * @param {string} directory Directory containing templates
 * @param {string} templateType Type of templates in the directory
 * @returns {Object} Validation results for all templates
 */
function validateTemplatesInDirectory(directory, templateType) {
  try {
    if (!fs.existsSync(directory)) {
      return { error: `Directory does not exist: ${directory}` };
    }
    
    const files = fs.readdirSync(directory);
    const results = {};
    
    files.forEach(file => {
      if (file.endsWith('.js') || file.endsWith('.sql')) {
        const filePath = path.join(directory, file);
        results[file] = validateTemplate(filePath, templateType);
      }
    });
    
    return results;
  } catch (error) {
    return { error: `Error validating templates in ${directory}: ${error.message}` };
  }
}

/**
 * Validates all templates in the templates directory
 * @returns {Object} Validation results by directory and file
 */
function validateAllTemplates() {
  const templatesDir = path.resolve(__dirname, '..');
  const directories = [
    { path: path.join(templatesDir, 'migrations'), type: 'migration' },
    { path: path.join(templatesDir, 'seeds'), type: 'seed' },
    { path: path.join(templatesDir, 'schemas'), type: 'schema' },
    { path: path.join(templatesDir, 'queries'), type: 'query' }
  ];
  
  const results = {};
  
  directories.forEach(dir => {
    if (fs.existsSync(dir.path)) {
      results[dir.type] = validateTemplatesInDirectory(dir.path, dir.type);
    }
  });
  
  return results;
}

module.exports = {
  validateTemplate,
  validateTemplatesInDirectory,
  validateAllTemplates
};

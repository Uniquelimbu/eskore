/**
 * Database Scripts Entry Point
 * 
 * This module provides a unified interface to all database management tools.
 */

const path = require('path');
const { validateAllTemplates } = require('./templates/utilities/template-validator');
const { generateFromTemplate, generateMigration } = require('./generate-from-template');
const { validateSeeders, fixSeeder } = require('./validateSeeders');
const { organizeTemplates } = require('./organize-templates');
const { validateSchema } = require('./validateSchema'); // Add this import

/**
 * Run a comprehensive database maintenance routine
 */
async function maintainDatabase() {
  console.log('🛠️ Starting database maintenance...');
  
  // Organize templates first
  await organizeTemplates();
  
  // Validate templates
  console.log('\n🔍 Validating templates...');
  const templateResults = await validateAllTemplates();
  
  let hasTemplateErrors = false;
  Object.entries(templateResults).forEach(([type, results]) => {
    const typeErrors = Object.values(results).filter(r => !r.valid);
    if (typeErrors.length > 0) {
      hasTemplateErrors = true;
      console.error(`❌ Found ${typeErrors.length} invalid ${type} templates`);
      typeErrors.forEach(err => {
        console.error(`  - ${err.file}: ${err.errors.join(', ')}`);
      });
    } else {
      console.log(`✅ All ${type} templates are valid`);
    }
  });
  
  // Validate seeders
  console.log('\n🔍 Validating seeders...');
  const seederResults = await validateSeeders();
  
  // Report results
  console.log('\n📊 Database Maintenance Summary:');
  console.log(`- Template Directory: ${path.resolve(__dirname, 'templates')}`);
  console.log(`- Template Status: ${hasTemplateErrors ? '❌ Errors found' : '✅ All valid'}`);
  console.log(`- Seeder Status: ${seederResults.invalid > 0 ? `❌ ${seederResults.invalid} invalid` : '✅ All valid'}`);
  
  console.log('\n✅ Database maintenance completed!');
}

// Export all functionality
module.exports = {
  templates: {
    validate: validateAllTemplates,
    generate: generateFromTemplate
  },
  migrations: {
    generate: generateMigration
  },
  seeders: {
    validate: validateSeeders,
    fix: fixSeeder
  },
  schema: {
    validate: validateSchema  // Add schema validation export
  },
  organize: organizeTemplates,
  maintain: maintainDatabase
};

// Allow running directly
if (require.main === module) {
  maintainDatabase()
    .then(() => process.exit(0))
    .catch(err => {
      console.error('Database maintenance failed:', err);
      process.exit(1);
    });
}

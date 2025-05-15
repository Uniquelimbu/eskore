#!/usr/bin/env node
/**
 * Database Tools CLI
 * 
 * Command line interface for database management scripts
 * 
 * Usage:
 *   node cli.js <command> [options]
 * 
 * Commands:
 *   validate    - Validate templates and seeders
 *   generate    - Generate a new file from a template
 *   organize    - Organize the templates directory
 *   docs        - Generate documentation
 */

const { templates, migrations, seeders, organize, maintain } = require('./index');
const generateDocs = require('./generate-docs');

// Parse arguments
const args = process.argv.slice(2);
const command = args[0];
const options = args.slice(1);

// Print usage info
function printUsage() {
  console.log(`
Database Tools CLI

Usage:
  node cli.js <command> [options]

Commands:
  validate                       - Validate all templates and seeders
  validate-templates             - Validate only templates
  validate-seeders               - Validate only seeders
  
  generate migration <name> <template> <params>  - Generate a new migration
  generate docs                  - Generate documentation
  
  organize                       - Organize the templates directory
  maintain                       - Run all maintenance tasks
  
  help                           - Show this help message
`);
}

// Handle commands
async function main() {
  switch (command) {
    case 'validate':
      console.log('Validating templates and seeders...');
      const templateResults = await templates.validate();
      const seederResults = await seeders.validate();
      console.log('Validation complete.');
      break;
      
    case 'validate-templates':
      console.log('Validating templates...');
      await templates.validate();
      break;
      
    case 'validate-seeders':
      console.log('Validating seeders...');
      await seeders.validate();
      break;
      
    case 'generate':
      const genType = options[0];
      
      if (genType === 'migration') {
        const [name, template, paramsJson] = options.slice(1);
        if (!name || !template) {
          console.error('Usage: node cli.js generate migration <name> <template> [paramsJson]');
          process.exit(1);
        }
        const params = paramsJson ? JSON.parse(paramsJson) : {};
        await migrations.generate(name, template, params);
      }
      else if (genType === 'docs') {
        await generateDocs();
      }
      else {
        console.error(`Unknown generation type: ${genType}`);
        console.error('Available types: migration, docs');
        process.exit(1);
      }
      break;
      
    case 'organize':
      console.log('Organizing templates directory...');
      await organize();
      break;
      
    case 'maintain':
      console.log('Running database maintenance...');
      await maintain();
      break;
      
    case 'help':
    case '--help':
    case '-h':
      printUsage();
      break;
      
    default:
      console.error(`Unknown command: ${command}`);
      printUsage();
      process.exit(1);
  }
}

// Run the CLI
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Error:', error);
    process.exit(1);
  });

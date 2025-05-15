#!/usr/bin/env node
/**
 * Database Tools CLI
 * 
 * Command line interface for database management scripts
 * 
 * Usage:
 *   node cli [command] [options]
 * 
 * Commands:
 *   validate    - Validate templates and seeders
 *   generate    - Generate a new file from a template
 *   organize    - Organize the templates directory
 *   docs        - Generate documentation
 */

const path = require('path');
const readline = require('readline');
const { execSync } = require('child_process');

// Import our database tools
// Note: Adjust these paths to match your actual setup
let templates, migrations, seeders, organize, maintain;
try {
  const dbTools = require('../index');
  templates = dbTools.templates;
  migrations = dbTools.migrations;
  seeders = dbTools.seeders;
  organize = dbTools.organize;
  maintain = dbTools.maintain;
} catch (error) {
  console.error('Error loading database tools:', error.message);
  console.error('Make sure the required modules are available in ../index.js');
  process.exit(1);
}

// Try to load the docs generator
let generateDocs;
try {
  generateDocs = require('../generate-docs');
} catch (error) {
  generateDocs = async () => {
    console.error('Documentation generator not available:', error.message);
    return false;
  };
}

// Set up interactive mode
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: 'db-cli> '
});

// Print usage info
function printUsage() {
  console.log(`
Database Tools CLI

Usage:
  node cli [command] [options]

Commands:
  validate                       - Validate all templates and seeders
  validate-templates             - Validate only templates
  validate-seeders               - Validate only seeders
  
  generate migration <name> <template> <params>  - Generate a new migration
  generate docs                  - Generate documentation
  
  organize                       - Organize the templates directory
  maintain                       - Run all maintenance tasks
  
  help                           - Show this help message
  exit                           - Exit the CLI (interactive mode only)
  
  run <script>                   - Run a database script (e.g., run resetDb)

Interactive Mode:
  If you run the CLI without arguments, it enters interactive mode
  where you can type commands directly.
`);
}

// Handle commands
async function executeCommand(command, options) {
  try {
    switch (command) {
      case 'validate':
        console.log('Validating templates and seeders...');
        const templateResults = await templates.validate();
        const seederResults = await seeders.validate();
        console.log('Validation complete.');
        return true;
        
      case 'validate-templates':
        console.log('Validating templates...');
        await templates.validate();
        return true;
        
      case 'validate-seeders':
        console.log('Validating seeders...');
        await seeders.validate();
        return true;
        
      case 'generate':
        const genType = options[0];
        
        if (genType === 'migration') {
          const [name, template, paramsJson] = options.slice(1);
          if (!name || !template) {
            console.error('Usage: generate migration <name> <template> [paramsJson]');
            return false;
          }
          const params = paramsJson ? JSON.parse(paramsJson) : {};
          await migrations.generate(name, template, params);
          return true;
        }
        else if (genType === 'docs') {
          await generateDocs();
          return true;
        }
        else {
          console.error(`Unknown generation type: ${genType}`);
          console.error('Available types: migration, docs');
          return false;
        }
        
      case 'organize':
        console.log('Organizing templates directory...');
        await organize();
        return true;
        
      case 'maintain':
        console.log('Running database maintenance...');
        await maintain();
        return true;
        
      case 'run':
        const scriptName = options[0];
        if (!scriptName) {
          console.error('Please specify a script to run');
          return false;
        }
        
        try {
          // Find the script in the db directory
          const scriptPath = path.resolve(__dirname, '..', `${scriptName}.js`);
          console.log(`Running script: ${scriptPath}`);
          
          // Execute the script
          execSync(`node "${scriptPath}"`, { stdio: 'inherit' });
          return true;
        } catch (err) {
          console.error(`Error running script: ${err.message}`);
          return false;
        }
        
      case 'help':
      case '--help':
      case '-h':
        printUsage();
        return true;
        
      case 'exit':
      case 'quit':
      case 'q':
        return 'exit'; // Special return value for interactive mode
        
      case '':
        // Empty command, just skip
        return true;
        
      default:
        console.error(`Unknown command: ${command}`);
        console.log('Type "help" for available commands');
        return false;
    }
  } catch (error) {
    console.error('Error executing command:', error);
    return false;
  }
}

// Run in interactive mode
async function startInteractiveMode() {
  console.log('Starting database CLI in interactive mode...');
  console.log('Type "help" for available commands or "exit" to quit');
  
  rl.prompt();
  
  rl.on('line', async (line) => {
    const args = line.trim().split(/\s+/);
    const cmd = args[0];
    const options = args.slice(1);
    
    if (cmd) {
      const result = await executeCommand(cmd, options);
      if (result === 'exit') {
        rl.close();
        return;
      }
    }
    
    rl.prompt();
  }).on('close', () => {
    console.log('Exiting database CLI');
    process.exit(0);
  });
}

// Main function
async function main() {
  // Parse arguments
  const args = process.argv.slice(2);
  const command = args[0];
  const options = args.slice(1);
  
  // If no command is provided, enter interactive mode
  if (!command) {
    return startInteractiveMode();
  }
  
  // Otherwise, execute the command and exit
  const result = await executeCommand(command, options);
  process.exit(result ? 0 : 1);
}

// Start the CLI
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

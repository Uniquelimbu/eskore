/**
 * Documentation Generator
 * 
 * Generates comprehensive documentation for database scripts, models, and templates
 * 
 * Usage: node scripts/db/generate-docs.js [output-dir]
 */

const fs = require('fs');
const path = require('path');
const { validateAllTemplates } = require('./templates/utilities/template-validator');

/**
 * Generate documentation for database scripts and templates
 * @param {string} [outputDir=docs/db] Output directory for documentation
 */
async function generateDocs(outputDir = path.join(process.cwd(), 'docs', 'db')) {
  console.log('📝 Generating database documentation...');
  
  // Create output directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
    console.log(`Created directory: ${outputDir}`);
  }
  
  // Generate template documentation
  await generateTemplatesDocs(outputDir);
  
  // Generate script documentation
  generateScriptsDocs(outputDir);
  
  // Generate database schema documentation (if models are accessible)
  try {
    const modelsPath = path.join(process.cwd(), 'src', 'models');
    if (fs.existsSync(modelsPath)) {
      await generateSchemaDocs(outputDir);
    }
  } catch (error) {
    console.warn('⚠️ Could not generate schema documentation:', error.message);
  }
  
  console.log(`✅ Documentation generated in ${outputDir}`);
}

/**
 * Generate documentation for templates
 */
async function generateTemplatesDocs(outputDir) {
  console.log('Generating template documentation...');
  
  // Validate templates to get their details
  const templates = await validateAllTemplates();
  const templateTypes = Object.keys(templates);
  
  let docsContent = `# Database Templates\n\n`;
  docsContent += `This document provides an overview of all database templates.\n\n`;
  
  for (const type of templateTypes) {
    docsContent += `## ${type.charAt(0).toUpperCase() + type.slice(1)} Templates\n\n`;
    
    const typeTemplates = templates[type];
    for (const [filename, details] of Object.entries(typeTemplates)) {
      docsContent += `### ${filename}\n\n`;
      
      if (details.valid) {
        docsContent += `Status: ✅ Valid\n\n`;
      } else {
        docsContent += `Status: ❌ Invalid\n\n`;
        docsContent += `Issues:\n`;
        details.errors.forEach(err => {
          docsContent += `- ${err}\n`;
        });
        docsContent += `\n`;
      }
      
      const templatePath = path.join(__dirname, 'templates', type, filename);
      if (fs.existsSync(templatePath)) {
        try {
          const content = fs.readFileSync(templatePath, 'utf8');
          
          // Extract description from comments
          const descriptionMatch = content.match(/\/\*\*[\s\S]*?\*\//);
          if (descriptionMatch) {
            const description = descriptionMatch[0]
              .replace(/\/\*\*|\*\//g, '')
              .replace(/\n\s*\*/g, '\n')
              .trim();
            
            docsContent += `${description}\n\n`;
          }
          
          // Add example usage section
          if (content.includes('Example usage:')) {
            const exampleMatch = content.match(/Example usage:[\s\S]*?(?:\*\/|$)/);
            if (exampleMatch) {
              docsContent += `#### Example\n\n`;
              docsContent += exampleMatch[0]
                .replace('Example usage:', '')
                .replace(/\n\s*\*/g, '\n')
                .trim();
              docsContent += `\n\n`;
            }
          }
        } catch (error) {
          console.warn(`Could not parse template ${filename}:`, error.message);
        }
      }
      
      docsContent += `---\n\n`;
    }
  }
  
  fs.writeFileSync(path.join(outputDir, 'templates.md'), docsContent);
  console.log('✅ Template documentation generated');
}

/**
 * Generate documentation for scripts
 */
function generateScriptsDocs(outputDir) {
  console.log('Generating scripts documentation...');
  
  const scripts = [
    {
      name: 'resetDbSafe.js',
      description: 'Safely resets the database without dropping it',
      usage: 'npm run db:reset:safe',
      category: 'Database Maintenance'
    },
    {
      name: 'validateSeeders.js',
      description: 'Validates all seeder files and can fix common issues',
      usage: 'npm run db:validate',
      category: 'Validation'
    },
    {
      name: 'validateSchema.js',
      description: 'Validates database schema against models and suggests migrations',
      usage: 'node scripts/db/validateSchema.js',
      category: 'Validation'
    },
    {
      name: 'createMigration.js',
      description: 'Creates properly timestamped migration file',
      usage: 'npm run create:migration "name-of-migration"',
      category: 'Generation'
    },
    {
      name: 'organize-templates.js',
      description: 'Organizes the templates directory and creates missing templates',
      usage: 'node scripts/db/organize-templates.js',
      category: 'Maintenance'
    },
    {
      name: 'cli.js',
      description: 'Command-line interface for all database scripts',
      usage: 'node scripts/db/cli.js <command> [options]',
      category: 'Utilities'
    }
  ];
  
  // Add createSampleData.js if it exists
  const sampleDataPath = path.join(__dirname, 'createSampleData.js');
  if (fs.existsSync(sampleDataPath)) {
    scripts.push({
      name: 'createSampleData.js',
      description: 'Populates the database with sample data for development',
      usage: 'npm run create:sample-data',
      category: 'Data Generation'
    });
  }
  
  // Group by category
  const scriptsByCategory = {};
  scripts.forEach(script => {
    if (!scriptsByCategory[script.category]) {
      scriptsByCategory[script.category] = [];
    }
    scriptsByCategory[script.category].push(script);
  });
  
  let docsContent = `# Database Scripts\n\n`;
  docsContent += `This document provides an overview of all database management scripts.\n\n`;
  
  for (const [category, categoryScripts] of Object.entries(scriptsByCategory)) {
    docsContent += `## ${category}\n\n`;
    
    docsContent += `| Script | Description | Usage |\n`;
    docsContent += `|--------|-------------|-------|\n`;
    
    categoryScripts.forEach(script => {
      docsContent += `| ${script.name} | ${script.description} | \`${script.usage}\` |\n`;
    });
    
    docsContent += `\n`;
  }
  
  fs.writeFileSync(path.join(outputDir, 'scripts.md'), docsContent);
  console.log('✅ Scripts documentation generated');
}

/**
 * Generate documentation for database schema
 */
async function generateSchemaDocs(outputDir) {
  console.log('Generating schema documentation...');
  
  try {
    // Try to import models to document them
    const models = require('../../src/models');
    
    let docsContent = `# Database Schema\n\n`;
    docsContent += `This document provides an overview of the database schema.\n\n`;
    
    for (const [modelName, model] of Object.entries(models)) {
      if (!model || !model.tableName || !model.rawAttributes) continue;
      
      docsContent += `## ${modelName}\n\n`;
      docsContent += `Table: \`${model.tableName}\`\n\n`;
      
      // List attributes
      docsContent += `### Attributes\n\n`;
      docsContent += `| Column | Type | Primary Key | Nullable | Default | Description |\n`;
      docsContent += `|--------|------|-------------|----------|---------|-------------|\n`;
      
      for (const [attrName, attrDef] of Object.entries(model.rawAttributes)) {
        const fieldName = attrDef.field || attrName;
        const type = attrDef.type ? attrDef.type.toString().replace('SEQUELIZE.', '') : 'UNKNOWN';
        const isPrimary = attrDef.primaryKey ? '✓' : '';
        const nullable = attrDef.allowNull === false ? '✗' : '✓';
        const defaultValue = attrDef.defaultValue !== undefined 
          ? String(attrDef.defaultValue).replace('SEQUELIZE.', '') 
          : '';
        const comment = attrDef.comment || '';
        
        docsContent += `| ${fieldName} | ${type} | ${isPrimary} | ${nullable} | ${defaultValue} | ${comment} |\n`;
      }
      
      // List associations if available
      if (typeof model.associations === 'object' && Object.keys(model.associations).length > 0) {
        docsContent += `\n### Associations\n\n`;
        docsContent += `| Association | Type | Model | Foreign Key | Through |\n`;
        docsContent += `|-------------|------|-------|-------------|--------|\n`;
        
        for (const [assocName, assoc] of Object.entries(model.associations)) {
          const type = assoc.associationType;
          const targetModel = assoc.target.name;
          const foreignKey = assoc.foreignKey || '';
          const through = assoc.through ? assoc.through.model.name : '';
          
          docsContent += `| ${assocName} | ${type} | ${targetModel} | ${foreignKey} | ${through} |\n`;
        }
      }
      
      docsContent += `\n---\n\n`;
    }
    
    fs.writeFileSync(path.join(outputDir, 'schema.md'), docsContent);
    console.log('✅ Schema documentation generated');
  } catch (error) {
    console.warn('⚠️ Could not generate schema documentation:', error.message);
  }
}

// Export the main function
module.exports = generateDocs;

// Run if called directly
if (require.main === module) {
  const outputDir = process.argv[2] || undefined;
  generateDocs(outputDir)
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Error generating documentation:', error);
      process.exit(1);
    });
}

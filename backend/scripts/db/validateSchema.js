/**
 * Validates database schema against model definitions
 * Identifies columns that exist in models but are missing from the database
 * 
 * Usage: node scripts/db/validateSchema.js
 */
require('dotenv').config();
const { Sequelize } = require('sequelize');
const fs = require('fs');
const path = require('path');
const sequelize = require('../../src/config/db');

// Load all models
const models = require('../../src/models');

async function validateSchema() {
  console.log('🔍 Validating database schema against models...');
  
  try {
    // Check database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established');
    
    const issues = [];
    const queryInterface = sequelize.getQueryInterface();
    
    // Check each model
    for (const [modelName, model] of Object.entries(models)) {
      if (!model.tableName) continue;
      
      console.log(`\nExamining model: ${modelName} (table: ${model.tableName})`);
      
      try {
        // Get table description from database
        const tableDescription = await queryInterface.describeTable(model.tableName);
        
        // Get attributes from model
        const modelAttributes = model.rawAttributes;
        
        // Find attributes in model but not in database
        const missingColumns = [];
        for (const [attrName, attrDef] of Object.entries(modelAttributes)) {
          // Skip special Sequelize fields
          if (attrName === 'createdAt' || attrName === 'updatedAt' || attrName === 'deletedAt') continue;
          
          // Convert from camelCase to snake_case if needed
          const fieldName = attrDef.field || attrName;
          
          if (!tableDescription[fieldName]) {
            missingColumns.push({
              name: fieldName,
              type: attrDef.type.constructor.name
            });
          }
        }
        
        if (missingColumns.length > 0) {
          issues.push({
            model: modelName,
            table: model.tableName,
            missingColumns
          });
        } else {
          console.log(`✅ ${modelName}: All columns exist in the database`);
        }
      } catch (error) {
        console.error(`❌ Error examining table ${model.tableName}:`, error.message);
        issues.push({
          model: modelName,
          table: model.tableName,
          error: error.message
        });
      }
    }
    
    // Report results
    console.log('\n📊 Schema Validation Results:');
    if (issues.length === 0) {
      console.log('✅ All models match database schema!');
    } else {
      console.log(`❌ Found ${issues.length} models with schema issues:`);
      
      issues.forEach(issue => {
        console.log(`\n❗ Model: ${issue.model} (Table: ${issue.table})`);
        
        if (issue.error) {
          console.log(`   Error: ${issue.error}`);
        } else {
          console.log('   Missing columns:');
          issue.missingColumns.forEach(col => {
            console.log(`   - ${col.name} (${col.type})`);
          });
          
          // Generate migration code
          console.log('\n   Suggested migration code:');
          const migrationCode = issue.missingColumns.map(col => 
            `queryInterface.addColumn('${issue.table}', '${col.name}', { type: Sequelize.${col.type}, allowNull: true })`
          ).join(',\n      ');
          
          console.log(`
   module.exports = {
     up: async (queryInterface, Sequelize) => {
       return Promise.all([
         ${migrationCode}
       ]);
     },
     
     down: async (queryInterface, Sequelize) => {
       return Promise.all([
         ${issue.missingColumns.map(col => `queryInterface.removeColumn('${issue.table}', '${col.name}')`).join(',\n         ')}
       ]);
     }
   };`);
        }
      });
    }
    
  } catch (error) {
    console.error('❌ Schema validation failed:', error);
  } finally {
    // Close database connection
    await sequelize.close();
  }
}

// Run the validation
validateSchema();

/**
 * Script to organize the database templates directory
 * Creates consistent structure and adds missing template files
 * 
 * Usage: node scripts/db/organize-templates.js
 */
const fs = require('fs');
const path = require('path');

// Directories that should exist
const TEMPLATE_DIRS = [
  'migrations',
  'seeds',
  'schemas',
  'queries',
  'utilities'
];

// Base directory for templates
const templatesDir = path.resolve(__dirname, 'templates');

// Create directory structure
function createDirectoryStructure() {
  console.log('Creating directory structure...');
  
  // Create base templates directory if it doesn't exist
  if (!fs.existsSync(templatesDir)) {
    fs.mkdirSync(templatesDir);
    console.log(`Created directory: templates`);
  }
  
  // Create all required subdirectories
  TEMPLATE_DIRS.forEach(dir => {
    const dirPath = path.join(templatesDir, dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath);
      console.log(`Created directory: templates/${dir}`);
    }
  });
}

// Create template files that don't exist yet
function createMissingTemplates() {
  console.log('\nCreating missing template files...');
  
  // Migration templates
  createTemplateIfMissing(
    'migrations/create_table.js',
    `/**
 * Template for generating a migration to create a new table
 * 
 * @param {Object} options Configuration options for the table
 * @param {string} options.tableName Name of the table to create
 * @param {Array<Object>} options.columns Column definitions
 * @param {Array<string>} [options.indexes] Optional indexes to create
 * @param {Array<string>} [options.foreignKeys] Optional foreign key constraints
 * @returns {Object} Migration object with up and down functions
 * 
 * Created: ${new Date().toISOString().split('T')[0]}
 * Last Updated: ${new Date().toISOString().split('T')[0]}
 * 
 * Example usage:
 * const migration = require('./templates/migrations/create_table');
 * const usersMigration = migration({
 *   tableName: 'users',
 *   columns: [
 *     { name: 'id', type: 'UUID', primaryKey: true, defaultValue: 'UUIDV4' },
 *     { name: 'email', type: 'STRING', allowNull: false, unique: true }
 *   ]
 * });
 */

/**
 * Generate column definitions for a table creation migration
 * @param {Array<Object>} columns Column definitions
 * @returns {string} Sequelize column definitions
 */
function generateColumnDefinitions(columns) {
  return columns.map(column => {
    const {
      name,
      type,
      primaryKey = false,
      autoIncrement = false,
      allowNull = true,
      unique = false,
      defaultValue,
      comment
    } = column;
    
    let definition = \`      \${name}: {\n\`;
    definition += \`        type: Sequelize.\${type},\n\`;
    
    if (primaryKey) definition += '        primaryKey: true,\\n';
    if (autoIncrement) definition += '        autoIncrement: true,\\n';
    if (!allowNull) definition += '        allowNull: false,\\n';
    if (unique) definition += '        unique: true,\\n';
    if (defaultValue !== undefined) {
      if (defaultValue === 'NOW()') {
        definition += '        defaultValue: Sequelize.NOW,\\n';
      } else if (defaultValue === 'UUIDV4') {
        definition += '        defaultValue: Sequelize.UUIDV4,\\n';
      } else {
        definition += \`        defaultValue: \${JSON.stringify(defaultValue)},\n\`;
      }
    }
    if (comment) definition += \`        comment: \${JSON.stringify(comment)},\n\`;
    
    definition += '      }';
    return definition;
  }).join(',\\n');
}

/**
 * Generate a complete migration for creating a table
 */
module.exports = function createTableMigration(options) {
  const { tableName, columns, indexes = [], foreignKeys = [] } = options;
  
  return {
    up: \`async (queryInterface, Sequelize) => {
    await queryInterface.createTable('\${tableName}', {
\${generateColumnDefinitions(columns)}
    });
    
\${indexes.length > 0 ? \`    // Create indexes
\${indexes.map(idx => \`    await queryInterface.addIndex('\${tableName}', \${JSON.stringify(idx.fields)}, \${JSON.stringify(idx.options)});\`).join('\\n')}\` : ''}

\${foreignKeys.length > 0 ? \`    // Add foreign key constraints
\${foreignKeys.map(fk => \`    await queryInterface.addConstraint('\${tableName}', {
      fields: ['\${fk.field}'],
      type: 'foreign key',
      references: { table: '\${fk.references.table}', field: '\${fk.references.field}' },
      onDelete: '\${fk.onDelete || 'CASCADE'}',
      onUpdate: '\${fk.onUpdate || 'CASCADE'}'
    });\`).join('\\n')}\` : ''}
  }\`,
    
    down: \`async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('\${tableName}');
  }\`
  };
};`
  );

  // Add template for column migrations
  createTemplateIfMissing(
    'migrations/add_columns.js',
    `/**
 * Template for generating a migration to add columns to an existing table
 * 
 * @param {Object} options Configuration options
 * @param {string} options.tableName Name of the table to modify
 * @param {Array<Object>} options.columns Column definitions to add
 * @returns {Object} Migration object with up and down functions
 * 
 * Created: ${new Date().toISOString().split('T')[0]}
 * Last Updated: ${new Date().toISOString().split('T')[0]}
 * 
 * Example usage:
 * const migration = require('./templates/migrations/add_columns');
 * const addColumnsToUsers = migration({
 *   tableName: 'users',
 *   columns: [
 *     { name: 'lastLogin', type: 'DATE', allowNull: true },
 *     { name: 'status', type: 'ENUM', values: ['active', 'inactive', 'suspended'], defaultValue: 'active' }
 *   ]
 * });
 */

/**
 * Generate column definitions for adding columns
 * @param {Array<Object>} columns Column definitions
 * @returns {string} Sequelize column definitions
 */
function generateColumnDefinitions(columns) {
  const defs = {};
  
  columns.forEach(column => {
    const {
      name,
      type,
      allowNull = true,
      defaultValue,
      comment,
      ...rest
    } = column;
    
    const colDef = {
      type: \`Sequelize.\${type}\`,
      allowNull
    };
    
    if (defaultValue !== undefined) {
      colDef.defaultValue = defaultValue;
    }
    
    if (comment) {
      colDef.comment = comment;
    }
    
    // Handle ENUM type specially
    if (type === 'ENUM' && rest.values) {
      colDef.type = \`Sequelize.ENUM(\${rest.values.map(v => \`'\${v}'\`).join(', ')})\`;
    }
    
    // Add any additional properties
    Object.entries(rest).forEach(([key, value]) => {
      // Skip values for ENUM which we handled separately
      if (key !== 'values') {
        colDef[key] = value;
      }
    });
    
    defs[name] = colDef;
  });
  
  return defs;
}

module.exports = function addColumnsMigration(options) {
  const { tableName, columns } = options;
  const columnDefs = generateColumnDefinitions(columns);
  const columnDefsString = JSON.stringify(columnDefs, null, 2)
    .replace(/"Sequelize\.([A-Z_]+)(\(.*?\))?"/g, 'Sequelize.$1$2')
    .replace(/"([a-zA-Z0-9]+)":/g, '$1:');
  
  const columnNames = columns.map(c => c.name);
  
  return {
    up: \`async (queryInterface, Sequelize) => {
    const columns = ${columnDefsString};
    
    // Add each column separately to handle any failures
    for (const [columnName, definition] of Object.entries(columns)) {
      try {
        await queryInterface.addColumn('${tableName}', columnName, definition);
        console.log(\\\`Added column \\\${columnName} to ${tableName} table\\\`);
      } catch (error) {
        console.error(\\\`Error adding column \\\${columnName}:\\\`, error.message);
        throw error; // Rethrow to trigger rollback
      }
    }
  }\`,
    
    down: \`async (queryInterface, Sequelize) => {
    // Remove columns in reverse order
    const columnNames = ${JSON.stringify(columnNames)};
    
    for (const columnName of columnNames.reverse()) {
      try {
        await queryInterface.removeColumn('${tableName}', columnName);
      } catch (error) {
        console.error(\\\`Error removing column \\\${columnName}:\\\`, error);
        throw error; // Rethrow to trigger rollback
      }
    }
  }\`
  };
};`
  );

  // Add seeder template
  createTemplateIfMissing(
    'seeds/basic_seeder.js',
    `/**
 * Template for creating a basic database seeder
 * 
 * @param {Object} options Configuration options
 * @param {string} options.tableName Name of the table to seed
 * @param {Array<Object>} options.data Array of records to insert
 * @param {boolean} [options.truncate=false] Whether to truncate before insertion
 * @returns {Object} Seeder object with up and down functions
 * 
 * Created: ${new Date().toISOString().split('T')[0]}
 * Last Updated: ${new Date().toISOString().split('T')[0]}
 * 
 * Example usage:
 * const seeder = require('./templates/seeds/basic_seeder');
 * const roleSeeder = seeder({
 *   tableName: 'roles',
 *   truncate: true,
 *   data: [
 *     { name: 'admin', description: 'System administrator' },
 *     { name: 'user', description: 'Regular user' }
 *   ]
 * });
 */

module.exports = function createSeeder(options) {
  const { tableName, data, truncate = false, uniqueColumns = ['id'] } = options;
  
  const seedData = JSON.stringify(data, null, 2);
  
  return {
    up: \`async (queryInterface, Sequelize) => {
    try {
      // Convert data to array if it's not already
      const seedData = ${seedData};
      
      ${truncate ? 
      `// Truncate the table (or delete all rows)
      // Note: This will cascade if the table has foreign key with onDelete CASCADE
      await queryInterface.bulkDelete('${tableName}', null, {
        truncate: true,
        cascade: true
      });
      console.log(\`Truncated ${tableName} table\`);` : 
      '// No truncate requested, proceeding with insert'}
      
      // Insert seed data
      await queryInterface.bulkInsert('${tableName}', seedData, {});
      console.log(\`Inserted \${seedData.length} records into ${tableName}\`);
      
      return Promise.resolve();
    } catch (error) {
      console.error('Error in ${tableName} seeder:', error);
      return Promise.reject(error);
    }
  }\`,
  
    down: \`async (queryInterface, Sequelize) => {
    try {
      // Get the identifiers to delete specific records
      const seedData = ${seedData};
      
      // Create an array of WHERE conditions for each record
      // Based on unique columns to avoid accidentally deleting other data
      const whereConditions = seedData.map(record => {
        const condition = {};
        ${uniqueColumns.map(col => `if (record.${col}) condition.${col} = record.${col};`).join('\n        ')}
        return condition;
      });
      
      // Delete each record individually
      let deletedCount = 0;
      for (const condition of whereConditions) {
        if (Object.keys(condition).length === 0) continue;
        
        const deleted = await queryInterface.bulkDelete('${tableName}', condition);
        deletedCount += deleted;
      }
      
      console.log(\`Deleted \${deletedCount} records from ${tableName}\`);
      return Promise.resolve();
    } catch (error) {
      console.error('Error in ${tableName} seeder down function:', error);
      return Promise.reject(error);
    }
  }\`
  };
};`
  );

  // Add schema template
  createTemplateIfMissing(
    'schemas/model_schema.js',
    `/**
 * Template for creating a Sequelize model schema definition
 * 
 * @param {Object} options Model configuration
 * @param {string} options.modelName Name of the model
 * @param {string} options.tableName Database table name
 * @param {Object} options.attributes Model attributes/columns
 * @param {Object} [options.options] Additional model options
 * @returns {Object} Model schema definition
 * 
 * Created: ${new Date().toISOString().split('T')[0]}
 * Last Updated: ${new Date().toISOString().split('T')[0]}
 * 
 * Example usage:
 * const modelSchema = require('./templates/schemas/model_schema');
 * const userSchema = modelSchema({
 *   modelName: 'User',
 *   tableName: 'users',
 *   attributes: {
 *     id: { type: 'UUID', primaryKey: true, defaultValue: 'UUIDV4' },
 *     email: { type: 'STRING', allowNull: false, unique: true },
 *     status: { type: 'ENUM', values: ['active', 'inactive'], defaultValue: 'active' }
 *   },
 *   options: {
 *     timestamps: true,
 *     paranoid: true,
 *     indexes: [{ fields: ['email'] }]
 *   }
 * });
 */

module.exports = function createModelSchema(options) {
  const { modelName, tableName, attributes, options = {} } = options;
  
  // Process attributes to proper Sequelize format
  const formattedAttributes = {};
  
  Object.entries(attributes).forEach(([name, definition]) => {
    const { type, ...rest } = definition;
    
    // Basic attribute with type conversion
    formattedAttributes[name] = {
      type: \`DataTypes.\${type}\`,
      ...rest
    };
    
    // Special handling for ENUM
    if (type === 'ENUM' && rest.values) {
      formattedAttributes[name].type = \`DataTypes.ENUM(\${rest.values.map(v => \`'\${v}'\`).join(', ')})\`;
      delete formattedAttributes[name].values;
    }
  });
  
  // Format the attributes as a string
  const attributesStr = JSON.stringify(formattedAttributes, null, 2)
    .replace(/"DataTypes\.([A-Z_]+)(\(.*?\))?"/g, 'DataTypes.$1$2')
    .replace(/"([a-zA-Z0-9]+)":/g, '$1:');
  
  // Format options as a string
  const optionsStr = JSON.stringify({
    tableName,
    ...options
  }, null, 2)
    .replace(/"([a-zA-Z0-9]+)":/g, '$1:');
  
  return \`'use strict';

/**
 * ${modelName} Model
 * 
 * Generated from model_schema template
 * Created: ${new Date().toISOString().split('T')[0]}
 */
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class ${modelName} extends Model {
    static associate(models) {
      // Define associations here
    }
  }
  
  ${modelName}.init(${attributesStr}, {
    sequelize,
    ${optionsStr.slice(1, -1)}
  });
  
  return ${modelName};
};\`;
};`
  );

  // Add query template
  createTemplateIfMissing(
    'queries/complex_query.js',
    `/**
 * Template for complex database queries
 * 
 * @param {Object} options Query configuration
 * @param {string} options.tableName Primary table name
 * @param {Array<Object>} [options.joins] Join specifications
 * @param {Object} [options.where] Where conditions
 * @param {Array<string>} [options.attributes] Columns to select
 * @param {Object} [options.pagination] Pagination options
 * @returns {Object} SQL query with parameterized values
 * 
 * Created: ${new Date().toISOString().split('T')[0]}
 * Last Updated: ${new Date().toISOString().split('T')[0]}
 * 
 * Example usage:
 * const queryBuilder = require('./templates/queries/complex_query');
 * const userQuery = queryBuilder({
 *   tableName: 'users',
 *   joins: [
 *     { table: 'user_roles', on: { 'users.id': 'user_roles.user_id' } }
 *   ],
 *   where: { status: 'active', createdAt: { $gt: '2023-01-01' } },
 *   attributes: ['id', 'email', 'user_roles.role_name AS role'],
 *   pagination: { limit: 10, offset: 0 }
 * });
 */

/**
 * Build a complex SQL query with joins, conditions, and pagination
 */
module.exports = function buildQuery(options) {
  const { 
    tableName,
    joins = [],
    where = {},
    attributes = ['*'],
    pagination = { limit: 100, offset: 0 },
    orderBy = null
  } = options;
  
  // Build SELECT clause
  const selectClause = attributes.join(', ');
  
  // Build FROM clause
  let fromClause = \`"\${tableName}"\`;
  
  // Build JOIN clauses
  const joinClauses = joins.map(join => {
    const { table, type = 'INNER', on } = join;
    
    // Build ON conditions
    const onConditions = Object.entries(on).map(([left, right]) => {
      return \`\${left} = \${right}\`;
    }).join(' AND ');
    
    return \`\${type} JOIN "\${table}" ON \${onConditions}\`;
  }).join(' ');
  
  // Build WHERE clause and collect parameters
  const params = [];
  let whereIndex = 1;
  
  // Recursive function to handle nested conditions
  function processCondition(condition, prefix = '') {
    if (!condition || Object.keys(condition).length === 0) {
      return '1=1'; // Default true condition
    }
    
    const clauses = [];
    
    for (const [key, value] of Object.entries(condition)) {
      // Handle special operators ($eq, $ne, $gt, etc.)
      if (key.startsWith('$')) {
        switch (key) {
          case '$and':
            if (Array.isArray(value)) {
              const andClauses = value.map(cond => \`(\${processCondition(cond, prefix)})\`).join(' AND ');
              clauses.push(\`(\${andClauses})\`);
            }
            break;
          case '$or':
            if (Array.isArray(value)) {
              const orClauses = value.map(cond => \`(\${processCondition(cond, prefix)})\`).join(' OR ');
              clauses.push(\`(\${orClauses})\`);
            }
            break;
          // Add more operators as needed
        }
        continue;
      }
      
      const fullKey = prefix ? \`\${prefix}.\${key}\` : key;
      
      // Handle complex value with operators
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        for (const [op, opValue] of Object.entries(value)) {
          switch (op) {
            case '$eq':
              params.push(opValue);
              clauses.push(\`\${fullKey} = $\${whereIndex++}\`);
              break;
            case '$ne':
              params.push(opValue);
              clauses.push(\`\${fullKey} != $\${whereIndex++}\`);
              break;
            case '$gt':
              params.push(opValue);
              clauses.push(\`\${fullKey} > $\${whereIndex++}\`);
              break;
            case '$gte':
              params.push(opValue);
              clauses.push(\`\${fullKey} >= $\${whereIndex++}\`);
              break;
            case '$lt':
              params.push(opValue);
              clauses.push(\`\${fullKey} < $\${whereIndex++}\`);
              break;
            case '$lte':
              params.push(opValue);
              clauses.push(\`\${fullKey} <= $\${whereIndex++}\`);
              break;
            case '$like':
              params.push(opValue);
              clauses.push(\`\${fullKey} LIKE $\${whereIndex++}\`);
              break;
            case '$in':
              if (Array.isArray(opValue) && opValue.length > 0) {
                const placeholders = opValue.map(() => \`$\${whereIndex++}\`).join(', ');
                params.push(...opValue);
                clauses.push(\`\${fullKey} IN (\${placeholders})\`);
              }
              break;
            // Add more operators as needed
          }
        }
      } else if (Array.isArray(value)) {
        // Handle arrays as IN operators
        const placeholders = value.map(() => \`$\${whereIndex++}\`).join(', ');
        params.push(...value);
        clauses.push(\`\${fullKey} IN (\${placeholders})\`);
      } else {
        // Simple equality
        params.push(value);
        clauses.push(\`\${fullKey} = $\${whereIndex++}\`);
      }
    }
    
    return clauses.join(' AND ');
  }
  
  const whereClause = processCondition(where);
  
  // Build ORDER BY clause
  let orderByClause = '';
  if (orderBy) {
    const { column, direction = 'ASC' } = orderBy;
    orderByClause = \`ORDER BY \${column} \${direction}\`;
  }
  
  // Build LIMIT and OFFSET
  const limitClause = pagination.limit ? \`LIMIT \${pagination.limit}\` : '';
  const offsetClause = pagination.offset ? \`OFFSET \${pagination.offset}\` : '';
  
  // Construct the full query
  const query = [
    \`SELECT \${selectClause}\`,
    \`FROM \${fromClause}\`,
    joinClauses,
    \`WHERE \${whereClause}\`,
    orderByClause,
    limitClause,
    offsetClause
  ].filter(Boolean).join(' ');
  
  return {
    text: query,
    params
  };
};`
  );

  // Update seeder template 
  createTemplateIfMissing(
    'templates/seeder.template.js',
    `'use strict';

/**
 * Standard seeder template
 * 
 * Last Updated: ${new Date().toISOString().split('T')[0]}
 */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Your implementation here
      // Example:
      // await queryInterface.bulkInsert('TableName', [
      //   {
      //     name: 'Example',
      //     createdAt: new Date(),
      //     updatedAt: new Date()
      //   }
      // ]);
      
      return Promise.resolve();
    } catch (error) {
      console.error('Error in seeder:', error);
      return Promise.reject(error);
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Your implementation here
    // Example:
    // await queryInterface.bulkDelete('TableName', {
    //   name: 'Example'
    // });
    
    return Promise.resolve();
  }
};`
  );

  console.log('\nAll missing templates created successfully!');
}

// Update README
function updateReadme() {
  console.log('\nUpdating README...');
  
  const readmePath = path.join(templatesDir, 'README.md');
  const readmeContent = `# Database Templates

This folder contains templates used for database operations, scripts, and migrations.

## Folder Structure

- **migrations/**: Templates for database schema changes
- **seeds/**: Templates for generating seed data
- **schemas/**: Database schema definition templates
- **queries/**: Common query templates
- **utilities/**: Helper templates and utilities

## Usage Guidelines

1. **Naming Convention**: All templates should follow the format: \`[purpose]_[description].js|sql\`
2. **Documentation**: Each template file should include a header comment explaining:
   - Purpose of the template
   - Required parameters
   - Example usage
   - Date created/last updated

## Template Management

When adding new templates:
1. Check if a similar template already exists
2. Follow the naming convention
3. Add appropriate documentation
4. Update this README if you're adding a new category

When updating templates:
1. Add a change log comment at the top of the file
2. Update the "last updated" date
3. Ensure backward compatibility or document breaking changes

## Common Tasks

### Creating a New Migration

\`\`\`js
// Example of creating a new migration from template
const migrationGenerator = require('./migrations/create_table.js');

const newMigration = migrationGenerator({
  tableName: 'users',
  columns: [
    { name: 'id', type: 'UUID', primaryKey: true },
    { name: 'username', type: 'STRING', allowNull: false },
    { name: 'created_at', type: 'DATE', defaultValue: 'NOW()' }
  ]
});
\`\`\`

### Creating a Seeder

\`\`\`js
// Example of creating a new seeder from template
const seederGenerator = require('./seeds/basic_seeder.js');

const newSeeder = seederGenerator({
  tableName: 'users',
  data: [
    { username: 'admin', email: 'admin@example.com', role: 'admin' },
    { username: 'user', email: 'user@example.com', role: 'user' }
  ]
});
\`\`\`

### Generating a Model Schema

\`\`\`js
// Example of creating a model schema from template
const schemaGenerator = require('./schemas/model_schema.js');

const userSchema = schemaGenerator({
  modelName: 'User',
  tableName: 'users',
  attributes: {
    id: { type: 'UUID', primaryKey: true, defaultValue: 'UUIDV4' },
    email: { type: 'STRING', allowNull: false }
  }
});
\`\`\`

## Validation

Use the template validator to ensure your templates meet the requirements:

\`\`\`js
const { validateTemplate } = require('./utilities/template-validator');
const result = validateTemplate('/path/to/template.js', 'migration');
\`\`\`
`;

  fs.writeFileSync(readmePath, readmeContent);
  console.log('README.md updated');
}

// Helper function to create a template file if it doesn't exist yet
function createTemplateIfMissing(relativePath, content) {
  const filePath = path.join(templatesDir, relativePath);
  const dirPath = path.dirname(filePath);
  
  // Ensure directory exists
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${dirPath}`);
  }
  
  // Create file if it doesn't exist
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, content);
    console.log(`Created template: ${relativePath}`);
  } else {
    console.log(`Template already exists: ${relativePath}`);
  }
}

/**
 * Main function to organize the templates directory
 */
async function organizeTemplates() {
  createDirectoryStructure();
  createMissingTemplates();
  updateReadme();
  
  console.log('\n✅ Templates directory organized successfully!');
  console.log(`Template directory: ${templatesDir}`);
  
  return templatesDir;
}

// Export functions
module.exports = {
  organizeTemplates,
  createDirectoryStructure,
  createMissingTemplates,
  updateReadme,
  createTemplateIfMissing
};

// Run the organization if called directly
if (require.main === module) {
  organizeTemplates()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Organization failed:', error);
      process.exit(1);
    });
}

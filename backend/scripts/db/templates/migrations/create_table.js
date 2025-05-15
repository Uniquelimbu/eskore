/**
 * Template for generating a migration to create a new table
 * 
 * @param {Object} options Configuration options for the table
 * @param {string} options.tableName Name of the table to create
 * @param {Array<Object>} options.columns Column definitions
 * @param {Array<string>} [options.indexes] Optional indexes to create
 * @param {Array<string>} [options.foreignKeys] Optional foreign key constraints
 * @returns {Object} Migration object with up and down functions
 * 
 * Created: 2023-10-25
 * Last Updated: 2023-10-25
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
    
    let definition = `      ${name}: {\n`;
    definition += `        type: Sequelize.${type},\n`;
    
    if (primaryKey) definition += '        primaryKey: true,\n';
    if (autoIncrement) definition += '        autoIncrement: true,\n';
    if (!allowNull) definition += '        allowNull: false,\n';
    if (unique) definition += '        unique: true,\n';
    if (defaultValue !== undefined) {
      if (defaultValue === 'NOW()') {
        definition += '        defaultValue: Sequelize.NOW,\n';
      } else if (defaultValue === 'UUIDV4') {
        definition += '        defaultValue: Sequelize.UUIDV4,\n';
      } else {
        definition += `        defaultValue: ${JSON.stringify(defaultValue)},\n`;
      }
    }
    if (comment) definition += `        comment: ${JSON.stringify(comment)},\n`;
    
    definition += '      }';
    return definition;
  }).join(',\n');
}

/**
 * Generate a complete migration for creating a table
 */
module.exports = function createTableMigration(options) {
  const { tableName, columns, indexes = [], foreignKeys = [] } = options;
  
  return {
    up: `async (queryInterface, Sequelize) => {
    await queryInterface.createTable('${tableName}', {
${generateColumnDefinitions(columns)}
    });
    
${indexes.length > 0 ? `    // Create indexes
${indexes.map(idx => `    await queryInterface.addIndex('${tableName}', ${JSON.stringify(idx.fields)}, ${JSON.stringify(idx.options)});`).join('\n')}` : ''}

${foreignKeys.length > 0 ? `    // Add foreign key constraints
${foreignKeys.map(fk => `    await queryInterface.addConstraint('${tableName}', {
      fields: ['${fk.field}'],
      type: 'foreign key',
      references: { table: '${fk.references.table}', field: '${fk.references.field}' },
      onDelete: '${fk.onDelete || 'CASCADE'}',
      onUpdate: '${fk.onUpdate || 'CASCADE'}'
    });`).join('\n')}` : ''}
  }`,
    
    down: `async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('${tableName}');
  }`
  };
};

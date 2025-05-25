'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Check if the column already exists to avoid errors
      const tableInfo = await queryInterface.describeTable('teams');
      const dialect = queryInterface.sequelize.getDialect();
      
      // Column name might be lowercase in PostgreSQL
      const columnExists = tableInfo.teamIdentifier || tableInfo.teamidentifier;
      
      if (!columnExists) {
        await queryInterface.addColumn('teams', 'teamIdentifier', {
          type: Sequelize.STRING(7), // Format: AAA-NNN (7 characters)
          allowNull: true,
          unique: true
        });
        
        console.log('Added teamIdentifier column to teams table');
        
        // Import the generator function dynamically
        const pathToUtils = '../utils/teamIdentifierGenerator';
        let generateTeamIdentifier;
        
        try {
          const generatorModule = require(pathToUtils);
          generateTeamIdentifier = generatorModule.generateTeamIdentifier;
        } catch (err) {
          console.error(`Failed to load team identifier generator: ${err.message}`);
          console.log('Will use a simple generator instead');
          
          // Fallback simple generator if the module is not available
          generateTeamIdentifier = (name, id) => {
            const slug = name ? name.replace(/[^a-zA-Z]/g, '').substring(0, 3).toUpperCase().padEnd(3, 'X') : 'XXX';
            const numPart = String(id % 1000).padStart(3, '0');
            return `${slug}-${numPart}`;
          };
        }
        
        // Get all existing teams
        const teams = await queryInterface.sequelize.query(
          'SELECT id, name FROM teams',
          { type: queryInterface.sequelize.QueryTypes.SELECT }
        );
        
        console.log(`Found ${teams.length} teams to update with identifiers`);
        
        // Update each team with a generated identifier
        for (const team of teams) {
          const identifier = generateTeamIdentifier(team.name, team.id);
          
          // Use the appropriate field name depending on the SQL dialect
          const query = dialect === 'postgres' 
            ? 'UPDATE teams SET "teamIdentifier" = ? WHERE id = ?'
            : 'UPDATE teams SET teamIdentifier = ? WHERE id = ?';
            
          await queryInterface.sequelize.query(query, {
            replacements: [identifier, team.id],
            type: queryInterface.sequelize.QueryTypes.UPDATE
          });
          
          console.log(`Updated team ${team.id} (${team.name}) with identifier: ${identifier}`);
        }
        
        console.log(`Updated ${teams.length} existing teams with unique identifiers`);
      } else {
        console.log('teamIdentifier column already exists in teams table');
      }
      
      return Promise.resolve();
    } catch (error) {
      console.error('Migration error:', error);
      return Promise.reject(error);
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      const tableInfo = await queryInterface.describeTable('teams');
      const dialect = queryInterface.sequelize.getDialect();
      
      // Column name might be lowercase in PostgreSQL
      const columnName = tableInfo.teamIdentifier ? 'teamIdentifier' : 
                         tableInfo.teamidentifier ? 'teamidentifier' : null;
      
      if (columnName) {
        // For PostgreSQL, we need to use quoted column names
        if (dialect === 'postgres') {
          await queryInterface.sequelize.query(
            'ALTER TABLE teams DROP COLUMN "teamIdentifier"'
          );
        } else {
          await queryInterface.removeColumn('teams', columnName);
        }
        console.log(`Removed ${columnName} column from teams table`);
      }
      
      return Promise.resolve();
    } catch (error) {
      console.error('Migration rollback error:', error);
      return Promise.reject(error);
    }
  }
};

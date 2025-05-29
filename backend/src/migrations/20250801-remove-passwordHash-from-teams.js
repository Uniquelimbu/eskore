'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Check if passwordHash column exists
      const tableDescription = await queryInterface.describeTable('teams');
      
      // Remove passwordHash if it exists
      if (tableDescription.passwordHash) {
        console.log('Removing passwordHash column from teams table');
        await queryInterface.removeColumn('teams', 'passwordHash');
      } else {
        console.log('passwordHash column not found in teams table, skipping removal');
      }

      // Ensure email has correct constraints
      // No need to modify email as it should already be correctly configured
      
      return Promise.resolve();
    } catch (error) {
      console.error('Migration error:', error);
      return Promise.reject(error);
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      // Check if passwordHash column already exists to avoid errors
      const tableDescription = await queryInterface.describeTable('teams');
      
      if (!tableDescription.passwordHash) {
        console.log('Restoring passwordHash column to teams table');
        await queryInterface.addColumn('teams', 'passwordHash', {
          type: Sequelize.STRING,
          allowNull: true
        });
      }
      
      return Promise.resolve();
    } catch (error) {
      console.error('Migration rollback error:', error);
      return Promise.reject(error);
    }
  }
};

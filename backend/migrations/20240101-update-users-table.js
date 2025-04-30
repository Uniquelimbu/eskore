'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add new columns to the users table
    const columnsToAdd = {
      firstName: {
        type: Sequelize.STRING,
        allowNull: true, // Make nullable for backward compatibility
      },
      middleName: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      lastName: {
        type: Sequelize.STRING,
        allowNull: true, // Make nullable for backward compatibility
      },
      dob: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      country: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      height: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      position: {
        type: Sequelize.STRING, // Using STRING instead of ENUM for flexibility
        allowNull: true,
      }
    };

    // Add columns if they don't exist
    for (const [columnName, columnDefinition] of Object.entries(columnsToAdd)) {
      // Check if column exists first
      const tableDescription = await queryInterface.describeTable('users');
      if (!tableDescription[columnName]) {
        await queryInterface.addColumn('users', columnName, columnDefinition);
      }
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Remove the columns added
    return Promise.all([
      queryInterface.removeColumn('users', 'firstName'),
      queryInterface.removeColumn('users', 'middleName'),
      queryInterface.removeColumn('users', 'lastName'),
      queryInterface.removeColumn('users', 'dob'),
      queryInterface.removeColumn('users', 'country'),
      queryInterface.removeColumn('users', 'height'),
      queryInterface.removeColumn('users', 'position')
    ]);
  }
};

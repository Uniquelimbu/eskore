'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add columns if they don't exist
    const columns = await queryInterface.describeTable('users');
    
    if (!columns.firstName) {
      await queryInterface.addColumn('users', 'firstName', {
        type: Sequelize.STRING,
        allowNull: true
      });
    }
    
    if (!columns.lastName) {
      await queryInterface.addColumn('users', 'lastName', {
        type: Sequelize.STRING,
        allowNull: true
      });
    }
    
    if (!columns.middleName) {
      await queryInterface.addColumn('users', 'middleName', {
        type: Sequelize.STRING,
        allowNull: true
      });
    }
    
    if (!columns.dob) {
      await queryInterface.addColumn('users', 'dob', {
        type: Sequelize.DATEONLY,
        allowNull: true
      });
    }
    
    if (!columns.country) {
      await queryInterface.addColumn('users', 'country', {
        type: Sequelize.STRING,
        allowNull: true
      });
    }
    
    if (!columns.height) {
      await queryInterface.addColumn('users', 'height', {
        type: Sequelize.FLOAT,
        allowNull: true
      });
    }
    
    if (!columns.position) {
      await queryInterface.addColumn('users', 'position', {
        type: Sequelize.STRING,
        allowNull: true
      });
    }
    
    if (!columns.status && !columns.hasOwnProperty('status')) {
      await queryInterface.addColumn('users', 'status', {
        type: Sequelize.ENUM('active', 'inactive', 'suspended'),
        defaultValue: 'active',
        allowNull: false
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Remove columns
    await queryInterface.removeColumn('users', 'firstName')
      .catch(error => console.log('Column firstName removal error:', error.message));
    await queryInterface.removeColumn('users', 'lastName')
      .catch(error => console.log('Column lastName removal error:', error.message));
    await queryInterface.removeColumn('users', 'middleName')
      .catch(error => console.log('Column middleName removal error:', error.message));
    await queryInterface.removeColumn('users', 'dob')
      .catch(error => console.log('Column dob removal error:', error.message));
    await queryInterface.removeColumn('users', 'country')
      .catch(error => console.log('Column country removal error:', error.message));
    await queryInterface.removeColumn('users', 'height')
      .catch(error => console.log('Column height removal error:', error.message));
    await queryInterface.removeColumn('users', 'position')
      .catch(error => console.log('Column position removal error:', error.message));
    await queryInterface.removeColumn('users', 'status')
      .catch(error => console.log('Column status removal error:', error.message));
  }
};

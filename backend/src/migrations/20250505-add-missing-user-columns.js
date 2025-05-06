'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
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
    if (!columns.status) {
      await queryInterface.addColumn('users', 'status', {
        type: Sequelize.ENUM('active', 'inactive', 'suspended'),
        defaultValue: 'active',
        allowNull: false
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    const columns = await queryInterface.describeTable('users');
    const removeIfExists = async (col) => {
      if (columns[col]) {
        await queryInterface.removeColumn('users', col).catch(error => console.log(`Column ${col} removal error:`, error.message));
      }
    };
    await removeIfExists('firstName');
    await removeIfExists('lastName');
    await removeIfExists('middleName');
    await removeIfExists('dob');
    await removeIfExists('country');
    await removeIfExists('height');
    await removeIfExists('position');
    await removeIfExists('status');
  }
};

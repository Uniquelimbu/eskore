'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const columns = await queryInterface.describeTable('users');
    if (!columns.lastLogin) {
      await queryInterface.addColumn('users', 'lastLogin', {
        type: Sequelize.DATE,
        allowNull: true
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    const columns = await queryInterface.describeTable('users');
    if (columns.lastLogin) {
      await queryInterface.removeColumn('users', 'lastLogin');
    }
  }
};

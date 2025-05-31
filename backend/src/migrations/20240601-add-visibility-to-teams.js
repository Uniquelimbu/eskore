'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('teams', 'visibility', {
      type: Sequelize.ENUM('public', 'private'),
      defaultValue: 'public',
      allowNull: false
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('teams', 'visibility');
    // Note: In production, you might want to retain the ENUM type in down migration
    // or drop it properly using queryInterface.sequelize.query
  }
};

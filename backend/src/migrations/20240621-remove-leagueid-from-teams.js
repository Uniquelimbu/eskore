'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const columns = await queryInterface.describeTable('teams');
    if (columns.leagueId) {
      await queryInterface.removeColumn('teams', 'leagueId');
    }
  },

  down: async (queryInterface, Sequelize) => {
    const columns = await queryInterface.describeTable('teams');
    if (!columns.leagueId) {
      await queryInterface.addColumn('teams', 'leagueId', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'leagues',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      });
    }
  }
};

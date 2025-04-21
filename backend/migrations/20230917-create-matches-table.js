'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('matches', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      homeTeamId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'teams',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      awayTeamId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'teams',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      homeScore: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      awayScore: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      status: {
        type: Sequelize.STRING,
        defaultValue: 'scheduled'
      },
      date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      leagueId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'leagues',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('matches');
  }
};

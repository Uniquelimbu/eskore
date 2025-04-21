'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('teams', 'email', {
      type: Sequelize.STRING,
      allowNull: true,
      unique: true
    });
    
    await queryInterface.addColumn('teams', 'passwordHash', {
      type: Sequelize.STRING,
      allowNull: true
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('teams', 'email');
    await queryInterface.removeColumn('teams', 'passwordHash');
  }
};

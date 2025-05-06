'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('users', 'profileImageUrl', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('users', 'bio', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    await queryInterface.addColumn('users', 'socialLinks', {
      type: Sequelize.JSONB, // Use Sequelize.JSON if JSONB is not supported by your DB
      allowNull: true,
    });
    await queryInterface.addColumn('users', 'gameSpecificStats', {
      type: Sequelize.JSONB, // Use Sequelize.JSON if JSONB is not supported by your DB
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('users', 'profileImageUrl');
    await queryInterface.removeColumn('users', 'bio');
    await queryInterface.removeColumn('users', 'socialLinks');
    await queryInterface.removeColumn('users', 'gameSpecificStats');
  }
};

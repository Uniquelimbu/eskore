'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Drop columns if they exist
    await Promise.all([
      queryInterface.removeColumn('athletes', 'province').catch(() => {}),
      queryInterface.removeColumn('athletes', 'district').catch(() => {}),
      queryInterface.removeColumn('athletes', 'city').catch(() => {})
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    // Add columns back (if needed)
    await queryInterface.addColumn('athletes', 'province', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('athletes', 'district', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('athletes', 'city', {
      type: Sequelize.STRING,
      allowNull: true
    });
  }
};

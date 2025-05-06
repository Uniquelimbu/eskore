'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const columns = await queryInterface.describeTable('teams');
    // Only add if not present
    if (!columns.abbreviation) {
      await queryInterface.addColumn('teams', 'abbreviation', {
        type: Sequelize.STRING(3),
        allowNull: true
      });
    }
    if (!columns.foundedYear) {
      await queryInterface.addColumn('teams', 'foundedYear', {
        type: Sequelize.INTEGER,
        allowNull: true
      });
    }
    if (!columns.city) {
      await queryInterface.addColumn('teams', 'city', {
        type: Sequelize.STRING,
        allowNull: true
      });
    }
    if (!columns.nickname) {
      await queryInterface.addColumn('teams', 'nickname', {
        type: Sequelize.STRING,
        allowNull: true
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    const columns = await queryInterface.describeTable('teams');
    const removeIfExists = async (col) => {
      if (columns[col]) {
        await queryInterface.removeColumn('teams', col);
      }
    };
    await removeIfExists('abbreviation');
    await removeIfExists('foundedYear');
    await removeIfExists('city');
    await removeIfExists('nickname');
  }
};

'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Ensure we only add columns that are missing to avoid errors when re-running or in CI.
    const columns = await queryInterface.describeTable('users');

    const addIfMissing = async (name, definition) => {
      if (!columns[name]) {
        await queryInterface.addColumn('users', name, definition);
      }
    };

    await addIfMissing('profileImageUrl', {
      type: Sequelize.STRING,
      allowNull: true
    });

    await addIfMissing('bio', {
      type: Sequelize.TEXT,
      allowNull: true
    });

    // JSONB is preferred for Postgres, fallback to JSON for other dialects
    const jsonType = queryInterface.sequelize.options.dialect === 'postgres' ? Sequelize.JSONB : Sequelize.JSON;

    await addIfMissing('socialLinks', {
      type: jsonType,
      allowNull: true
    });

    await addIfMissing('gameSpecificStats', {
      type: jsonType,
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Drop columns if they exist
    const columns = await queryInterface.describeTable('users');

    const dropIfExists = async (name) => {
      if (columns[name]) {
        await queryInterface.removeColumn('users', name);
      }
    };

    await dropIfExists('profileImageUrl');
    await dropIfExists('bio');
    await dropIfExists('socialLinks');
    await dropIfExists('gameSpecificStats');
  }
}; 
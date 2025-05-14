'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if table already exists to prevent errors on repeated migrations
    const tableExists = await queryInterface.sequelize.query(
      "SELECT to_regclass('public.formations')",
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    if (tableExists[0].to_regclass) {
      console.log('Formations table already exists, skipping creation');
      return;
    }

    console.log('Creating formations table...');
    await queryInterface.createTable('formations', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      teamId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'teams',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      schema_json: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: {}
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Add index on teamId for faster lookups
    await queryInterface.addIndex('formations', ['teamId']);
    console.log('Formations table created successfully with teamId index');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('formations');
    console.log('Formations table dropped successfully');
  }
};

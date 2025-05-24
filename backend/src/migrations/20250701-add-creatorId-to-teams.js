'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // First, check if the column already exists to avoid errors
    const tableInfo = await queryInterface.describeTable('teams');
    
    // If creatorId doesn't exist but createdBy does, we'll rename
    if (!tableInfo.creatorId && tableInfo.createdBy) {
      console.log('Renaming createdBy to creatorId');
      await queryInterface.renameColumn('teams', 'createdBy', 'creatorId');
    } 
    // If neither exists, add creatorId
    else if (!tableInfo.creatorId && !tableInfo.createdBy) {
      console.log('Adding creatorId column');
      await queryInterface.addColumn('teams', 'creatorId', {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        defaultValue: 1 // Temporary default for existing rows
      });
    }
    // If both exist, we'll keep both for now
  },

  down: async (queryInterface, Sequelize) => {
    // If we want to revert, we can rename creatorId back to createdBy
    // but it's safer not to drop the column in case data differs
    try {
      const tableInfo = await queryInterface.describeTable('teams');
      if (tableInfo.creatorId && !tableInfo.createdBy) {
        await queryInterface.renameColumn('teams', 'creatorId', 'createdBy');
      }
    } catch (error) {
      console.error('Migration down error:', error);
    }
  }
};

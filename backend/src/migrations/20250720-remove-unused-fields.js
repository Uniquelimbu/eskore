'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      // Get table information
      const userTableExists = await tableExists(queryInterface, 'users');
      const playerTableExists = await tableExists(queryInterface, 'players');
      const managerTableExists = await tableExists(queryInterface, 'managers');
      
      // Remove fields from User table
      if (userTableExists) {
        const userColumns = await queryInterface.describeTable('users');
        if (userColumns.height) {
          await queryInterface.removeColumn('users', 'height', { transaction });
          console.log('Removed height column from users table');
        }
        if (userColumns.position) {
          await queryInterface.removeColumn('users', 'position', { transaction });
          console.log('Removed position column from users table');
        }
        if (userColumns.socialLinks) {
          await queryInterface.removeColumn('users', 'socialLinks', { transaction });
          console.log('Removed socialLinks column from users table');
        }
        if (userColumns.gameSpecificStats) {
          await queryInterface.removeColumn('users', 'gameSpecificStats', { transaction });
          console.log('Removed gameSpecificStats column from users table');
        }
      }
      
      // Remove fields from Player table
      if (playerTableExists) {
        const playerColumns = await queryInterface.describeTable('players');
        if (playerColumns.nationality) {
          await queryInterface.removeColumn('players', 'nationality', { transaction });
          console.log('Removed nationality column from players table');
        }
        if (playerColumns.profileImageUrl) {
          await queryInterface.removeColumn('players', 'profileImageUrl', { transaction });
          console.log('Removed profileImageUrl column from players table');
        }
        if (playerColumns.dateOfBirth) {
          await queryInterface.removeColumn('players', 'dateOfBirth', { transaction });
          console.log('Removed dateOfBirth column from players table');
        }
      }
      
      // Remove fields from Manager table
      if (managerTableExists) {
        const managerColumns = await queryInterface.describeTable('managers');
        if (managerColumns.profileImageUrl) {
          await queryInterface.removeColumn('managers', 'profileImageUrl', { transaction });
          console.log('Removed profileImageUrl column from managers table');
        }
      }
      
      await transaction.commit();
      return Promise.resolve();
    } catch (error) {
      await transaction.rollback();
      console.error('Migration error:', error);
      return Promise.reject(error);
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      // Get table information
      const userTableExists = await tableExists(queryInterface, 'users');
      const playerTableExists = await tableExists(queryInterface, 'players');
      const managerTableExists = await tableExists(queryInterface, 'managers');
      
      // Restore User columns
      if (userTableExists) {
        const userColumns = await queryInterface.describeTable('users');
        if (!userColumns.height) {
          await queryInterface.addColumn('users', 'height', {
            type: Sequelize.FLOAT,
            allowNull: true
          }, { transaction });
        }
        if (!userColumns.position) {
          await queryInterface.addColumn('users', 'position', {
            type: Sequelize.STRING,
            allowNull: true
          }, { transaction });
        }
        if (!userColumns.socialLinks) {
          const jsonType = queryInterface.sequelize.options.dialect === 'postgres' 
            ? Sequelize.JSONB 
            : Sequelize.JSON;
          await queryInterface.addColumn('users', 'socialLinks', {
            type: jsonType,
            allowNull: true
          }, { transaction });
        }
        if (!userColumns.gameSpecificStats) {
          const jsonType = queryInterface.sequelize.options.dialect === 'postgres' 
            ? Sequelize.JSONB 
            : Sequelize.JSON;
          await queryInterface.addColumn('users', 'gameSpecificStats', {
            type: jsonType,
            allowNull: true
          }, { transaction });
        }
      }
      
      // Restore Player columns
      if (playerTableExists) {
        const playerColumns = await queryInterface.describeTable('players');
        if (!playerColumns.nationality) {
          await queryInterface.addColumn('players', 'nationality', {
            type: Sequelize.STRING(100),
            allowNull: true
          }, { transaction });
        }
        if (!playerColumns.profileImageUrl) {
          await queryInterface.addColumn('players', 'profileImageUrl', {
            type: Sequelize.STRING,
            allowNull: true
          }, { transaction });
        }
        if (!playerColumns.dateOfBirth) {
          await queryInterface.addColumn('players', 'dateOfBirth', {
            type: Sequelize.DATE,
            allowNull: true
          }, { transaction });
        }
      }
      
      // Restore Manager columns
      if (managerTableExists) {
        const managerColumns = await queryInterface.describeTable('managers');
        if (!managerColumns.profileImageUrl) {
          await queryInterface.addColumn('managers', 'profileImageUrl', {
            type: Sequelize.STRING,
            allowNull: true
          }, { transaction });
        }
      }
      
      await transaction.commit();
      return Promise.resolve();
    } catch (error) {
      await transaction.rollback();
      console.error('Migration rollback error:', error);
      return Promise.reject(error);
    }
  }
};

// Helper function to check if a table exists
async function tableExists(queryInterface, tableName) {
  try {
    const tables = await queryInterface.sequelize.query(
      `SELECT to_regclass('public.${tableName}')`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    return tables[0].to_regclass !== null;
  } catch (error) {
    // For databases other than PostgreSQL
    try {
      await queryInterface.describeTable(tableName);
      return true;
    } catch (error) {
      return false;
    }
  }
}

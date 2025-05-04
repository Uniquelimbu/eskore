'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if the athletes table exists before attempting to modify it
    try {
      const tables = await queryInterface.sequelize.query(
        "SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name='athletes'",
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      );
      
      if (tables.length > 0) {
        // Table exists, proceed with removing columns
        await Promise.all([
          queryInterface.removeColumn('athletes', 'province').catch(() => {}),
          queryInterface.removeColumn('athletes', 'district').catch(() => {}),
          queryInterface.removeColumn('athletes', 'city').catch(() => {})
        ]);
        console.log('Removed address fields from athletes table');
      } else {
        console.log('Athletes table does not exist, skipping migration');
      }
    } catch (error) {
      console.log('Error checking for athletes table, skipping migration:', error.message);
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      const tables = await queryInterface.sequelize.query(
        "SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name='athletes'",
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      );
      
      if (tables.length > 0) {
        // Table exists, add columns back
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
    } catch (error) {
      console.log('Error in migration down method:', error.message);
    }
  }
};

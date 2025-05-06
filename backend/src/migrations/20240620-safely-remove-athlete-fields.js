'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      const tables = await queryInterface.sequelize.query(
        "SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name='athletes'",
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      );
      if (tables.length > 0) {
        const columns = await queryInterface.describeTable('athletes');
        if (columns.province) await queryInterface.removeColumn('athletes', 'province').catch(() => {});
        if (columns.district) await queryInterface.removeColumn('athletes', 'district').catch(() => {});
        if (columns.city) await queryInterface.removeColumn('athletes', 'city').catch(() => {});
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
        const columns = await queryInterface.describeTable('athletes');
        if (!columns.province) {
          await queryInterface.addColumn('athletes', 'province', {
            type: Sequelize.STRING,
            allowNull: true
          });
        }
        if (!columns.district) {
          await queryInterface.addColumn('athletes', 'district', {
            type: Sequelize.STRING,
            allowNull: true
          });
        }
        if (!columns.city) {
          await queryInterface.addColumn('athletes', 'city', {
            type: Sequelize.STRING,
            allowNull: true
          });
        }
      }
    } catch (error) {
      console.log('Error in migration down method:', error.message);
    }
  }
};

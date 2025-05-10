'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Your implementation here
      // Example:
      // const existingRecords = await queryInterface.sequelize.query(
      //   'SELECT * FROM your_table WHERE condition',
      //   { type: queryInterface.sequelize.QueryTypes.SELECT }
      // );
      //
      // if (existingRecords.length > 0) {
      //   console.log('Records already exist. Skipping.');
      //   return Promise.resolve();
      // }
      //
      // const records = [
      //   {
      //     field1: 'value1',
      //     field2: 'value2',
      //     createdAt: new Date(),
      //     updatedAt: new Date()
      //   }
      // ];
      //
      // return queryInterface.bulkInsert('your_table', records, {});
      
      return Promise.resolve();
    } catch (error) {
      console.error('Error in seeder:', error);
      return Promise.reject(error);
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Your down implementation here
    // Example:
    // return queryInterface.bulkDelete('your_table', {
    //   field1: 'value1'
    // }, {});
    
    return Promise.resolve();
  }
};

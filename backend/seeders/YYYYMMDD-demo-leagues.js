'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('leagues', [
      {
        name: 'Premier League',
        startDate: '2023-08-01',
        endDate: '2024-05-30',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'La Liga',
        startDate: '2023-08-15',
        endDate: '2024-05-25',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Nepal Super League',
        startDate: '2023-09-01',
        endDate: '2024-04-30',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('leagues', null, {});
  }
};

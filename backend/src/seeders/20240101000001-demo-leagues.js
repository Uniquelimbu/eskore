'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if leagues already exist to avoid duplicates
    const existingLeagues = await queryInterface.sequelize.query(
      'SELECT name FROM leagues WHERE name IN (:names)',
      {
        replacements: { names: ['Premier League', 'La Liga', 'Nepal Super League'] },
        type: queryInterface.sequelize.QueryTypes.SELECT
      }
    );
    
    const existingNames = existingLeagues.map(league => league.name);
    
    const leagues = [
      {
        name: 'Premier League',
        startDate: new Date('2024-08-15'),
        endDate: new Date('2025-05-25'),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'La Liga',
        startDate: new Date('2024-08-20'),
        endDate: new Date('2025-05-30'),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Nepal Super League',
        startDate: new Date('2024-07-01'),
        endDate: new Date('2024-12-15'),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ].filter(league => !existingNames.includes(league.name));
    
    if (leagues.length === 0) {
      console.log('All leagues already exist. Skipping insertion.');
      return Promise.resolve();
    }
    
    console.log(`Inserting ${leagues.length} new leagues`);    return queryInterface.bulkInsert('leagues', leagues);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('leagues', {
      name: {
        [Sequelize.Op.in]: ['Premier League', 'La Liga', 'Nepal Super League']
      }
    }, {});
  }
};

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
      // ...existing league objects...
    ].filter(league => !existingNames.includes(league.name));
    
    if (leagues.length === 0) {
      console.log('All leagues already exist. Skipping insertion.');
      return Promise.resolve();
    }
    
    console.log(`Inserting ${leagues.length} new leagues`);
    return queryInterface.bulkInsert('leagues', leagues);
  },

  // ...existing down method...
};

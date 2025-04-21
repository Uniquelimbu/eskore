'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // First get the created leagues to reference their IDs
    const leagues = await queryInterface.sequelize.query(
      'SELECT id from leagues;',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    if (!leagues || leagues.length === 0) {
      console.log('No leagues found. Please run league seeds first.');
      return;
    }

    const leagueId = leagues[0].id;
    
    // Check if these emails already exist to avoid unique constraint violations
    const existingTeams = await queryInterface.sequelize.query(
      `SELECT email FROM teams WHERE email IN ('barca@example.com', 'madrid@example.com', 'manutd@example.com', 'bayern@example.com')`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    
    const existingEmails = existingTeams.map(team => team.email);
    console.log(`Found ${existingEmails.length} existing teams: ${existingEmails.join(', ')}`);

    // Prepare teams data
    const teams = [
      {
        name: 'Barcelona FC',
        logoUrl: 'https://via.placeholder.com/150?text=Barcelona',
        leagueId: leagueId,
        email: 'barca@example.com',
        passwordHash: '$2a$10$rh1eoophXTB8.CSGxDz0ieoHjfZjwtYqGutBgTxw1nep6wIAY9xHG', // Same hash for "password123"
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Real Madrid',
        logoUrl: 'https://via.placeholder.com/150?text=Madrid',
        leagueId: leagueId,
        email: 'madrid@example.com',
        passwordHash: '$2a$10$rh1eoophXTB8.CSGxDz0ieoHjfZjwtYqGutBgTxw1nep6wIAY9xHG', // Same hash for "password123"
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Manchester United',
        logoUrl: 'https://via.placeholder.com/150?text=ManUtd',
        leagueId: leagueId,
        email: 'manutd@example.com',
        passwordHash: '$2a$10$rh1eoophXTB8.CSGxDz0ieoHjfZjwtYqGutBgTxw1nep6wIAY9xHG', // Same hash for "password123"
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Bayern Munich',
        logoUrl: 'https://via.placeholder.com/150?text=Bayern',
        leagueId: leagueId,
        email: 'bayern@example.com',
        passwordHash: '$2a$10$rh1eoophXTB8.CSGxDz0ieoHjfZjwtYqGutBgTxw1nep6wIAY9xHG', // Same hash for "password123"
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    // Filter out teams that already exist in the database
    const newTeams = teams.filter(team => !existingEmails.includes(team.email));
    
    if (newTeams.length === 0) {
      console.log('All teams already exist in the database. Skipping insertion.');
      return Promise.resolve();
    }
    
    console.log(`Inserting ${newTeams.length} new teams`);
    return queryInterface.bulkInsert('teams', newTeams);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('teams', null, {});
  }
};

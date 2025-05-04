'use strict';
const bcrypt = require('bcrypt');

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
    
    // Generate password hash
    const passwordHash = await bcrypt.hash('password123', 10);
    
    // Check if these emails already exist to avoid unique constraint violations
    const existingTeams = await queryInterface.sequelize.query(
      'SELECT email from teams WHERE email IN (:emails);',
      {
        replacements: { emails: ['barca@example.com', 'madrid@example.com', 'atletico@example.com'] },
        type: queryInterface.sequelize.QueryTypes.SELECT
      }
    );

    const existingEmails = existingTeams.map(team => team.email);

    // Prepare teams data
    const teams = [
      {
        name: 'Barcelona FC',
        logoUrl: 'https://via.placeholder.com/150?text=Barcelona',
        leagueId: leagueId,
        email: 'barca@example.com',
        passwordHash: passwordHash,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Real Madrid',
        logoUrl: 'https://via.placeholder.com/150?text=Real+Madrid',
        leagueId: leagueId,
        email: 'madrid@example.com',
        passwordHash: passwordHash,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Atletico Madrid',
        logoUrl: 'https://via.placeholder.com/150?text=Atletico+Madrid',
        leagueId: leagueId,
        email: 'atletico@example.com',
        passwordHash: passwordHash,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ].filter(team => !existingEmails.includes(team.email));
    
    await queryInterface.bulkInsert('teams', teams, {});
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('teams', null, {});
  }
};
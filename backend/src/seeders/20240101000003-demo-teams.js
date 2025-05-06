'use strict';
const bcrypt = require('bcrypt');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if these emails already exist to avoid unique constraint violations
    const existingTeams = await queryInterface.sequelize.query(
      'SELECT email from teams WHERE email IN (:emails);',
      {
        replacements: { emails: ['barca@example.com', 'madrid@example.com', 'atletico@example.com'] },
        type: queryInterface.sequelize.QueryTypes.SELECT
      }
    );
    const existingEmails = existingTeams.map(team => team.email);

    // Generate password hash
    const passwordHash = await bcrypt.hash('password123', 10);

    // Prepare teams data (no leagueId)
    const teams = [
      {
        name: 'Barcelona FC',
        logoUrl: 'https://via.placeholder.com/150?text=Barcelona',
        email: 'barca@example.com',
        passwordHash: passwordHash,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Real Madrid',
        logoUrl: 'https://via.placeholder.com/150?text=Real+Madrid',
        email: 'madrid@example.com',
        passwordHash: passwordHash,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Atletico Madrid',
        logoUrl: 'https://via.placeholder.com/150?text=Atletico+Madrid',
        email: 'atletico@example.com',
        passwordHash: passwordHash,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ].filter(team => !existingEmails.includes(team.email));

    if (teams.length === 0) {
      console.log('All teams already exist. Skipping insertion.');
      return Promise.resolve();
    }

    await queryInterface.bulkInsert('teams', teams, {});
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('teams', null, {});
  }
};
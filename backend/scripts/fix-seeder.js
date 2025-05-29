// Create a fixed seeder file for teams
const fs = require('fs');
const path = require('path');

const teamsSeederContent = `'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // First, verify that users exist before creating teams
      const users = await queryInterface.sequelize.query(
        'SELECT id, email FROM users WHERE email IN (:emails)',
        {
          replacements: { emails: ['admin@eskore.com', 'test@eskore.com', 'user@eskore.com'] },
          type: queryInterface.sequelize.QueryTypes.SELECT
        }
      );
      
      if (users.length === 0) {
        console.log('No users found. Teams creation requires users. Skipping.');
        return Promise.resolve();
      }
      
      console.log(\`Found \${users.length} users to associate with teams\`);
      
      // Check if these emails already exist to avoid unique constraint violations
      const existingTeams = await queryInterface.sequelize.query(
        'SELECT email FROM teams WHERE email IN (:emails)',
        {
          replacements: { emails: ['barca@example.com', 'madrid@example.com', 'atletico@example.com'] },
          type: queryInterface.sequelize.QueryTypes.SELECT
        }
      );
      const existingEmails = existingTeams.map(team => team.email);
      
      // Prepare teams data - removed password fields
      const teams = [
        {
          name: 'Barcelona FC',
          logoUrl: 'https://via.placeholder.com/150?text=Barcelona',
          email: 'barca@example.com',
          abbreviation: 'BAR',
          foundedYear: 1899,
          city: 'Barcelona',
          nickname: 'Blaugrana',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: 'Real Madrid',
          logoUrl: 'https://via.placeholder.com/150?text=Real+Madrid',
          email: 'madrid@example.com',
          abbreviation: 'RMA',
          foundedYear: 1902,
          city: 'Madrid',
          nickname: 'Los Blancos',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: 'Atletico Madrid',
          logoUrl: 'https://via.placeholder.com/150?text=Atletico+Madrid',
          email: 'atletico@example.com',
          abbreviation: 'ATM',
          foundedYear: 1903,
          city: 'Madrid',
          nickname: 'Los Colchoneros',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ].filter(team => !existingEmails.includes(team.email));

      if (teams.length === 0) {
        console.log('All teams already exist. Skipping insertion.');
        return Promise.resolve();
      }

      console.log(\`Inserting \${teams.length} new teams\`);
      await queryInterface.bulkInsert('teams', teams, {});
      
      return Promise.resolve();
    } catch (error) {
      console.error('Error seeding teams:', error);
      return Promise.reject(error);
    }
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('teams', {
      email: {
        [Sequelize.Op.in]: ['barca@example.com', 'madrid@example.com', 'atletico@example.com']
      }
    }, {});
  }
};`;

const filePath = path.join(__dirname, 'src', 'seeders', '20240101000003-demo-teams.js');

try {
  // Delete the file if it exists
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    console.log(`Deleted existing file: ${filePath}`);
  }

  // Write the new file
  fs.writeFileSync(filePath, teamsSeederContent);
  console.log(`Successfully created: ${filePath}`);
} catch (err) {
  console.error(`Error: ${err.message}`);
}

'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Check for existing tournaments
      const existingTournaments = await queryInterface.sequelize.query(
        'SELECT name FROM tournaments WHERE name IN (:names)',
        {
          replacements: { names: ['Summer Cup 2025', 'Winter Championship 2025'] },
          type: queryInterface.sequelize.QueryTypes.SELECT
        }
      );
      
      const existingNames = existingTournaments.map(t => t.name);
      
      // Get admin user ID as creator
      const adminUser = await queryInterface.sequelize.query(
        'SELECT id FROM users WHERE email = :email LIMIT 1',
        {
          replacements: { email: 'admin@eskore.com' },
          type: queryInterface.sequelize.QueryTypes.SELECT
        }
      );
      
      if (adminUser.length === 0) {
        console.log('Admin user not found. Skipping tournament creation.');
        return Promise.resolve();
      }
      
      const creatorId = adminUser[0].id;
      
      const tournaments = [
        {
          name: 'Summer Cup 2025',
          description: 'Annual summer tournament featuring top teams from around the world',
          startDate: new Date('2025-06-15'),
          endDate: new Date('2025-07-15'),
          status: 'registration',
          creatorId: creatorId,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: 'Winter Championship 2025',
          description: 'Indoor winter championship with competitive divisions',
          startDate: new Date('2025-12-01'),
          endDate: new Date('2025-12-20'),
          status: 'draft',
          creatorId: creatorId,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ].filter(tournament => !existingNames.includes(tournament.name));
      
      if (tournaments.length === 0) {
        console.log('All tournaments already exist. Skipping insertion.');
        return Promise.resolve();
      }
      
      console.log(`Inserting ${tournaments.length} tournaments`);
      return queryInterface.bulkInsert('tournaments', tournaments, {});
    } catch (error) {
      console.error('Error seeding tournaments:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('tournaments', {
      name: ['Summer Cup 2025', 'Winter Championship 2025']
    }, {});
  }
};

'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Get IDs of existing users and teams
      const users = await queryInterface.sequelize.query(
        'SELECT id, email FROM users WHERE email IN (:emails)',
        {
          replacements: { emails: ['admin@eskore.com', 'user@eskore.com', 'test@eskore.com'] },
          type: queryInterface.sequelize.QueryTypes.SELECT
        }
      );
      
      const teams = await queryInterface.sequelize.query(
        'SELECT id, email FROM teams WHERE email IN (:emails)',
        {
          replacements: { emails: ['barca@example.com', 'madrid@example.com', 'atletico@example.com'] },
          type: queryInterface.sequelize.QueryTypes.SELECT
        }
      );
      
      if (users.length === 0 || teams.length === 0) {
        console.log('No users or teams found for creating relationships. Skipping');
        return Promise.resolve();
      }
      
      // Check for existing memberships to avoid duplicates
      const existingMemberships = await queryInterface.sequelize.query(
        'SELECT "userId", "teamId" FROM user_teams',
        {
          type: queryInterface.sequelize.QueryTypes.SELECT
        }
      );
      
      // Create relationships
      const userTeams = [];
      
      // Make admin a manager of Barcelona
      const adminUser = users.find(u => u.email === 'admin@eskore.com');
      const barcelonaTeam = teams.find(t => t.email === 'barca@example.com');
      if (adminUser && barcelonaTeam) {
        userTeams.push({
          userId: adminUser.id,
          teamId: barcelonaTeam.id,
          role: 'manager',
          status: 'active',
          joinedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
      
      // Make test user an athlete of Real Madrid
      const testUser = users.find(u => u.email === 'test@eskore.com');
      const madridTeam = teams.find(t => t.email === 'madrid@example.com');
      if (testUser && madridTeam) {
        userTeams.push({
          userId: testUser.id,
          teamId: madridTeam.id,
          role: 'athlete',
          status: 'active',
          joinedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
      
      // Make regular user a coach of Atletico Madrid
      const regularUser = users.find(u => u.email === 'user@eskore.com');
      const atleticoTeam = teams.find(t => t.email === 'atletico@example.com');
      if (regularUser && atleticoTeam) {
        userTeams.push({
          userId: regularUser.id,
          teamId: atleticoTeam.id,
          role: 'coach',
          status: 'active',
          joinedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
      
      // Filter out any relationships that already exist
      const filteredUserTeams = userTeams.filter(ut => {
        return !existingMemberships.some(em => 
          em.userId === ut.userId && em.teamId === ut.teamId
        );
      });
      
      if (filteredUserTeams.length === 0) {
        console.log('All user-team relationships already exist. Skipping insertion.');
        return Promise.resolve();
      }
      
      console.log(`Inserting ${filteredUserTeams.length} user-team relationships`);
      return queryInterface.bulkInsert('user_teams', filteredUserTeams, {});
    } catch (error) {
      console.error('Error seeding user-team relationships:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Remove the relationships created by this seeder
    // Note: In a production environment, you might want to be more specific
    return queryInterface.bulkDelete('user_teams', null, {});
  }
};

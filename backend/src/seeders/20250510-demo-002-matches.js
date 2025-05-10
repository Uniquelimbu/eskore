'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Get teams
      const teams = await queryInterface.sequelize.query(
        'SELECT id, name FROM teams LIMIT 3',
        {
          type: queryInterface.sequelize.QueryTypes.SELECT
        }
      );
      
      if (teams.length < 2) {
        console.log('Not enough teams found for creating matches. Skipping');
        return Promise.resolve();
      }
      
      // Get league
      const leagues = await queryInterface.sequelize.query(
        'SELECT id FROM leagues LIMIT 1',
        {
          type: queryInterface.sequelize.QueryTypes.SELECT
        }
      );
      
      if (leagues.length === 0) {
        console.log('No leagues found for creating matches. Skipping');
        return Promise.resolve();
      }
      
      const leagueId = leagues[0].id;
      
      // Check for existing matches between these teams
      const teamIds = teams.map(team => team.id);
      const existingMatches = await queryInterface.sequelize.query(
        `SELECT id FROM matches 
         WHERE ("homeTeamId" IN (:teamIds) AND "awayTeamId" IN (:teamIds))`,
        {
          replacements: { teamIds },
          type: queryInterface.sequelize.QueryTypes.SELECT
        }
      );
      
      if (existingMatches.length > 0) {
        console.log('Matches between these teams already exist. Skipping insertion.');
        return Promise.resolve();
      }
        // Try to get tournament
      const tournaments = await queryInterface.sequelize.query(
        'SELECT id FROM tournaments LIMIT 1',
        {
          type: queryInterface.sequelize.QueryTypes.SELECT
        }
      );
      
      // Create a few matches
      const matches = [
        {
          homeTeamId: teams[0].id,
          awayTeamId: teams[1].id,
          homeScore: 2,
          awayScore: 1,
          status: 'completed',
          date: new Date('2025-05-01T15:00:00Z'),
          leagueId: leagueId,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          homeTeamId: teams[1].id,
          awayTeamId: teams[2].id,
          homeScore: null,          awayScore: null,
          status: 'scheduled',
          date: new Date('2025-05-15T18:30:00Z'),
          leagueId: leagueId,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          homeTeamId: teams[2].id,
          awayTeamId: teams[0].id,
          homeScore: null,
          awayScore: null,
          status: 'scheduled',
          date: new Date('2025-05-22T19:00:00Z'),
          leagueId: leagueId,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      
      console.log(`Inserting ${matches.length} matches`);
      return queryInterface.bulkInsert('matches', matches, {});
    } catch (error) {
      console.error('Error seeding matches:', error);
      return Promise.reject(error);
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      // Get the matches we created
      const teams = await queryInterface.sequelize.query(
        'SELECT id FROM teams LIMIT 3',
        {
          type: queryInterface.sequelize.QueryTypes.SELECT
        }
      );
      
      if (teams.length < 2) {
        return Promise.resolve();
      }
      
      const teamIds = teams.map(team => team.id);
      
      // Delete matches between these teams
      return queryInterface.bulkDelete('matches', {
        [Sequelize.Op.or]: [
          {
            homeTeamId: { [Sequelize.Op.in]: teamIds },
            awayTeamId: { [Sequelize.Op.in]: teamIds }
          }
        ]
      }, {});
    } catch (error) {
      console.error('Error in down migration:', error);
      return Promise.reject(error);
    }
  }
};

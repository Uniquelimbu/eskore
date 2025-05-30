/**
 * Sets up all database model associations
 */
const User = require('./User');
const Team = require('./Team');
const League = require('./League');
const Match = require('./Match');
const Role = require('./Role');
const UserRole = require('./UserRole'); // <-- Fix case here
const UserTeam = require('./UserTeam');
const Tournament = require('./Tournament');
const UserTournament = require('./UserTournament');
const TeamTournament = require('./TeamTournament');
const UserMatch = require('./UserMatch');
const Formation = require('./Formation');
const Manager = require('./Manager'); // <-- Require Manager model
const Player = require('./Player'); // Add this import

function setupAssociations() {
  // Existing associations
  Match.belongsTo(League, { foreignKey: 'leagueId' });
  League.hasMany(Match, { foreignKey: 'leagueId' });
  Match.belongsTo(Team, { as: 'homeTeam', foreignKey: 'homeTeamId' });
  Match.belongsTo(Team, { as: 'awayTeam', foreignKey: 'awayTeamId' });
  Team.hasMany(Match, { as: 'homeMatches', foreignKey: 'homeTeamId' });
  Team.hasMany(Match, { as: 'awayMatches', foreignKey: 'awayTeamId' });
  
  // Add Player associations here if needed
  User.hasOne(Player, { foreignKey: 'userId', as: 'Player' });
  Player.belongsTo(User, { foreignKey: 'userId', as: 'user' });
  
  // New associations
  // User - Role (many-to-many)
  User.belongsToMany(Role, { through: UserRole, foreignKey: 'userId', otherKey: 'roleId' });
  Role.belongsToMany(User, { through: UserRole, foreignKey: 'roleId', otherKey: 'userId' });
  
  // User - Team (many-to-many)
  User.belongsToMany(Team, { 
    through: UserTeam, 
    foreignKey: 'userId', 
    otherKey: 'teamId' 
  });
  // Provide explicit alias 'Users' so we can eagerly load team members with team.getUsers()
  Team.belongsToMany(User, { 
    through: UserTeam, 
    foreignKey: 'teamId', 
    otherKey: 'userId', 
    as: 'Users' // Alias must match the include used in routes
  });
  
  // UserTeam relationships
  User.hasMany(UserTeam, { foreignKey: 'userId' });
  UserTeam.belongsTo(User, { foreignKey: 'userId' });
  Team.hasMany(UserTeam, { foreignKey: 'teamId' });
  UserTeam.belongsTo(Team, { foreignKey: 'teamId' });
  
  // Tournament relationships
  Tournament.belongsTo(User, { as: 'creator', foreignKey: 'creatorId' });
  User.hasMany(Tournament, { as: 'createdTournaments', foreignKey: 'creatorId' });
  
  // User - Tournament (many-to-many)
  User.belongsToMany(Tournament, { through: UserTournament, foreignKey: 'userId', otherKey: 'tournamentId' });
  Tournament.belongsToMany(User, { through: UserTournament, foreignKey: 'tournamentId', otherKey: 'userId' });
  
  // Team - Tournament (many-to-many)
  Team.belongsToMany(Tournament, { through: TeamTournament, foreignKey: 'teamId', otherKey: 'tournamentId' });
  Tournament.belongsToMany(Team, { through: TeamTournament, foreignKey: 'tournamentId', otherKey: 'teamId' });
  
  // User Tournament relationships
  User.hasMany(UserTournament, { foreignKey: 'userId' });
  UserTournament.belongsTo(User, { foreignKey: 'userId' });
  Tournament.hasMany(UserTournament, { foreignKey: 'tournamentId' });
  UserTournament.belongsTo(Tournament, { foreignKey: 'tournamentId' });
  
  // Team Tournament relationships
  Team.hasMany(TeamTournament, { foreignKey: 'teamId' });
  TeamTournament.belongsTo(Team, { foreignKey: 'teamId' });
  Tournament.hasMany(TeamTournament, { foreignKey: 'tournamentId' });
  TeamTournament.belongsTo(Tournament, { foreignKey: 'tournamentId' });

  // UserMatch associations
  if (User && Match && UserMatch) {
    // User to Match through UserMatch (many-to-many)
    User.belongsToMany(Match, { through: UserMatch, foreignKey: 'userId' });
    Match.belongsToMany(User, { through: UserMatch, foreignKey: 'matchId' });
    
    // Direct associations to UserMatch
    User.hasMany(UserMatch, { foreignKey: 'userId' });
    UserMatch.belongsTo(User, { foreignKey: 'userId' });
    
    Match.hasMany(UserMatch, { foreignKey: 'matchId' });
    UserMatch.belongsTo(Match, { foreignKey: 'matchId' });
    
    // Team association with UserMatch if applicable
    if (Team) {
      Team.hasMany(UserMatch, { foreignKey: 'teamId' });
      UserMatch.belongsTo(Team, { foreignKey: 'teamId' });
    }
  }

  // Set up Formation-Team association with debug logging
  try {
    console.log('Setting up Formation-Team association');
    Formation.belongsTo(Team, { foreignKey: 'teamId' });
    Team.hasOne(Formation, { foreignKey: 'teamId' });
    console.log('Formation-Team association established successfully');
  } catch (error) {
    console.error('Error setting up Formation-Team association:', error);
  }

  // Team hooks with better error handling
  Team.afterCreate(async (team, options) => {
    try {
      // Instead of trying to create here, just log the intent
      console.log(`Team afterCreate hook triggered for team ID: ${team.id}`);
      // Don't create formation here - it will be created in the afterCommit hook
    } catch (error) {
      console.error(`Failed to log team creation ${team.id}:`, error);
      // Don't throw error to prevent blocking team creation
    }
  });

  // Team associations
  Team.hasMany(Formation, { foreignKey: 'teamId', as: 'formations' });
  Formation.belongsTo(Team, { foreignKey: 'teamId' });

  // Enhanced and consolidated team-formation afterCreate hook
  Team.addHook('afterCreate', async (team, options) => {
    try {
      const teamId = team.id;
      
      // Use the same transaction from team creation if available
      const transaction = options.transaction;
      
      if (transaction) {
        // If we're in a transaction, register an after commit hook
        transaction.afterCommit(async () => {
          try {
            // Increase the delay to ensure team is committed and consistent across database
            setTimeout(async () => {
              try {
                const result = await Formation.createDefaultFormation(teamId);
                if (result) {
                  console.log(`Successfully created default formation for team ${teamId} after transaction commit`);
                } else {
                  console.log(`Skipped formation creation for team ${teamId} - team may have been deleted`);
                }
              } catch (formationError) {
                console.error(`Delayed formation creation failed for team ${teamId}:`, formationError);
              }
            }, 2000); // Increased delay to ensure transaction is fully committed
          } catch (error) {
            console.error(`After-commit formation creation failed for team ${teamId}:`, error);
          }
        });
      } else {
        // If no transaction, handle it immediately but with delay
        setTimeout(async () => {
          try {
            const result = await Formation.createDefaultFormation(teamId);
            if (result) {
              console.log(`Successfully created default formation for team ${teamId} with no transaction`);
            }
          } catch (formationError) {
            console.error(`Deferred formation creation failed for team ${teamId}:`, formationError);
          }
        }, 1000);
      }
    } catch (error) {
      console.error('Error in Team afterCreate hook:', error);
    }
  });

  // Manager association
  User.hasOne(Manager, { foreignKey: 'userId', as: 'Manager' });
  Manager.belongsTo(User, { foreignKey: 'userId', as: 'user' });
  
  // Team-Manager association
  Team.hasMany(Manager, { foreignKey: 'teamId', as: 'managers' });
  Manager.belongsTo(Team, { foreignKey: 'teamId', as: 'team' });
}

module.exports = { setupAssociations };

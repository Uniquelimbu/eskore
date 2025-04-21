const User = require('./User');
const Team = require('./Team');
const League = require('./League');
const Athlete = require('./Athlete');
const Match = require('./Match');
const Manager = require('./Manager'); // Add Manager import

// Import associations
const { setupAssociations } = require('./associations');

// Setup all associations
setupAssociations();

module.exports = {
  User,
  Team,
  League,
  Athlete,
  Match,
  Manager // Export Manager model
};

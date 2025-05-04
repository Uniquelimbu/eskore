const User = require('./User');
const Team = require('./Team');
const League = require('./League');
const Match = require('./Match');

// Import associations
const { setupAssociations } = require('./associations');

// Setup all associations
setupAssociations();

module.exports = {
  User,
  Team,
  League,
  Match
};

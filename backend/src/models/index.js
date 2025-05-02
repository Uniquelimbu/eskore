const User = require('./User');
const Team = require('./Team');
const League = require('./League');
// const Athlete = require('./Athlete'); // Remove or comment out this line
const Match = require('./Match');
// const Manager = require('./Manager'); // Remove or comment out this line

// Import associations
const { setupAssociations } = require('./associations');

// Setup all associations
setupAssociations();

module.exports = {
  User,
  Team,
  League,
  // Athlete, // Remove or comment out this line
  Match,
  // Manager // Remove or comment out this line
};

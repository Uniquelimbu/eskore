// src/helpers/computeStandings.js
const Team = require('../models/Team');
const Match = require('../models/Match');

/**
 * Compute standings table
 * 
 * @returns {Promise<Array>} Array of team standings objects with the following properties:
 *   @property {number} teamId - The team's ID
 *   @property {string} name - The team's name
 *   @property {number} played - Number of matches played
 *   @property {number} wins - Number of matches won
 *   @property {number} draws - Number of matches drawn
 *   @property {number} losses - Number of matches lost
 *   @property {number} goalsFor - Number of goals scored
 *   @property {number} goalsAgainst - Number of goals conceded
 *   @property {number} points - Total points (3 for win, 1 for draw)
 *   @property {number} goalDifference - Goal difference (goalsFor - goalsAgainst)
 */
async function computeStandings() {
  // 1. Get all teams
  const teams = await Team.findAll();
  if (!teams.length) {
    return [];
  }

  // Prepare a stats map
  const teamStats = {};
  teams.forEach(team => {
    teamStats[team.id] = {
      teamId: team.id,
      name: team.name,
      played: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      points: 0
    };
  });

  // 2. Find all matches with status "finished" OR "in-progress" if you want to update partial scores
  // For real-time, you might decide:
  //  - 'finished' only => table reflects only final results
  //  - 'finished' & 'in-progress' => table updates partial live stats
  // For this demo, let's do both.
  const relevantMatches = await Match.findAll({
    where: {
      status: ['in-progress', 'finished']
    }
  });

  // 3. Update stats based on each match
  relevantMatches.forEach(match => {
    const home = teamStats[match.homeTeamId];
    const away = teamStats[match.awayTeamId];
    if (!home || !away) return; // skip if mismatch

    // increment played
    home.played += 1;
    away.played += 1;

    const homeScore = match.homeScore || 0;
    const awayScore = match.awayScore || 0;

    home.goalsFor += homeScore;
    home.goalsAgainst += awayScore;
    away.goalsFor += awayScore;
    away.goalsAgainst += homeScore;

    if (homeScore > awayScore) {
      home.wins += 1;
      home.points += 3;
      away.losses += 1;
    } else if (awayScore > homeScore) {
      away.wins += 1;
      away.points += 3;
      home.losses += 1;
    } else {
      // It's a draw
      home.draws += 1;
      away.draws += 1;
      home.points += 1;
      away.points += 1;
    }
  });

  // 4. Convert map => array, compute goalDifference, sort
  let standings = Object.values(teamStats);
  standings.forEach(t => {
    t.goalDifference = t.goalsFor - t.goalsAgainst;
  });

  // Sort by points desc, then GD desc
  standings.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    return b.goalDifference - a.goalDifference;
  });

  return standings;
}

module.exports = { computeStandings };

/**
 * Create Sample Data Script
 * 
 * Populates the database with sample data for development and testing
 * 
 * Usage: node scripts/db/createSampleData.js
 */
require('dotenv').config();
const bcrypt = require('bcrypt');
const sequelize = require('../../src/config/db');
const { User, Team, UserTeam, Match, Tournament } = require('../../src/models');

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

/**
 * Creates sample users with different roles
 */
async function createUsers() {
  console.log(`${colors.blue}Creating sample users...${colors.reset}`);
  
  const users = [
    {
      email: 'admin@eskore.com',
      password: await bcrypt.hash('admin123', 10),
      firstName: 'Admin',
      lastName: 'User',
      dob: '1990-01-01',
      country: 'United States',
      role: 'admin',
      status: 'active'
    },
    {
      email: 'coach@eskore.com',
      password: await bcrypt.hash('coach123', 10),
      firstName: 'Coach',
      lastName: 'Smith',
      dob: '1985-05-15',
      country: 'United Kingdom',
      role: 'user',
      status: 'active'
    },
    {
      email: 'player1@eskore.com',
      password: await bcrypt.hash('player123', 10),
      firstName: 'Alex',
      lastName: 'Johnson',
      dob: '2000-03-20',
      position: 'FW',
      height: 180,
      country: 'Canada',
      role: 'user',
      status: 'active'
    },
    {
      email: 'player2@eskore.com',
      password: await bcrypt.hash('player123', 10),
      firstName: 'Sam',
      lastName: 'Wilson',
      dob: '2001-07-12',
      position: 'MF',
      height: 175,
      country: 'Australia',
      role: 'user',
      status: 'active'
    },
    {
      email: 'player3@eskore.com',
      password: await bcrypt.hash('player123', 10),
      firstName: 'Jamie',
      lastName: 'Taylor',
      dob: '1999-11-05',
      position: 'DF',
      height: 185,
      country: 'United States',
      role: 'user',
      status: 'active'
    },
    {
      email: 'player4@eskore.com',
      password: await bcrypt.hash('player123', 10),
      firstName: 'Morgan',
      lastName: 'Lee',
      dob: '2002-02-28',
      position: 'GK',
      height: 190,
      country: 'South Korea',
      role: 'user',
      status: 'active'
    }
  ];
  
  const createdUsers = [];
  
  for (const userData of users) {
    try {
      // Check if user already exists
      const exists = await User.findOne({ where: { email: userData.email } });
      
      if (exists) {
        console.log(`${colors.yellow}User ${userData.email} already exists. Skipping.${colors.reset}`);
        createdUsers.push(exists);
      } else {
        const user = await User.create(userData);
        console.log(`${colors.green}Created user: ${user.email}${colors.reset}`);
        createdUsers.push(user);
      }
    } catch (error) {
      console.error(`${colors.red}Error creating user ${userData.email}:${colors.reset}`, error.message);
    }
  }
  
  return createdUsers;
}

/**
 * Creates sample teams
 */
async function createTeams(users) {
  console.log(`\n${colors.blue}Creating sample teams...${colors.reset}`);
  
  const adminUser = users.find(u => u.email === 'admin@eskore.com');
  const coachUser = users.find(u => u.email === 'coach@eskore.com');
  
  if (!adminUser || !coachUser) {
    console.error(`${colors.red}Admin or coach user not found. Cannot create teams.${colors.reset}`);
    return [];
  }
  
  const teams = [
    {
      name: 'Thunderbolts FC',
      abbreviation: 'TFC',
      nickname: 'Bolts',
      foundedYear: 2020,
      city: 'Toronto',
      description: 'A rising team with young talent',
      createdBy: adminUser.id
    },
    {
      name: 'Cosmos United',
      abbreviation: 'COS',
      nickname: 'The Cosmos',
      foundedYear: 2018,
      city: 'Sydney',
      description: 'Known for their fast-paced style',
      createdBy: coachUser.id
    }
  ];
  
  const createdTeams = [];
  
  for (const teamData of teams) {
    try {
      // Check if team already exists
      const exists = await Team.findOne({ where: { name: teamData.name } });
      
      if (exists) {
        console.log(`${colors.yellow}Team ${teamData.name} already exists. Skipping.${colors.reset}`);
        createdTeams.push(exists);
      } else {
        const team = await Team.create(teamData);
        console.log(`${colors.green}Created team: ${team.name}${colors.reset}`);
        createdTeams.push(team);
      }
    } catch (error) {
      console.error(`${colors.red}Error creating team ${teamData.name}:${colors.reset}`, error.message);
    }
  }
  
  return createdTeams;
}

/**
 * Associates users with teams
 */
async function createUserTeams(users, teams) {
  console.log(`\n${colors.blue}Associating users with teams...${colors.reset}`);
  
  const thunderbolts = teams.find(t => t.name === 'Thunderbolts FC');
  const cosmos = teams.find(t => t.name === 'Cosmos United');
  
  if (!thunderbolts || !cosmos) {
    console.error(`${colors.red}Teams not found. Cannot create associations.${colors.reset}`);
    return;
  }
  
  const adminUser = users.find(u => u.email === 'admin@eskore.com');
  const coachUser = users.find(u => u.email === 'coach@eskore.com');
  const player1 = users.find(u => u.email === 'player1@eskore.com');
  const player2 = users.find(u => u.email === 'player2@eskore.com');
  const player3 = users.find(u => u.email === 'player3@eskore.com');
  const player4 = users.find(u => u.email === 'player4@eskore.com');
  
  const userTeams = [
    {
      userId: adminUser.id,
      teamId: thunderbolts.id,
      role: 'manager',
      jerseyNumber: null
    },
    {
      userId: coachUser.id,
      teamId: cosmos.id,
      role: 'manager',
      jerseyNumber: null
    },
    {
      userId: player1.id,
      teamId: thunderbolts.id,
      role: 'athlete',
      jerseyNumber: '9'
    },
    {
      userId: player2.id,
      teamId: thunderbolts.id,
      role: 'athlete',
      jerseyNumber: '8'
    },
    {
      userId: player3.id,
      teamId: cosmos.id,
      role: 'athlete',
      jerseyNumber: '4'
    },
    {
      userId: player4.id,
      teamId: cosmos.id,
      role: 'athlete',
      jerseyNumber: '1'
    }
  ];
  
  for (const utData of userTeams) {
    try {
      // Check if association already exists
      const exists = await UserTeam.findOne({
        where: {
          userId: utData.userId,
          teamId: utData.teamId
        }
      });
      
      if (exists) {
        console.log(`${colors.yellow}User-Team association already exists. Updating.${colors.reset}`);
        await exists.update({ role: utData.role, jerseyNumber: utData.jerseyNumber });
      } else {
        await UserTeam.create(utData);
        console.log(`${colors.green}Created association between user and team${colors.reset}`);
      }
    } catch (error) {
      console.error(`${colors.red}Error creating user-team association:${colors.reset}`, error.message);
    }
  }
}

/**
 * Creates sample tournaments
 */
async function createTournaments(users) {
  console.log(`\n${colors.blue}Creating sample tournaments...${colors.reset}`);
  
  const adminUser = users.find(u => u.email === 'admin@eskore.com');
  
  if (!adminUser) {
    console.error(`${colors.red}Admin user not found. Cannot create tournaments.${colors.reset}`);
    return [];
  }
  
  const tournaments = [
    {
      name: 'Summer Cup 2025',
      startDate: '2025-06-15',
      endDate: '2025-06-30',
      location: 'Toronto, Canada',
      description: 'Annual summer tournament for all ages',
      status: 'upcoming',
      createdBy: adminUser.id
    },
    {
      name: 'Winter League 2025',
      startDate: '2025-01-10',
      endDate: '2025-03-15',
      location: 'Sydney, Australia',
      description: 'Indoor winter league competition',
      status: 'upcoming',
      createdBy: adminUser.id
    }
  ];
  
  const createdTournaments = [];
  
  for (const tournamentData of tournaments) {
    try {
      // Check if tournament already exists
      const exists = await Tournament.findOne({ where: { name: tournamentData.name } });
      
      if (exists) {
        console.log(`${colors.yellow}Tournament ${tournamentData.name} already exists. Skipping.${colors.reset}`);
        createdTournaments.push(exists);
      } else {
        const tournament = await Tournament.create(tournamentData);
        console.log(`${colors.green}Created tournament: ${tournament.name}${colors.reset}`);
        createdTournaments.push(tournament);
      }
    } catch (error) {
      console.error(`${colors.red}Error creating tournament ${tournamentData.name}:${colors.reset}`, error.message);
    }
  }
  
  return createdTournaments;
}

/**
 * Creates sample matches
 */
async function createMatches(teams, tournaments) {
  console.log(`\n${colors.blue}Creating sample matches...${colors.reset}`);
  
  const thunderbolts = teams.find(t => t.name === 'Thunderbolts FC');
  const cosmos = teams.find(t => t.name === 'Cosmos United');
  
  if (!thunderbolts || !cosmos) {
    console.error(`${colors.red}Teams not found. Cannot create matches.${colors.reset}`);
    return;
  }
  
  const summerCup = tournaments.find(t => t.name === 'Summer Cup 2025');
  
  if (!summerCup) {
    console.error(`${colors.red}Tournament not found. Cannot create matches.${colors.reset}`);
    return;
  }
  
  const matches = [
    {
      homeTeamId: thunderbolts.id,
      awayTeamId: cosmos.id,
      tournamentId: summerCup.id,
      scheduledDate: '2025-06-17T14:00:00Z',
      location: 'Toronto Stadium',
      status: 'scheduled',
      homeScore: null,
      awayScore: null
    }
  ];
  
  for (const matchData of matches) {
    try {
      // Check if match already exists
      const exists = await Match.findOne({
        where: {
          homeTeamId: matchData.homeTeamId,
          awayTeamId: matchData.awayTeamId,
          scheduledDate: matchData.scheduledDate
        }
      });
      
      if (exists) {
        console.log(`${colors.yellow}Match already exists. Skipping.${colors.reset}`);
      } else {
        const match = await Match.create(matchData);
        console.log(`${colors.green}Created match: ${match.id}${colors.reset}`);
      }
    } catch (error) {
      console.error(`${colors.red}Error creating match:${colors.reset}`, error.message);
    }
  }
}

/**
 * Main function to create all sample data
 */
async function createSampleData() {
  try {
    console.log(`${colors.magenta}Creating sample data for development...${colors.reset}`);
    
    await sequelize.authenticate();
    console.log(`${colors.green}Database connection established.${colors.reset}`);
    
    const users = await createUsers();
    const teams = await createTeams(users);
    await createUserTeams(users, teams);
    const tournaments = await createTournaments(users);
    await createMatches(teams, tournaments);
    
    console.log(`\n${colors.green}✅ Sample data created successfully!${colors.reset}`);
    
    return true;
  } catch (error) {
    console.error(`${colors.red}Error creating sample data:${colors.reset}`, error);
    return false;
  } finally {
    // Close database connection
    if (sequelize) {
      await sequelize.close();
      console.log(`${colors.blue}Database connection closed.${colors.reset}`);
    }
  }
}

// Run the script if called directly
if (require.main === module) {
  createSampleData()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error(`${colors.red}Unhandled error:${colors.reset}`, error);
      process.exit(1);
    });
}

module.exports = createSampleData;

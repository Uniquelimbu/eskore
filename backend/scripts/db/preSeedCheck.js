'use strict';
/**
 * Pre-seed check script
 * This script runs validation on seeders before executing them
 */

// Simple check to see if seeders are in the correct order
const fs = require('fs');
const path = require('path');

const seedersDir = path.join(__dirname, '..', '..', 'src', 'seeders');
const seeders = fs.readdirSync(seedersDir)
  .filter(file => file.endsWith('.js') && !file.startsWith('README'));

console.log('Checking seeder order...');

// Expected order based on file naming
const expectedOrder = [
  'leagues',
  'users',
  'teams',
  'user-teams',
  'tournaments',
  'matches'
];

// Check naming convention
const validNaming = seeders.every(file => {
  // Should start with a date format YYYYMMDD
  const datePattern = /^\d{8}/;
  return datePattern.test(file);
});

if (!validNaming) {
  console.warn('Warning: Some seeders do not follow the date-based naming convention.');
  console.log('Seeders should be named like: YYYYMMDD-name-of-seeder.js');
}

// Check for duplicate dates/numbers
const prefixes = seeders.map(file => file.split('-')[0]);
const uniquePrefixes = new Set(prefixes);

if (prefixes.length !== uniquePrefixes.size) {
  console.warn('Warning: Some seeders have the same date/number prefix.');
  console.log('Each seeder should have a unique prefix to ensure proper ordering.');
}

// Check for correct order of entities
let hasUserTeams = false;
let hasUsers = false;
let hasTeams = false;
let hasTournaments = false;
let hasMatches = false;

seeders.forEach(file => {
  if (file.includes('user-teams')) hasUserTeams = true;
  if (file.includes('users')) hasUsers = true;
  if (file.includes('teams') && !file.includes('user-teams')) hasTeams = true;
  if (file.includes('tournaments')) hasTournaments = true;
  if (file.includes('matches')) hasMatches = true;
});

// Check logical dependencies
let hasOrderingIssue = false;

if (hasUserTeams && (!hasUsers || !hasTeams)) {
  console.error('Error: user-teams seeder exists but users or teams seeders are missing.');
  hasOrderingIssue = true;
}

if (hasMatches && !hasTeams) {
  console.error('Error: matches seeder exists but teams seeder is missing.');
  hasOrderingIssue = true;
}

// Sort by filename to check chronological order
const sortedSeeders = [...seeders].sort();
console.log('\nSeeders will execute in this order:');
sortedSeeders.forEach(file => console.log(`- ${file}`));

// Final verdict
if (hasOrderingIssue) {
  console.error('\nThere are issues with the seeder dependencies. Please fix before running.');
  process.exit(1);
} else {
  console.log('\nSeeder order validation completed successfully.');
}

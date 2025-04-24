'use strict';
const bcrypt = require('bcrypt');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Generate a consistent password hash for "password123"
    // Using a fixed salt for seed data to ensure consistency
    const passwordHash = await bcrypt.hash('password123', 10);
    console.log('Generated seed password hash:', passwordHash);
    
    // Check if these emails already exist to avoid unique constraint violations
    const existingAthletes = await queryInterface.sequelize.query(
      `SELECT email FROM athletes WHERE email IN ('john.doe@example.com', 'jane.smith@example.com')`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    
    const existingEmails = existingAthletes.map(athlete => athlete.email);
    console.log(`Found ${existingEmails.length} existing athletes: ${existingEmails.join(', ')}`);
    
    // Prepare athletes data with updated password hash
    const athletes = [
      {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        passwordHash: passwordHash,
        dob: '1995-05-15',
        height: 180.5,
        position: 'FW',
        country: 'Canada',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        passwordHash: passwordHash,
        dob: '1998-08-22',
        height: 165.0,
        position: 'MD',
        country: 'Nepal',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    // Filter out athletes that already exist in the database
    const newAthletes = athletes.filter(athlete => !existingEmails.includes(athlete.email));
    
    if (newAthletes.length === 0) {
      console.log('All athletes already exist in the database. Skipping insertion.');
      return Promise.resolve();
    }
    
    console.log(`Inserting ${newAthletes.length} new athletes`);
    return queryInterface.bulkInsert('athletes', newAthletes);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('athletes', null, {});
  }
};

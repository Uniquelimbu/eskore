'use strict';
const bcrypt = require('bcrypt');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Check if users already exist to avoid duplicates
      const existingUsers = await queryInterface.sequelize.query(
        'SELECT email FROM users WHERE email IN (:emails)',
        {
          replacements: { emails: ['admin@eskore.com', 'user@eskore.com'] },
          type: queryInterface.sequelize.QueryTypes.SELECT
        }
      );
      
      const existingEmails = existingUsers.map(user => user.email);
      console.log(`Found ${existingEmails.length} existing users: ${existingEmails.join(', ')}`);
      
      // Only seed users that don't already exist
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      const users = [
        {
          email: 'admin@eskore.com',
          password: hashedPassword,
          role: 'admin',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          email: 'user@eskore.com',
          password: hashedPassword,
          role: 'user',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ].filter(user => !existingEmails.includes(user.email));
      
      if (users.length === 0) {
        console.log('All users already exist. Skipping insertion.');
        return Promise.resolve();
      }
      
      console.log(`Inserting ${users.length} new users`);
      return queryInterface.bulkInsert('users', users);
    } catch (error) {
      console.error('Error seeding users:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('users', null, {});
  }
};

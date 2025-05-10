'use strict';
const bcrypt = require('bcrypt');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Check if users already exist to avoid duplicates
      const existingUsers = await queryInterface.sequelize.query(
        'SELECT email FROM users WHERE email IN (:emails)',
        {
          replacements: { emails: ['admin@eskore.com', 'user@eskore.com', 'test@eskore.com', 'coach@eskore.com', 'athlete@eskore.com'] },
          type: queryInterface.sequelize.QueryTypes.SELECT
        }
      );
      
      const existingEmails = existingUsers.map(user => user.email);
      console.log(`Found ${existingEmails.length} existing users: ${existingEmails.join(', ')}`);
      
      // Only seed users that don't already exist
      const hashedPassword = await bcrypt.hash('Password123', 10);
      
      const users = [
        {
          email: 'admin@eskore.com',
          password: hashedPassword,
          firstName: 'Admin',
          lastName: 'User',
          role: 'admin',
          status: 'active',
          lastLogin: null,
          profileImageUrl: null,
          bio: 'System administrator account',
          socialLinks: JSON.stringify({}),
          gameSpecificStats: JSON.stringify({}),
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          email: 'user@eskore.com',
          password: hashedPassword,
          firstName: 'Regular',
          lastName: 'User',
          role: 'user',
          status: 'active',
          lastLogin: null,
          profileImageUrl: null,
          bio: 'Regular user account',
          socialLinks: JSON.stringify({}),
          gameSpecificStats: JSON.stringify({}),
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          email: 'test@eskore.com',
          password: hashedPassword,
          firstName: 'Test',
          lastName: 'Account',
          role: 'user',
          status: 'active',
          lastLogin: null,
          profileImageUrl: null,
          bio: 'Test user account',
          socialLinks: JSON.stringify({}),
          gameSpecificStats: JSON.stringify({}),
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          email: 'coach@eskore.com',
          password: hashedPassword,
          firstName: 'Coach',
          lastName: 'Example',
          role: 'user',
          status: 'active',
          lastLogin: null,
          profileImageUrl: null,
          bio: 'Coach test account',
          socialLinks: JSON.stringify({}),
          gameSpecificStats: JSON.stringify({}),
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          email: 'athlete@eskore.com',
          password: hashedPassword,
          firstName: 'Athlete',
          lastName: 'Player',
          role: 'user',
          status: 'active',
          lastLogin: null,
          profileImageUrl: null,
          bio: 'Athlete test account',
          socialLinks: JSON.stringify({}),
          gameSpecificStats: JSON.stringify({}),
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

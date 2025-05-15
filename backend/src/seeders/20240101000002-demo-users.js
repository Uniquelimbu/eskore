'use strict';
const bcrypt = require('bcrypt');

/**
 * Test Users Seeder
 * 
 * This file provides consistent test users for development and testing environments.
 * Each user has a standard password: 'Password123'
 */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Use a transaction to ensure data consistency
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      // Check if users already exist to avoid duplicates
      const existingUsers = await queryInterface.sequelize.query(
        'SELECT email FROM users WHERE email IN (:emails)',
        {
          replacements: { 
            emails: ['user@eskore.com', 'test@eskore.com', 'coach@eskore.com', 'athlete@eskore.com'] 
          },
          type: queryInterface.sequelize.QueryTypes.SELECT,
          transaction
        }
      );
      
      const existingEmails = existingUsers.map(user => user.email);
      console.log(`Found ${existingEmails.length} existing users: ${existingEmails.join(', ') || 'none'}`);
      
      // Only seed users that don't already exist
      const hashedPassword = await bcrypt.hash('Password123', 10);
      const currentDate = new Date();
      
      const users = [
        {
          email: 'user@eskore.com',
          password: hashedPassword,
          firstName: 'Regular',
          lastName: 'User',
          role: 'user',
          status: 'active',
          lastLogin: null,
          profileImageUrl: null,
          bio: 'Regular user account for testing basic user functionality',
          socialLinks: JSON.stringify({
            twitter: 'https://twitter.com/eskoredemo',
            instagram: 'https://instagram.com/eskoredemo'
          }),
          gameSpecificStats: JSON.stringify({}),
          createdAt: currentDate,
          updatedAt: currentDate
        },
        {
          email: 'test@eskore.com',
          password: hashedPassword,
          firstName: 'Test',
          lastName: 'Account',
          role: 'user',
          status: 'active',
          lastLogin: new Date(currentDate.getTime() - 86400000), // yesterday
          profileImageUrl: 'https://i.pravatar.cc/150?u=test',
          bio: 'Test user account with complete profile for UI testing',
          socialLinks: JSON.stringify({
            twitter: 'https://twitter.com/eskoretest',
            twitch: 'https://twitch.tv/eskoretest'
          }),
          gameSpecificStats: JSON.stringify({
            valorant: {
              rank: 'Diamond',
              kd: 1.5,
              winRate: 0.55
            }
          }),
          createdAt: currentDate,
          updatedAt: currentDate
        },
        {
          email: 'coach@eskore.com',
          password: hashedPassword,
          firstName: 'Coach',
          lastName: 'Example',
          role: 'user',
          status: 'active',
          lastLogin: null,
          profileImageUrl: 'https://i.pravatar.cc/150?u=coach',
          bio: 'Coach test account for testing team management features',
          socialLinks: JSON.stringify({}),
          gameSpecificStats: JSON.stringify({}),
          createdAt: currentDate,
          updatedAt: currentDate
        },
        {
          email: 'athlete@eskore.com',
          password: hashedPassword,
          firstName: 'Athlete',
          lastName: 'Player',
          role: 'user',
          status: 'active',
          lastLogin: null,
          profileImageUrl: 'https://i.pravatar.cc/150?u=athlete',
          bio: 'Athlete test account for performance tracking features',
          socialLinks: JSON.stringify({
            twitch: 'https://twitch.tv/eskoreathlete'
          }),
          gameSpecificStats: JSON.stringify({
            csgo: {
              rank: 'Gold Nova',
              kd: 1.2,
              accuracy: 0.68
            },
            leagueOfLegends: {
              rank: 'Platinum',
              winRate: 0.52,
              mainRole: 'Mid'
            }
          }),
          createdAt: currentDate,
          updatedAt: currentDate
        }
      ].filter(user => !existingEmails.includes(user.email));
      
      if (users.length === 0) {
        console.log('All users already exist. Skipping insertion.');
        await transaction.commit();
        return Promise.resolve();
      }
      
      console.log(`Inserting ${users.length} new test users`);
      await queryInterface.bulkInsert('users', users, { transaction });
      
      // Commit the transaction
      await transaction.commit();
      console.log('Test users seeded successfully');
      return Promise.resolve();
      
    } catch (error) {
      // Rollback transaction on error
      await transaction.rollback();
      console.error('Error seeding test users:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Only delete the specific test users we created, not all users
    return queryInterface.bulkDelete('users', {
      email: {
        [Sequelize.Op.in]: ['user@eskore.com', 'test@eskore.com', 'coach@eskore.com', 'athlete@eskore.com']
      }
    }, {});
  }
};

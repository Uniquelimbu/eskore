'use strict';
const bcrypt = require('bcrypt');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if user already exists
    const existing = await queryInterface.sequelize.query(
      'SELECT email FROM users WHERE email = :email',
      {
        replacements: { email: 'test@eskore.com' },
        type: queryInterface.sequelize.QueryTypes.SELECT
      }
    );
    if (existing.length > 0) {
      console.log('Test user already exists. Skipping insertion.');
      return Promise.resolve();
    }

    const passwordHash = await bcrypt.hash('Password123', 10);
    await queryInterface.bulkInsert('users', [{
      email: 'test@eskore.com',
      password: passwordHash,
      role: 'user',
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('users', { email: 'test@eskore.com' }, {});
  }
};

'use strict';
const bcrypt = require('bcrypt');

module.exports = {
  up: async (queryInterface, Sequelize) => {
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

'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Your implementation here
      
      return Promise.resolve();
    } catch (error) {
      console.error('Error in seeder:', error);
      return Promise.reject(error);
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Your implementation here
    return Promise.resolve();
  }
};
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Option 1: Remove admin role entirely
    await queryInterface.sequelize.query(
      `DELETE FROM roles WHERE name = 'admin'`
    );
    
    // Option 2 (alternative): Rename admin role to something else
    // await queryInterface.sequelize.query(
    //   `UPDATE roles SET name = 'system_manager', description = 'Can manage system settings' WHERE name = 'admin'`
    // );
  },

  down: async (queryInterface, Sequelize) => {
    // If we deleted the admin role, re-create it
    await queryInterface.sequelize.query(
      `INSERT INTO roles (name, description, "createdAt", "updatedAt")
       VALUES ('admin', 'Has all system permissions', NOW(), NOW())`
    );
    
    // If we renamed it, rename it back
    // await queryInterface.sequelize.query(
    //   `UPDATE roles SET name = 'admin', description = 'Has all system permissions' WHERE name = 'system_manager'`
    // );
  }
};

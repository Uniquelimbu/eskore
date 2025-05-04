'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create roles table
    await queryInterface.createTable('roles', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      description: {
        type: Sequelize.STRING,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Create user_roles junction table
    await queryInterface.createTable('user_roles', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      roleId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'roles',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Add index for faster lookup
    await queryInterface.addIndex('user_roles', ['userId', 'roleId'], {
      unique: true,
      name: 'user_role_unique'
    });

    // Seed default roles
    await queryInterface.bulkInsert('roles', [
      {
        name: 'user',
        description: 'Regular user with basic permissions',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'athlete',
        description: 'Can participate in tournaments as a player',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'manager',
        description: 'Can manage teams and their rosters',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'organizer',
        description: 'Can create and manage tournaments',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'admin',
        description: 'Has all system permissions',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('user_roles');
    await queryInterface.dropTable('roles');
  }
};

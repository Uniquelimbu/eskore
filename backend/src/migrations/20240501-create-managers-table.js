'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('managers', {
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
      teamId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'teams',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      playingStyle: {
        type: Sequelize.ENUM(
          'possession', 
          'counter-attack', 
          'high-press', 
          'defensive', 
          'balanced'
        ),
        allowNull: true
      },
      preferredFormation: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      experience: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Experience in years'
      },
      profileImageUrl: {
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

    // Add index on userId for faster lookups
    await queryInterface.addIndex('managers', ['userId'], {
      unique: true,
      name: 'managers_userId_unique'
    });
    
    // Add index on teamId for faster lookups
    await queryInterface.addIndex('managers', ['teamId'], {
      name: 'managers_teamId'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('managers');
  }
};

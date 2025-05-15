'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Handle based on dialect to make this cross-database compatible
    const dialect = queryInterface.sequelize.getDialect();
    
    if (dialect === 'postgres') {
      // PostgreSQL-specific approach with enum type
      const transaction = await queryInterface.sequelize.transaction();
    
      try {
        // Create the new enum type
        await queryInterface.sequelize.query(`
          CREATE TYPE "enum_user_teams_role_new" AS ENUM('manager', 'assistant_manager', 'coach', 'athlete', 'owner');
        `, { transaction });
        
        // Add a temporary column with the new enum type
        await queryInterface.sequelize.query(`
          ALTER TABLE user_teams 
          ADD COLUMN "role_new" "enum_user_teams_role_new";
        `, { transaction });
        
        // Migrate data with explicit mapping
        await queryInterface.sequelize.query(`
          UPDATE user_teams 
          SET "role_new" = CASE 
            WHEN role = 'owner' THEN 'owner'::enum_user_teams_role_new
            WHEN role = 'manager' THEN 'manager'::enum_user_teams_role_new
            WHEN role = 'coach' THEN 'coach'::enum_user_teams_role_new
            WHEN role = 'athlete' THEN 'athlete'::enum_user_teams_role_new
            ELSE 'athlete'::enum_user_teams_role_new
          END;
        `, { transaction });
        
        // Drop the old column
        await queryInterface.sequelize.query(`
          ALTER TABLE user_teams DROP COLUMN "role";
        `, { transaction });
        
        // Rename the new column to the original name
        await queryInterface.sequelize.query(`
          ALTER TABLE user_teams RENAME COLUMN "role_new" TO "role";
        `, { transaction });
        
        // Drop the old enum type
        await queryInterface.sequelize.query(`
          DROP TYPE "enum_user_teams_role";
        `, { transaction });
        
        // Rename the new enum type to the standard name
        await queryInterface.sequelize.query(`
          ALTER TYPE "enum_user_teams_role_new" RENAME TO "enum_user_teams_role";
        `, { transaction });
        
        // Add NOT NULL constraint back to the role column
        await queryInterface.sequelize.query(`
          ALTER TABLE user_teams ALTER COLUMN "role" SET NOT NULL;
        `, { transaction });
        
        // Set default value
        await queryInterface.sequelize.query(`
          ALTER TABLE user_teams ALTER COLUMN "role" SET DEFAULT 'athlete'::enum_user_teams_role;
        `, { transaction });
        
        await transaction.commit();
        
        console.log('Successfully migrated user_teams roles to the new format');
        return Promise.resolve();
      } catch (error) {
        await transaction.rollback();
        console.error('Error during migration:', error);
        return Promise.reject(error);
      }
    } else {
      // Generic approach for MySQL, SQLite, etc.
      try {
        // Create a new temporary table with the new enum values
        await queryInterface.createTable('user_teams_new', {
          id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
          },
          userId: {
            type: Sequelize.INTEGER,
            allowNull: false
          },
          teamId: {
            type: Sequelize.INTEGER,
            allowNull: false
          },
          role: {
            type: Sequelize.ENUM('manager', 'assistant_manager', 'coach', 'athlete', 'owner'),
            allowNull: false,
            defaultValue: 'athlete'
          },
          status: {
            type: Sequelize.STRING,
            allowNull: true
          },
          joinedAt: {
            type: Sequelize.DATE,
            allowNull: true
          },
          createdAt: {
            type: Sequelize.DATE,
            allowNull: false
          },
          updatedAt: {
            type: Sequelize.DATE,
            allowNull: false
          }
        });
        
        // Copy data with mapped values
        await queryInterface.sequelize.query(`
          INSERT INTO user_teams_new (id, userId, teamId, role, status, joinedAt, createdAt, updatedAt)
          SELECT id, userId, teamId, 
            CASE 
              WHEN role = 'owner' THEN 'owner'
              WHEN role = 'manager' THEN 'manager'
              WHEN role = 'coach' THEN 'coach'
              ELSE 'athlete'
            END,
            status, joinedAt, createdAt, updatedAt
          FROM user_teams
        `);
        
        // Drop old table and rename new one
        await queryInterface.dropTable('user_teams');
        await queryInterface.renameTable('user_teams_new', 'user_teams');
        
        // Add indices back
        await queryInterface.addIndex('user_teams', ['userId', 'teamId']);
      } catch (error) {
        console.error('Error during non-PostgreSQL migration:', error);
        throw error;
      }
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      // Create the old enum type again
      await queryInterface.sequelize.query(`
        CREATE TYPE "enum_user_teams_role_old" AS ENUM('owner', 'manager', 'athlete', 'coach');
      `, { transaction });
      
      // Add a temporary column with the old enum type
      await queryInterface.sequelize.query(`
        ALTER TABLE user_teams 
        ADD COLUMN "role_old" "enum_user_teams_role_old";
      `, { transaction });
      
      // Migrate data back with explicit mapping
      await queryInterface.sequelize.query(`
        UPDATE user_teams 
        SET "role_old" = CASE 
          WHEN role = 'owner' THEN 'owner'::enum_user_teams_role_old
          WHEN role = 'manager' THEN 'manager'::enum_user_teams_role_old
          WHEN role = 'assistant_manager' THEN 'manager'::enum_user_teams_role_old
          WHEN role = 'coach' THEN 'coach'::enum_user_teams_role_old
          WHEN role = 'athlete' THEN 'athlete'::enum_user_teams_role_old
          ELSE 'athlete'::enum_user_teams_role_old
        END;
      `, { transaction });
      
      // Drop the new column
      await queryInterface.sequelize.query(`
        ALTER TABLE user_teams DROP COLUMN "role";
      `, { transaction });
      
      // Rename the old column back to the original name
      await queryInterface.sequelize.query(`
        ALTER TABLE user_teams RENAME COLUMN "role_old" TO "role";
      `, { transaction });
      
      // Drop the new enum type
      await queryInterface.sequelize.query(`
        DROP TYPE "enum_user_teams_role";
      `, { transaction });
      
      // Rename old enum type to standard name
      await queryInterface.sequelize.query(`
        ALTER TYPE "enum_user_teams_role_old" RENAME TO "enum_user_teams_role";
      `, { transaction });
      
      // Add NOT NULL constraint back to the role column
      await queryInterface.sequelize.query(`
        ALTER TABLE user_teams ALTER COLUMN "role" SET NOT NULL;
      `, { transaction });
      
      // Set default value
      await queryInterface.sequelize.query(`
        ALTER TABLE user_teams ALTER COLUMN "role" SET DEFAULT 'athlete'::enum_user_teams_role;
      `, { transaction });
      
      await transaction.commit();
      
      console.log('Successfully rolled back user_teams roles to the original format');
      return Promise.resolve();
    } catch (error) {
      await transaction.rollback();
      console.error('Error during rollback:', error);
      return Promise.reject(error);
    }
  }
};

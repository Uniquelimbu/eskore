'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Use a transaction for safety
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

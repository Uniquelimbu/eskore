module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Create new enum without 'owner'
    await queryInterface.sequelize.transaction(async (transaction) => {
      // First, remove default constraint
      await queryInterface.sequelize.query(`
        ALTER TABLE "user_teams" ALTER COLUMN "role" DROP DEFAULT;
      `, { transaction });

      // Create new enum type
      await queryInterface.sequelize.query(`
        CREATE TYPE "enum_user_teams_role_new" AS ENUM ('manager', 'assistant_manager', 'coach', 'athlete');
      `, { transaction });

      // 2. Alter column to use new enum, convert 'owner' to 'manager'
      await queryInterface.sequelize.query(`
        ALTER TABLE "user_teams"
        ALTER COLUMN "role" TYPE "enum_user_teams_role_new"
        USING (CASE WHEN "role"::text = 'owner' THEN 'manager'::text ELSE "role"::text END)::"enum_user_teams_role_new";
      `, { transaction });

      // Set the default value again
      await queryInterface.sequelize.query(`
        ALTER TABLE "user_teams" ALTER COLUMN "role" SET DEFAULT 'athlete'::enum_user_teams_role_new;
      `, { transaction });

      // 3. Drop old enum type
      await queryInterface.sequelize.query(`
        DROP TYPE "enum_user_teams_role";
      `, { transaction });

      // 4. Rename new enum to old name for consistency
      await queryInterface.sequelize.query(`
        ALTER TYPE "enum_user_teams_role_new" RENAME TO "enum_user_teams_role";
      `, { transaction });
    });
  },
  down: async (queryInterface, Sequelize) => {
    // Re-add 'owner' value (rollback)
    await queryInterface.sequelize.transaction(async (transaction) => {
      // First, remove default constraint
      await queryInterface.sequelize.query(`
        ALTER TABLE "user_teams" ALTER COLUMN "role" DROP DEFAULT;
      `, { transaction });

      // Create enum with owner
      await queryInterface.sequelize.query(`
        CREATE TYPE "enum_user_teams_role_new" AS ENUM ('manager', 'assistant_manager', 'coach', 'athlete', 'owner');
      `, { transaction });

      // Alter column to use new enum
      await queryInterface.sequelize.query(`
        ALTER TABLE "user_teams"
        ALTER COLUMN "role" TYPE "enum_user_teams_role_new"
        USING role::text::"enum_user_teams_role_new";
      `, { transaction });

      // Set the default value again
      await queryInterface.sequelize.query(`
        ALTER TABLE "user_teams" ALTER COLUMN "role" SET DEFAULT 'athlete'::enum_user_teams_role_new;
      `, { transaction });

      // Drop old enum type
      await queryInterface.sequelize.query(`
        DROP TYPE "enum_user_teams_role";
      `, { transaction });

      // Rename new enum to old name for consistency
      await queryInterface.sequelize.query(`
        ALTER TYPE "enum_user_teams_role_new" RENAME TO "enum_user_teams_role";
      `, { transaction });
    });
  }
};
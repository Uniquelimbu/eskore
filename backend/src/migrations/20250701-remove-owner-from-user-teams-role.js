module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Create new enum without 'owner'
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.sequelize.query(`
        CREATE TYPE "enum_user_teams_role_new" AS ENUM ('manager', 'assistant_manager', 'coach', 'athlete');
      `, { transaction });

      // 2. Alter column to use new enum
      await queryInterface.sequelize.query(`
        ALTER TABLE "user_teams"
        ALTER COLUMN "role" TYPE "enum_user_teams_role_new"
        USING role::text::"enum_user_teams_role_new";
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
      // Create enum with owner
      await queryInterface.sequelize.query(`
        CREATE TYPE "enum_user_teams_role_new" AS ENUM ('manager', 'assistant_manager', 'coach', 'athlete', 'owner');
      `, { transaction });

      await queryInterface.sequelize.query(`
        ALTER TABLE "user_teams"
        ALTER COLUMN "role" TYPE "enum_user_teams_role_new"
        USING role::text::"enum_user_teams_role_new";
      `, { transaction });

      await queryInterface.sequelize.query(`
        DROP TYPE "enum_user_teams_role";
      `, { transaction });

      await queryInterface.sequelize.query(`
        ALTER TYPE "enum_user_teams_role_new" RENAME TO "enum_user_teams_role";
      `, { transaction });
    });
  }
}; 
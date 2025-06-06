'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const t = await queryInterface.sequelize.transaction();
    
    try {
      // First, convert any existing 'coach' roles to 'athlete'
      await queryInterface.sequelize.query(
        `UPDATE user_teams SET role = 'athlete' WHERE role = 'coach';`,
        { transaction: t }
      );

      // Remove the default value temporarily
      await queryInterface.sequelize.query(
        `ALTER TABLE user_teams ALTER COLUMN role DROP DEFAULT;`,
        { transaction: t }
      );

      // Create new enum without 'coach'
      await queryInterface.sequelize.query(
        `CREATE TYPE "enum_user_teams_role_new" AS ENUM('manager', 'assistant_manager', 'athlete');`,
        { transaction: t }
      );

      // Update the column to use the new enum
      await queryInterface.sequelize.query(
        `ALTER TABLE user_teams ALTER COLUMN role TYPE "enum_user_teams_role_new" USING role::text::"enum_user_teams_role_new";`,
        { transaction: t }
      );

      // Drop the old enum
      await queryInterface.sequelize.query(
        `DROP TYPE "enum_user_teams_role";`,
        { transaction: t }
      );

      // Rename the new enum to the original name
      await queryInterface.sequelize.query(
        `ALTER TYPE "enum_user_teams_role_new" RENAME TO "enum_user_teams_role";`,
        { transaction: t }
      );

      // Restore the default value
      await queryInterface.sequelize.query(
        `ALTER TABLE user_teams ALTER COLUMN role SET DEFAULT 'athlete';`,
        { transaction: t }
      );

      await t.commit();
    } catch (error) {
      await t.rollback();
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    const t = await queryInterface.sequelize.transaction();
    
    try {
      // Remove the default value temporarily
      await queryInterface.sequelize.query(
        `ALTER TABLE user_teams ALTER COLUMN role DROP DEFAULT;`,
        { transaction: t }
      );

      // Create enum with 'coach' back
      await queryInterface.sequelize.query(
        `CREATE TYPE "enum_user_teams_role_new" AS ENUM('manager', 'assistant_manager', 'athlete', 'coach');`,
        { transaction: t }
      );

      // Update the column to use the new enum
      await queryInterface.sequelize.query(
        `ALTER TABLE user_teams ALTER COLUMN role TYPE "enum_user_teams_role_new" USING role::text::"enum_user_teams_role_new";`,
        { transaction: t }
      );

      // Drop the old enum
      await queryInterface.sequelize.query(
        `DROP TYPE "enum_user_teams_role";`,
        { transaction: t }
      );

      // Rename the new enum to the original name
      await queryInterface.sequelize.query(
        `ALTER TYPE "enum_user_teams_role_new" RENAME TO "enum_user_teams_role";`,
        { transaction: t }
      );

      // Restore the default value
      await queryInterface.sequelize.query(
        `ALTER TABLE user_teams ALTER COLUMN role SET DEFAULT 'athlete';`,
        { transaction: t }
      );

      await t.commit();
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }
}; 
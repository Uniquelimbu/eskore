/**
 * Helper script to create properly named migrations
 * Usage: node createMigration.js "create-users-table"
 */

const { execSync } = require('child_process');
const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
const migrationName = process.argv[2];

if (!migrationName) {
  console.error('❌ Error: Migration name is required');
  console.log('Usage: node createMigration.js "create-users-table"');
  process.exit(1);
}

try {
  console.log(`Creating migration: ${timestamp}-${migrationName}`);
  execSync(`npx sequelize-cli migration:generate --name ${timestamp}-${migrationName}`);
  console.log('✅ Migration created successfully!');
} catch (error) {
  console.error('❌ Failed to create migration:', error.message);
}

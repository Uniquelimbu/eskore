const { Sequelize } = require('sequelize');
require('dotenv').config();

// Use your actual database connection details from your .env file
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    logging: console.log
  }
);

async function removeMigration() {
  try {
    await sequelize.authenticate();
    console.log('Connection established successfully.');
    
    const result = await sequelize.query(
      'DELETE FROM "SequelizeMeta" WHERE name = \'20240620-update-team-roles.js\''
    );
    
    console.log('Migration removed from tracking table:', result);
    console.log('You can now run the new migration safely.');
  } catch (error) {
    console.error('Error removing migration:', error);
  } finally {
    await sequelize.close();
  }
}

removeMigration();

const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/db');

class Formation extends Model {}

Formation.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    teamId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'teams',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    schema_json: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {}
    }
  },
  {
    sequelize,
    modelName: 'Formation',
    tableName: 'formations',
    timestamps: true
  }
);

// Add association setup
module.exports = Formation;

// Define associations after export to avoid circular dependencies
// This will be executed when models are initialized in the db.js file
Formation.associate = (models) => {
  // Formation belongs to one Team
  Formation.belongsTo(models.Team, { 
    foreignKey: 'teamId', 
    as: 'associatedTeam' // Using a clearly unique alias
  });
};

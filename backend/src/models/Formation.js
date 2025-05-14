const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const log = require('../utils/log');

const Formation = sequelize.define('Formation', {
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
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  schema_json: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {}
  }
}, {
  tableName: 'formations',
  timestamps: true
});

// Add a class method to create default 4-3-3 formation
Formation.createDefaultFormation = async (teamId) => {
  if (!teamId) {
    log.error('Formation.createDefaultFormation called without teamId');
    throw new Error('TeamId is required to create a default formation');
  }

  log.info(`Creating default 4-3-3 formation for team ID: ${teamId}`);
  
  const defaultFormation = {
    preset: '4-3-3',
    starters: [
      { id: 'gk', label: 'GK', xNorm: 50, yNorm: 90, position: 'GK', jerseyNumber: '1', playerName: 'Player 1', positionId: 'gk' },
      { id: 'lb', label: 'LB', xNorm: 20, yNorm: 70, position: 'LB', jerseyNumber: '2', playerName: 'Player 2', positionId: 'lb' },
      { id: 'cb1', label: 'CB', xNorm: 40, yNorm: 70, position: 'CB', jerseyNumber: '3', playerName: 'Player 3', positionId: 'cb1' },
      { id: 'cb2', label: 'CB', xNorm: 60, yNorm: 70, position: 'CB', jerseyNumber: '4', playerName: 'Player 4', positionId: 'cb2' },
      { id: 'rb', label: 'RB', xNorm: 80, yNorm: 70, position: 'RB', jerseyNumber: '5', playerName: 'Player 5', positionId: 'rb' },
      { id: 'cdm', label: 'CDM', xNorm: 50, yNorm: 50, position: 'CDM', jerseyNumber: '6', playerName: 'Player 6', positionId: 'cdm' },
      { id: 'cm1', label: 'CM', xNorm: 35, yNorm: 40, position: 'CM', jerseyNumber: '7', playerName: 'Player 7', positionId: 'cm1' },
      { id: 'cm2', label: 'CM', xNorm: 65, yNorm: 40, position: 'CM', jerseyNumber: '8', playerName: 'Player 8', positionId: 'cm2' },
      { id: 'lw', label: 'LW', xNorm: 20, yNorm: 25, position: 'LW', jerseyNumber: '9', playerName: 'Player 9', positionId: 'lw' },
      { id: 'st', label: 'ST', xNorm: 50, yNorm: 20, position: 'ST', jerseyNumber: '10', playerName: 'Player 10', positionId: 'st' },
      { id: 'rw', label: 'RW', xNorm: 80, yNorm: 25, position: 'RW', jerseyNumber: '11', playerName: 'Player 11', positionId: 'rw' }
    ],
    subs: [
      { id: 'dummy-12', label: 'SUB', position: 'ST', jerseyNumber: '12', playerName: 'Player 12' },
      { id: 'dummy-13', label: 'SUB', position: 'CAM', jerseyNumber: '13', playerName: 'Player 13' },
      { id: 'dummy-14', label: 'SUB', position: 'LM', jerseyNumber: '14', playerName: 'Player 14' },
      { id: 'dummy-15', label: 'SUB', position: 'CDM', jerseyNumber: '15', playerName: 'Player 15' },
      { id: 'dummy-16', label: 'SUB', position: 'RB', jerseyNumber: '16', playerName: 'Player 16' },
      { id: 'dummy-17', label: 'SUB', position: 'CB', jerseyNumber: '17', playerName: 'Player 17' },
      { id: 'dummy-18', label: 'SUB', position: 'GK', jerseyNumber: '18', playerName: 'Player 18' }
    ],
    updated_at: new Date().toISOString()
  };
  
  try {
    const newFormation = await Formation.create({
      teamId,
      schema_json: defaultFormation
    });
    log.info(`Successfully created default formation for team ${teamId}`);
    return newFormation;
  } catch (error) {
    log.error(`Failed to create default formation for team ${teamId}:`, error);
    throw error;
  }
};

// Log that the Formation model is defined
log.info('Formation model defined');

module.exports = Formation;

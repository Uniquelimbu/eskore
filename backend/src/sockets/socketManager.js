/**
 * Socket.IO event handlers and management
 */
const { computeStandingsForLeague } = require('../helpers/computeStandings');
const logger = require('../utils/logger');

class SocketManager {
  constructor(io) {
    this.io = io;
    this.setup();
  }

  setup() {
    this.io.on('connection', (socket) => {
      logger.info(`New client connected: ${socket.id}`);
      
      // Join specific rooms based on client needs
      socket.on('joinLeague', (leagueId) => {
        socket.join(`league:${leagueId}`);
        logger.debug(`Client ${socket.id} joined league:${leagueId}`);
      });
      
      socket.on('joinMatch', (matchId) => {
        socket.join(`match:${matchId}`);
        logger.debug(`Client ${socket.id} joined match:${matchId}`);
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        logger.info(`Client disconnected: ${socket.id}`);
      });

      // Handle errors
      socket.on('error', (error) => {
        logger.error(`Socket error for client ${socket.id}:`, error);
      });
    });
  }

  // Broadcast match update to all interested clients
  broadcastMatchUpdate(match) {
    // Send to all clients watching this specific match
    this.io.to(`match:${match.id}`).emit('matchUpdated', match);
    
    // Also send to clients watching this league
    this.io.to(`league:${match.leagueId}`).emit('matchUpdated', match);
    
    logger.info(`Match update broadcast - Match ID: ${match.id}, Status: ${match.status}`);
    
    // For major changes like match completion, update standings
    if (match.status === 'finished') {
      this.updateStandings(match.leagueId);
    }
  }

  // Update and broadcast standings for a league
  async updateStandings(leagueId) {
    try {
      const standings = await computeStandingsForLeague(leagueId);
      this.io.to(`league:${leagueId}`).emit('standingsUpdated', {
        leagueId,
        standings
      });
      logger.info(`Standings updated for league: ${leagueId}`);
    } catch (error) {
      logger.error(`Error updating standings for league ${leagueId}:`, error);
    }
  }
}

module.exports = SocketManager;

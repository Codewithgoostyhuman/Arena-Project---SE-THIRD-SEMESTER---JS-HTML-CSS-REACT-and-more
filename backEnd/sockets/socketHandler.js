// backEnd/sockets/socketHandler.js
import { Server } from 'socket.io';
import matchGameService from '../services/matchService.js';
import Match from '../schemas/MatchSchema.js';
import User from '../schemas/UserSchema.js';
import Tournament from '../schemas/TournamentSchema.js';

// Store active connections
const activeUsers = new Map(); // userId -> socketId
const userSockets = new Map(); // socketId -> userId

export const initializeSocketIO = (server) => {
  const io = new Server(server, {
    cors: {
      origin: [
        process.env.CLIENT_URL || "http://localhost:5173",
        "http://localhost:5173",
        "http://127.0.0.1:5173"
      ],
      methods: ["GET", "POST"],
      credentials: true
    },
    pingTimeout: 60000,
    pingInterval: 25000
  });

  io.on('connection', (socket) => {
    console.log('🔌 New socket connection:', socket.id);
    
    // ============================================
    // USER AUTHENTICATION & CONNECTION
    // ============================================
    
    socket.on('authenticate', async (userId) => {
      try {
        userSockets.set(socket.id, userId);
        activeUsers.set(userId.toString(), socket.id);
        
        socket.userId = userId;
        
        console.log(`✅ User authenticated: ${userId} (${socket.id})`);
        
        socket.emit('authenticated', { 
          success: true, 
          userId,
          socketId: socket.id 
        });
        
      } catch (error) {
        console.error('Authentication error:', error);
        socket.emit('error', { message: 'Authentication failed' });
      }
    });
    
    // ============================================
    // MATCH ROOM MANAGEMENT
    // ============================================
    
    socket.on('join-match', async (matchId) => {
      try {
        console.log(`👤 User ${socket.userId} joining match ${matchId}`);
        
        // Validate match exists
        const match = await Match.findById(matchId)
          .populate('players', 'name')
          .populate('game');
        
        if (!match) {
          socket.emit('error', { message: 'Match not found' });
          return;
        }
        
        // Join the room
        socket.join(`match-${matchId}`);
        socket.currentMatch = matchId;
        
        // Get current match state
        const state = await matchGameService.getMatchState(matchId);
        
        // Send state to joining user
        socket.emit('match-state', state);
        
        // Count players in room
        const room = io.sockets.adapter.rooms.get(`match-${matchId}`);
        const playerCount = room ? room.size : 0;
        
        // Notify others in the room
        socket.to(`match-${matchId}`).emit('player-joined', {
          socketId: socket.id,
          userId: socket.userId,
          playerCount
        });
        
        console.log(`✅ User joined match ${matchId}. Players in room: ${playerCount}`);
        
      } catch (error) {
        console.error('Error joining match:', error);
        socket.emit('error', { message: error.message });
      }
    });
    
    socket.on('leave-match', (matchId) => {
      try {
        socket.leave(`match-${matchId}`);
        socket.currentMatch = null;
        
        const room = io.sockets.adapter.rooms.get(`match-${matchId}`);
        const playerCount = room ? room.size : 0;
        
        socket.to(`match-${matchId}`).emit('player-left', {
          socketId: socket.id,
          userId: socket.userId,
          playerCount
        });
        
        console.log(`👋 User left match ${matchId}`);
        
      } catch (error) {
        console.error('Error leaving match:', error);
      }
    });
    
    // ============================================
    // GAME MOVES
    // ============================================
    
    socket.on('make-move', async ({ matchId, playerId, move }) => {
      try {
        console.log(`🎮 Move received - Match: ${matchId}, Player: ${playerId}`, move);
        
        // Process the move
        const result = await matchGameService.processMove(matchId, playerId, move);
        
        // Broadcast move to everyone in the match
        io.to(`match-${matchId}`).emit('move-made', {
          playerId,
          move,
          gameState: result.match.currentGameState,
          nextPlayer: result.match.currentTurn,
          score: result.match.score,
          status: result.match.status,
          winner: result.match.winner,
          moveResult: result.moveResult,
          timestamp: new Date()
        });
        
        console.log(`✅ Move processed. Game over: ${result.moveResult.gameOver}`);
        
        // If match ended, broadcast to tournament room
        if (result.match.status === 'finished' && result.match.tournament) {
          io.to(`tournament-${result.match.tournament}`).emit('match-completed', {
            matchId: result.match._id,
            winner: result.match.winner,
            loser: result.match.loser,
            round: result.match.round,
            matchNumber: result.match.matchNumber,
            timestamp: new Date()
          });
          
          console.log(`🏆 Match completed. Winner: ${result.match.winner}`);
        }
        
      } catch (error) {
        console.error('Error processing move:', error);
        socket.emit('move-error', { 
          message: error.message,
          matchId,
          playerId
        });
      }
    });
    
    // ============================================
    // PLAYER STATUS
    // ============================================
    
    socket.on('player-ready', async ({ matchId, playerId }) => {
      try {
        console.log(`✋ Player ready - Match: ${matchId}, Player: ${playerId}`);
        
        socket.to(`match-${matchId}`).emit('player-ready', { 
          playerId,
          timestamp: new Date()
        });
        
      } catch (error) {
        console.error('Error player ready:', error);
        socket.emit('error', { message: error.message });
      }
    });
    
    socket.on('player-not-ready', async ({ matchId, playerId }) => {
      try {
        socket.to(`match-${matchId}`).emit('player-not-ready', { 
          playerId,
          timestamp: new Date()
        });
        
      } catch (error) {
        console.error('Error player not ready:', error);
      }
    });
    
    // ============================================
    // MATCH CHAT
    // ============================================
    
    socket.on('match-chat', async ({ matchId, playerId, message }) => {
      try {
        // Get player name
        const user = await User.findById(playerId).select('name');
        
        io.to(`match-${matchId}`).emit('match-chat', {
          playerId,
          playerName: user?.name || 'Unknown',
          message,
          timestamp: new Date()
        });
        
      } catch (error) {
        console.error('Error sending chat:', error);
      }
    });
    
    // ============================================
    // TOURNAMENT ROOM MANAGEMENT
    // ============================================
    
    socket.on('join-tournament', async (tournamentId) => {
      try {
        console.log(`🏆 User ${socket.userId} joining tournament ${tournamentId}`);
        
        socket.join(`tournament-${tournamentId}`);
        socket.currentTournament = tournamentId;
        
        // Get tournament bracket
        const tournament = await Tournament.findById(tournamentId)
          .populate('players', 'name')
          .populate('winners', 'name');
        
        socket.emit('tournament-state', {
          tournament,
          timestamp: new Date()
        });
        
        socket.to(`tournament-${tournamentId}`).emit('spectator-joined', {
          userId: socket.userId,
          socketId: socket.id
        });
        
        console.log(`✅ User joined tournament ${tournamentId}`);
        
      } catch (error) {
        console.error('Error joining tournament:', error);
        socket.emit('error', { message: error.message });
      }
    });
    
    socket.on('leave-tournament', (tournamentId) => {
      try {
        socket.leave(`tournament-${tournamentId}`);
        socket.currentTournament = null;
        
        socket.to(`tournament-${tournamentId}`).emit('spectator-left', {
          userId: socket.userId,
          socketId: socket.id
        });
        
        console.log(`👋 User left tournament ${tournamentId}`);
        
      } catch (error) {
        console.error('Error leaving tournament:', error);
      }
    });
    
    // ============================================
    // SPECTATING
    // ============================================
    
    socket.on('start-spectating', async ({ matchId }) => {
      try {
        socket.join(`match-${matchId}`);
        socket.isSpectator = true;
        
        const state = await matchGameService.getMatchState(matchId);
        socket.emit('match-state', state);
        
        socket.to(`match-${matchId}`).emit('spectator-joined', {
          socketId: socket.id,
          userId: socket.userId
        });
        
        console.log(`👁️ User spectating match ${matchId}`);
        
      } catch (error) {
        console.error('Error spectating:', error);
        socket.emit('error', { message: error.message });
      }
    });
    
    socket.on('stop-spectating', ({ matchId }) => {
      try {
        socket.leave(`match-${matchId}`);
        socket.isSpectator = false;
        
        socket.to(`match-${matchId}`).emit('spectator-left', {
          socketId: socket.id,
          userId: socket.userId
        });
        
        console.log(`👁️ User stopped spectating match ${matchId}`);
        
      } catch (error) {
        console.error('Error stop spectating:', error);
      }
    });
    
    // ============================================
    // TYPING INDICATORS (for chat)
    // ============================================
    
    socket.on('typing', ({ matchId }) => {
      socket.to(`match-${matchId}`).emit('user-typing', {
        userId: socket.userId
      });
    });
    
    socket.on('stop-typing', ({ matchId }) => {
      socket.to(`match-${matchId}`).emit('user-stop-typing', {
        userId: socket.userId
      });
    });
    
    // ============================================
    // NOTIFICATIONS
    // ============================================
    
    socket.on('subscribe-notifications', (userId) => {
      socket.join(`user-${userId}`);
      console.log(`🔔 User ${userId} subscribed to notifications`);
    });
    
    socket.on('unsubscribe-notifications', (userId) => {
      socket.leave(`user-${userId}`);
      console.log(`🔕 User ${userId} unsubscribed from notifications`);
    });
    
    // ============================================
    // HEARTBEAT / PING
    // ============================================
    
    socket.on('ping', () => {
      socket.emit('pong', { timestamp: new Date() });
    });
    
    // ============================================
    // DISCONNECT
    // ============================================
    
    socket.on('disconnect', () => {
      console.log('🔌 Socket disconnected:', socket.id);
      
      const userId = userSockets.get(socket.id);
      
      if (userId) {
        activeUsers.delete(userId.toString());
        userSockets.delete(socket.id);
        
        // Notify rooms
        if (socket.currentMatch) {
          socket.to(`match-${socket.currentMatch}`).emit('player-disconnected', {
            userId,
            socketId: socket.id
          });
        }
        
        if (socket.currentTournament) {
          socket.to(`tournament-${socket.currentTournament}`).emit('spectator-disconnected', {
            userId,
            socketId: socket.id
          });
        }
      }
    });
    
    // ============================================
    // ERROR HANDLING
    // ============================================
    
    socket.on('error', (error) => {
      console.error('Socket error:', error);
      socket.emit('error', { message: 'An error occurred' });
    });
    
  });
  
  // ============================================
  // UTILITY FUNCTIONS (accessible from services)
  // ============================================
  
  io.notifyUser = (userId, event, data) => {
    io.to(`user-${userId}`).emit(event, data);
  };
  
  io.notifyMatch = (matchId, event, data) => {
    io.to(`match-${matchId}`).emit(event, data);
  };
  
  io.notifyTournament = (tournamentId, event, data) => {
    io.to(`tournament-${tournamentId}`).emit(event, data);
  };
  
  io.getActiveUsers = () => {
    return Array.from(activeUsers.keys());
  };
  
  io.isUserOnline = (userId) => {
    return activeUsers.has(userId.toString());
  };
  
  console.log('✅ Socket.IO handler initialized');
  
  return io;
};

export default initializeSocketIO;
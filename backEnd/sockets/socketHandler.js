
import { Server } from 'socket.io';
import matchService from '../services/matchService.js';

export function initializeSocketIO(server) {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:3000",
      credentials: true
    }
  });

  // Match rooms for live gameplay
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Join match room
    socket.on('join-match', async (matchId) => {
      socket.join(`match-${matchId}`);
      console.log(`User ${socket.id} joined match ${matchId}`);
      
      // Send current match state
      try {
        const state = await matchService.getMatchState(matchId);
        socket.emit('match-state', state);
      } catch (err) {
        socket.emit('error', { message: err.message });
      }
    });

    // Player makes a move
    socket.on('make-move', async ({ matchId, playerId, move }) => {
      try {
        const result = await matchService.makeMove(matchId, playerId, move);
        
        // Broadcast to all users in match room
        io.to(`match-${matchId}`).emit('move-made', {
          gameState: result.gameState,
          isFinished: result.isFinished,
          match: result.match
        });
      } catch (err) {
        socket.emit('error', { message: err.message });
      }
    });

    // Leave match room
    socket.on('leave-match', (matchId) => {
      socket.leave(`match-${matchId}`);
      console.log(`User ${socket.id} left match ${matchId}`);
    });

    // Disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });

  return io;
}
// backEnd/services/socketService.js
// Helper service to emit socket events from anywhere in your backend

class SocketService {
  constructor() {
    this.io = null;
  }

  initialize(io) {
    this.io = io;
    console.log('✅ Socket service initialized');
  }

  // ============================================
  // USER NOTIFICATIONS
  // ============================================

  notifyUser(userId, event, data) {
    if (!this.io) {
      console.warn('Socket.IO not initialized');
      return;
    }
    this.io.to(`user-${userId}`).emit(event, data);
  }

  sendNotification(userId, notification) {
    this.notifyUser(userId, 'notification', {
      ...notification,
      timestamp: new Date()
    });
  }

  // ============================================
  // MATCH EVENTS
  // ============================================

  notifyMatch(matchId, event, data) {
    if (!this.io) {
      console.warn('Socket.IO not initialized');
      return;
    }
    this.io.to(`match-${matchId}`).emit(event, {
      ...data,
      timestamp: new Date()
    });
  }

  matchStarted(matchId, matchData) {
    this.notifyMatch(matchId, 'match-started', matchData);
  }

  matchEnded(matchId, result) {
    this.notifyMatch(matchId, 'match-ended', result);
  }

  playerJoinedMatch(matchId, playerId, playerName) {
    this.notifyMatch(matchId, 'player-joined-match', {
      playerId,
      playerName
    });
  }

  // ============================================
  // TOURNAMENT EVENTS
  // ============================================

  notifyTournament(tournamentId, event, data) {
    if (!this.io) {
      console.warn('Socket.IO not initialized');
      return;
    }
    this.io.to(`tournament-${tournamentId}`).emit(event, {
      ...data,
      timestamp: new Date()
    });
  }

  tournamentStarted(tournamentId, tournamentData) {
    this.notifyTournament(tournamentId, 'tournament-started', tournamentData);
  }

  tournamentEnded(tournamentId, winners) {
    this.notifyTournament(tournamentId, 'tournament-ended', { winners });
  }

  matchCompleted(tournamentId, matchData) {
    this.notifyTournament(tournamentId, 'match-completed', matchData);
  }

  bracketUpdated(tournamentId, bracket) {
    this.notifyTournament(tournamentId, 'bracket-updated', { bracket });
  }

  // ============================================
  // LEAGUE EVENTS
  // ============================================

  notifyLeague(leagueId, event, data) {
    if (!this.io) {
      console.warn('Socket.IO not initialized');
      return;
    }
    this.io.to(`league-${leagueId}`).emit(event, {
      ...data,
      timestamp: new Date()
    });
  }

  newApplication(leagueId, applicationData) {
    this.notifyLeague(leagueId, 'new-application', applicationData);
  }

  applicationAccepted(leagueId, userId, userName) {
    this.notifyLeague(leagueId, 'application-accepted', {
      userId,
      userName
    });
  }

  // ============================================
  // BROADCAST EVENTS
  // ============================================

  broadcast(event, data) {
    if (!this.io) {
      console.warn('Socket.IO not initialized');
      return;
    }
    this.io.emit(event, {
      ...data,
      timestamp: new Date()
    });
  }

  systemAnnouncement(message, type = 'info') {
    this.broadcast('system-announcement', {
      message,
      type // 'info', 'warning', 'error', 'success'
    });
  }

  // ============================================
  // UTILITY METHODS
  // ============================================

  isUserOnline(userId) {
    if (!this.io) return false;
    
    const userRoom = this.io.sockets.adapter.rooms.get(`user-${userId}`);
    return userRoom && userRoom.size > 0;
  }

  getOnlineUsers() {
    if (!this.io) return [];
    
    const onlineUsers = [];
    const rooms = this.io.sockets.adapter.rooms;
    
    for (const [roomName, room] of rooms) {
      if (roomName.startsWith('user-')) {
        onlineUsers.push(roomName.replace('user-', ''));
      }
    }
    
    return onlineUsers;
  }

  getMatchParticipants(matchId) {
    if (!this.io) return 0;
    
    const matchRoom = this.io.sockets.adapter.rooms.get(`match-${matchId}`);
    return matchRoom ? matchRoom.size : 0;
  }

  getTournamentSpectators(tournamentId) {
    if (!this.io) return 0;
    
    const tournamentRoom = this.io.sockets.adapter.rooms.get(`tournament-${tournamentId}`);
    return tournamentRoom ? tournamentRoom.size : 0;
  }
}

// Export singleton instance
export default new SocketService();
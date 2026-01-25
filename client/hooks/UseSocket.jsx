import { useEffect, useState } from 'react';
import { useSocketContext } from '../src/context/SocketContext';
import { useAuth } from '../src/Auth/AuthContext';

// Re-export useSocket for backward compatibility, but it now uses context
export const useSocket = () => {
  return useSocketContext();
};

// ============================================
// MATCH SOCKET HOOK
// ============================================

export const useMatchSocket = (matchId) => {
  const { socket, isConnected } = useSocket();
  const { currentUser } = useAuth();
  const [matchState, setMatchState] = useState(null);
  const [isInMatch, setIsInMatch] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!socket || !isConnected || !matchId) return;

    // Join match
    socket.emit('join-match', matchId);
    setIsInMatch(true);

    // Listen for match state
    socket.on('match-state', (state) => {
      console.log('📊 Match state received:', state);
      setMatchState(state);
      setError(null);
    });

    // Listen for generic errors from the server (like "Match not found")
    socket.on('error', (err) => {
        console.error('❌ Match socket error:', err);
        setError(err.message || 'Unknown socket error');
    });

    // Listen for moves
    socket.on('move-made', (data) => {
      console.log('🎮 Move made:', data);
      setMatchState(prev => ({
        ...prev,
        currentGameState: data.gameState,
        currentTurn: data.nextPlayer,
        score: data.score,
        status: data.status,
        winner: data.winner
      }));
    });

    // Player events
    socket.on('player-joined', (data) => {
      console.log('👤 Player joined:', data);
    });

    socket.on('player-left', (data) => {
      console.log('👋 Player left:', data);
    });

    socket.on('player-ready', (data) => {
      console.log('✋ Player ready:', data);
    });

    // Listen for partial updates
    socket.on('match-update', (data) => {
      console.log('🔄 Match update:', data);
      setMatchState(prev => ({
        ...prev,
        ...data
      }));
    });

    // Error handling
    socket.on('move-error', (error) => {
      console.error('❌ Move error:', error);
      setError(error.message);
    });

    // Cleanup
    return () => {
      if (socket) {
        socket.emit('leave-match', matchId);
        socket.off('match-state');
        socket.off('error');
        socket.off('move-made');
        socket.off('player-joined');
        socket.off('player-left');
        socket.off('player-ready');
        socket.off('move-error');
        setIsInMatch(false);
      }
    };
  }, [socket, isConnected, matchId]);

  const makeMove = (move) => {
    if (socket && isConnected) {
      socket.emit('make-move', { 
        matchId, 
        playerId: currentUser?._id,
        move 
      });
    }
  };

  const sendChatMessage = (message) => {
    if (socket && isConnected) {
      socket.emit('match-chat', { 
        matchId, 
        playerId: currentUser?._id,
        message 
      });
    }
  };

  const setPlayerReady = () => {
    if (socket && isConnected) {
      socket.emit('player-ready', { 
        matchId,
        playerId: currentUser?._id
      });
    }
  };

  return {
    matchState,
    isInMatch,
    makeMove,
    sendChatMessage,
    setPlayerReady,
    isConnected,
    error
  };
};

// ============================================
// TOURNAMENT SOCKET HOOK
// ============================================

export const useTournamentSocket = (tournamentId) => {
  const { socket, isConnected } = useSocket();
  const [tournamentState, setTournamentState] = useState(null);
  const [matchCompleted, setMatchCompleted] = useState(null);

  useEffect(() => {
    if (!socket || !isConnected || !tournamentId) return;

    // Join tournament room
    socket.emit('join-tournament', tournamentId);

    // Listen for tournament state
    socket.on('tournament-state', (state) => {
      console.log('🏆 Tournament state:', state);
      setTournamentState(state.tournament);
    });

    // Listen for match completions
    socket.on('match-completed', (data) => {
      console.log('✅ Match completed:', data);
      setMatchCompleted(data);
    });

    // Listen for bracket updates
    socket.on('bracket-updated', (data) => {
      console.log('📊 Bracket updated:', data);
    });

    // Cleanup
    return () => {
      if (socket) {
        socket.emit('leave-tournament', tournamentId);
        socket.off('tournament-state');
        socket.off('match-completed');
        socket.off('bracket-updated');
      }
    };
  }, [socket, isConnected, tournamentId]);

  return {
    tournamentState,
    matchCompleted,
    isConnected
  };
};

// ============================================
// NOTIFICATIONS SOCKET HOOK
// ============================================

export const useNotifications = () => {
  const { socket, isConnected } = useSocket();
  const { currentUser: user } = useAuth();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!socket || !isConnected || !user) return;

    // Subscribe to notifications
    socket.emit('subscribe-notifications', user._id);

    // Listen for notifications
    socket.on('notification', (notification) => {
      console.log('🔔 Notification:', notification);
      setNotifications(prev => [notification, ...prev]);
    });

    socket.on('system-announcement', (announcement) => {
      console.log('📢 System announcement:', announcement);
      setNotifications(prev => [{
        type: 'system',
        ...announcement
      }, ...prev]);
    });

    // Cleanup
    return () => {
      if (socket) {
        socket.emit('unsubscribe-notifications', user._id);
        socket.off('notification');
        socket.off('system-announcement');
      }
    };
  }, [socket, isConnected, user]);

  const clearNotifications = () => {
    setNotifications([]);
  };

  return {
    notifications,
    clearNotifications,
    isConnected
  };
};

export default useSocket;
// client/src/hooks/useSocket.js
import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../src/Auth/AuthContext';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const useSocket = () => {
  const socketRef = useRef(null);
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);

  useEffect(() => {
    if (!user) return;

    // Initialize socket connection
    socketRef.current = io(SOCKET_URL, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      transports: ['websocket', 'polling']
    });

    const socket = socketRef.current;

    // Connection events
    socket.on('connect', () => {
      console.log('✅ Socket connected:', socket.id);
      setIsConnected(true);
      setConnectionError(null);
      
      // Authenticate user
      socket.emit('authenticate', user._id);
    });

    socket.on('authenticated', (data) => {
      console.log('✅ Socket authenticated:', data);
    });

    socket.on('disconnect', () => {
      console.log('🔌 Socket disconnected');
      setIsConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error);
      setConnectionError(error.message);
      setIsConnected(false);
    });

    socket.on('error', (error) => {
      console.error('❌ Socket error:', error);
      setConnectionError(error.message);
    });

    // Cleanup on unmount
    return () => {
      if (socket) {
        console.log('🔌 Cleaning up socket connection');
        socket.disconnect();
      }
    };
  }, [user]);

  return {
    socket: socketRef.current,
    isConnected,
    connectionError
  };
};

// ============================================
// MATCH SOCKET HOOK
// ============================================

export const useMatchSocket = (matchId) => {
  const { socket, isConnected } = useSocket();
  const [matchState, setMatchState] = useState(null);
  const [isInMatch, setIsInMatch] = useState(false);

  useEffect(() => {
    if (!socket || !isConnected || !matchId) return;

    // Join match
    socket.emit('join-match', matchId);
    setIsInMatch(true);

    // Listen for match state
    socket.on('match-state', (state) => {
      console.log('📊 Match state received:', state);
      setMatchState(state);
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

    // Error handling
    socket.on('move-error', (error) => {
      console.error('❌ Move error:', error);
    });

    // Cleanup
    return () => {
      if (socket) {
        socket.emit('leave-match', matchId);
        socket.off('match-state');
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
      socket.emit('make-move', { matchId, move });
    }
  };

  const sendChatMessage = (message) => {
    if (socket && isConnected) {
      socket.emit('match-chat', { matchId, message });
    }
  };

  const setPlayerReady = () => {
    if (socket && isConnected) {
      socket.emit('player-ready', { matchId });
    }
  };

  return {
    matchState,
    isInMatch,
    makeMove,
    sendChatMessage,
    setPlayerReady,
    isConnected
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
  const { user } = useAuth();
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
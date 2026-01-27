import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../Auth/AuthContext';

const SocketContext = createContext(null);

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const SocketProvider = ({ children }) => {
    const { currentUser } = useAuth();
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const socketRef = useRef(null);

    useEffect(() => {
        // Allow guest connections (no currentUser check here)
        
        if (socketRef.current) {
            // If user changes (login/logout), we might want to re-authenticate or reconnect
            // For now, let's keep it simple: if socket exists and user logs in, we auth.
            // If user logs out, we might want to disconnect/reconnect as guest.
            
            if (currentUser && !socketRef.current.userId) {
                 socketRef.current.emit('authenticate', currentUser._id);
                 socketRef.current.emit('subscribe-notifications', currentUser._id);
                 socketRef.current.userId = currentUser._id;
            } else if (!currentUser && socketRef.current.userId) {
                // User logged out, disconnect and reconnect as guest
                console.log('🔌 User logged out, switching to guest connection');
                socketRef.current.disconnect();
                socketRef.current = null;
                setSocket(null);
                setIsConnected(false);
                // The effect will re-run and connect as guest
                return;
            }
            return;
        }

        console.log(currentUser ? `🔌 Initializing socket connection for user: ${currentUser.name}` : '🔌 Initializing guest socket connection');

        const newSocket = io(SOCKET_URL, {
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5,
            transports: ['websocket', 'polling'],
            withCredentials: true
        });

        socketRef.current = newSocket;
        setSocket(newSocket);

        newSocket.on('connect', () => {
            console.log('✅ Socket connected:', newSocket.id);
            setIsConnected(true);
            if (currentUser) {
                newSocket.emit('authenticate', currentUser._id);
                // Also subscribe to personal notifications
                newSocket.emit('subscribe-notifications', currentUser._id);
                newSocket.userId = currentUser._id; // Local tracking
            }
        });

        newSocket.on('disconnect', () => {
            console.log('🔌 Socket disconnected');
            setIsConnected(false);
        });

        newSocket.on('connect_error', (err) => {
            console.error('❌ Socket connection error:', err);
            setIsConnected(false);
        });

        return () => {
             // Cleanup if needed
        };
    }, [currentUser]);

    return (
        <SocketContext.Provider value={{ socket, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocketContext = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocketContext must be used within a SocketProvider');
    }
    return context;
};

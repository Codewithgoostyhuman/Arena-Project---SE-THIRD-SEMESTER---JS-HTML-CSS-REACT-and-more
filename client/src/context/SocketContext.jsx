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
        if (!currentUser) {
            if (socketRef.current) {
                console.log('🔌 User logged out, disconnecting socket');
                socketRef.current.disconnect();
                socketRef.current = null;
                setSocket(null);
                setIsConnected(false);
            }
            return;
        }

        if (socketRef.current) {
            // Already connected or connecting
            return;
        }

        console.log('🔌 Initializing socket connection for user:', currentUser.name);

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
            newSocket.emit('authenticate', currentUser._id);
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
             // Cleanup handled by dependency change or unmount
             // We don't necessarily want to disconnect on every re-render if strict mode is on, 
             // but checking !currentUser above handles logouts.
             // On strict mode unmount, it might disconnect/reconnect which is fine.
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

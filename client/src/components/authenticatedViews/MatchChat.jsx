import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../Auth/AuthContext';
import {useSocket} from "../../../hooks/UseSocket"

const MatchChat = ({ matchId, sendMessage, isSpectator }) => {
    const { currentUser } = useAuth();
    const [message, setMessage] = useState('');
    const [chatHistory, setChatHistory] = useState([]);
    const messagesEndRef = useRef(null);
    const { socket, isConnected } = useSocket();

    useEffect(() => {
        if (!socket) return;

        const handleChat = (data) => {
            console.log('Chat received:', data);
            setChatHistory(prev => [...prev, data]);
        };

        socket.on('match-chat', handleChat);

        return () => {
            socket.off('match-chat', handleChat);
        };
    }, [socket]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [chatHistory]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!message.trim() || !isConnected) return;

        if (sendMessage) {
            sendMessage(message);
        }
        setMessage('');
    };

    return (
        <div className="flex flex-col h-full bg-gray-800 text-white">
            <div className="p-4 border-b border-gray-700 font-bold bg-gray-900 flex justify-between items-center">
                <span>Match Chat</span>
                {!isConnected && <span className="text-xs text-red-400">Offline</span>}
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {chatHistory.length === 0 && (
                    <div className="text-center text-gray-500 italic mt-4">
                        No messages yet. Say hi!
                    </div>
                )}
                
                {chatHistory.map((msg, idx) => {
                    const isMe = msg.playerId === currentUser?._id;
                    return (
                        <div key={idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                            <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                                isMe ? 'bg-blue-600' : 'bg-gray-700'
                            }`}>
                                {!isMe && <div className="text-xs text-blue-300 font-bold mb-1">{msg.playerName}</div>}
                                {msg.message}
                            </div>
                            <span className="text-xs text-gray-500 mt-1">
                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {isSpectator ? (
                <div className="p-3 border-t border-gray-700 bg-gray-900 text-center text-xs text-gray-500 italic">
                    Spectator Mode - Chat Disabled
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="p-3 border-t border-gray-700 bg-gray-900">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder={isConnected ? "Type a message..." : "Reconnecting..."}
                            disabled={!isConnected}
                            className="flex-1 bg-gray-800 border-none rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50"
                        />
                        <button 
                            type="submit"
                            disabled={!message.trim() || !isConnected}
                            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded text-sm font-semibold transition"
                        >
                            Send
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default MatchChat;

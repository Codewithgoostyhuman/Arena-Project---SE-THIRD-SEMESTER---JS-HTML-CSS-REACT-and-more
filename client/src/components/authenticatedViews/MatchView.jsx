// client/src/components/authenticatedViews/MatchView.jsx
import { useState, useEffect } from 'react';
import { ArrowLeft, Trophy, Monitor, CheckCircle, ChatCircleText } from '@phosphor-icons/react';
import { useAuth } from '../../Auth/AuthContext';
import { apiService } from '../../APIs/apiService';
import TicTacToeBoard from '../../GameComponents/TicTacToeBoard';
import RPS from '../../GameComponents/RPS';
import NumberGuessDuelUI from '../../GameComponents/NumberGuessDuelUI';
import LoadingScreen from '../reuseableComponents/LoadingScreen';
import {useMatchSocket} from '../../../hooks/UseSocket';
import MatchChat from './MatchChat'; 
import MatchAdDisplay from './MatchAdDisplay';

const MatchView = ({ matchId, setCurrentView }) => {
  const { currentUser } = useAuth();
  const [initialMatchData, setInitialMatchData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize Socket Hook
  const { 
    matchState, 
    isInMatch, 
    makeMove, 
    sendChatMessage, 
    setPlayerReady, 
    isConnected,
    error: socketError
  } = useMatchSocket(matchId);

  useEffect(() => {
    if (matchId) {
      fetchInitialMatchData();
    }
  }, [matchId]);

  const fetchInitialMatchData = async () => {
    try {
      setLoading(true);
      // We still fetch initial data to get static info like game type, players, etc.
      // independent of the socket state
      const initialMatch = await (currentUser 
        ? apiService.matches.getById(matchId) 
        : apiService.public.getMatchDetails(matchId));
      
      const matchObj = initialMatch.match || initialMatch;
      setInitialMatchData(matchObj);
      setError(null);
    } catch (err) {
      console.error('Error fetching match:', err);
      setError(err.message || 'Failed to load match');
    } finally {
      setLoading(false);
    }
  };

  const handleStartMatch = async () => {
    try {
      await apiService.matches.start(matchId);
      // Socket will automatically pick up the status change
    } catch (err) {
      console.error('Error starting match:', err);
      setError(err.message || 'Failed to start match');
    }
  };

  const handleBackButton = () => {
    setCurrentView(currentUser ? 'dashboard' : 'live');
  };

  const renderGameComponent = () => {
    // Robust checks
    if (!initialMatchData) return null;
    
    // Merge socket state with initial data, preferring socket state for dynamic fields
    const currentMatch = {
      ...initialMatchData,
      ...(matchState || {})
    };

    const gameType = currentMatch.game?.type || currentMatch.gameType;
    if (!gameType) {
      return <div className="text-yellow-500 p-4 bg-yellow-500/10 rounded">Game configuration is missing.</div>;
    }

    // Pass socket functions and state to children
    const props = { 
      matchId, 
      match: currentMatch, // Pass the full merged match object
      makeMove,
      isConnected
    };

    switch (gameType) {
      case 'TicTacToe':
        return <TicTacToeBoard {...props} />;
      
      case 'RockPaperScissors':
        return <RPS {...props} />;
      
      case 'NumberGuessDuel':
        return <NumberGuessDuelUI {...props} />;
      
      default:
        return <div className="text-white p-4">Game type not supported: {gameType}</div>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <LoadingScreen />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-red-500/10 border border-red-500 rounded-lg p-6 max-w-md w-full">
          <h2 className="text-xl font-bold text-red-500 mb-2">Error Loading Match</h2>
          <p className="text-red-400 mb-4">{error}</p>
          <button onClick={fetchInitialMatchData} className="w-full bg-red-600 text-white py-2 rounded-lg">Retry</button>
          <button onClick={handleBackButton} className="w-full mt-2 bg-gray-600 text-white py-2 rounded-lg">Back</button>
        </div>
      </div>
    );
  }

  // Combine data for the view
  const displayMatch = {
    ...initialMatchData,
    ...(matchState || {}) 
  };
  
  if (!displayMatch) return <div>Match not found</div>;

  const isPlayer = displayMatch.players?.some(p => p._id === currentUser?._id);

  return (
    <div className="min-h-screen bg-slate-900 text-white relative overflow-hidden">
        {/* Background Grid Pattern */}
        <div className="fixed inset-0 z-0 opacity-20 pointer-events-none" 
            style={{ 
                backgroundImage: 'linear-gradient(rgba(99, 102, 241, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(99, 102, 241, 0.1) 1px, transparent 1px)', 
                backgroundSize: '40px 40px' 
            }}
        />
        <div className="fixed top-20 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="fixed bottom-20 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-indigo-500/30">
                 <div>
                    <button 
                        onClick={handleBackButton} 
                        className="flex items-center text-slate-400 hover:text-white transition-colors mb-2 group"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                        Back to Dashboard
                    </button>
                    <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight uppercase">
                        {displayMatch.game?.name || 'Match'} <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Lobby</span>
                    </h1>
                    <p className="text-slate-400 font-mono text-sm tracking-wider mt-1">ID: {matchId}</p>
                </div>
                
                <div className={`self-start md:self-center px-4 py-2 rounded-full border flex items-center gap-2 ${
                    displayMatch.status === 'finished' ? 'bg-green-500/10 border-green-500 text-green-400' :
                    displayMatch.status === 'live' ? 'bg-red-500/10 border-red-500 text-red-400 animate-pulse' :
                    'bg-slate-700/50 border-slate-600 text-slate-300'
                }`}>
                    <div className={`w-2 h-2 rounded-full ${
                         displayMatch.status === 'finished' ? 'bg-green-500' :
                         displayMatch.status === 'live' ? 'bg-red-500' :
                         'bg-slate-400'
                    }`}></div>
                    <span className="font-bold uppercase text-sm tracking-wider">{displayMatch.status?.replace('_', ' ') || 'UNKNOWN'}</span>
                </div>
            </div>

            <div className={`grid grid-cols-1 ${isPlayer ? 'lg:grid-cols-3' : 'lg:grid-cols-3'} gap-8`}>
                {/* Left Column: Match Details & Game Area */}
                <div className={`space-y-6 ${isPlayer ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
                    
                    {/* VS Banner */}
                    <div className="relative bg-slate-800/50 backdrop-blur-md rounded-2xl border border-slate-700 p-8 overflow-hidden group">
                         <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-transparent to-red-500/10 opacity-50"></div>
                         
                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-around gap-8">
                            {/* Player 1 */}
                            <div className="text-center group/p1">
                                <div className={`w-24 h-24 mx-auto bg-slate-800 rounded-full border-4 flex items-center justify-center mb-4 transition-transform shadow-xl ${displayMatch.currentTurn === displayMatch.players?.[0]?._id ? 'border-indigo-500 scale-110 shadow-indigo-500/50' : 'border-slate-600'}`}>
                                    <Trophy className={`w-10 h-10 ${displayMatch.currentTurn === displayMatch.players?.[0]?._id ? 'text-indigo-400' : 'text-slate-500'}`} weight="duotone" />
                                </div>
                                <h2 className="text-xl font-black text-white uppercase tracking-wider">{displayMatch.players?.[0]?.name || 'Waiting...'}</h2>
                                <p className="text-indigo-400 font-bold text-sm">Player 1</p>
                                 {displayMatch.winner === displayMatch.players?.[0]?._id && (
                                    <div className="mt-2 inline-block px-3 py-1 bg-yellow-500/20 text-yellow-400 border border-yellow-500/50 rounded-full text-xs font-bold uppercase tracking-widest">
                                        Winner
                                    </div>
                                )}
                            </div>

                            {/* VS Divider */}
                            <div className="flex flex-col items-center">
                                <div className="text-4xl font-black text-white italic opacity-50">VS</div>
                            </div>

                            {/* Player 2 */}
                            <div className="text-center group/p2">
                                 <div className={`w-24 h-24 mx-auto bg-slate-800 rounded-full border-4 flex items-center justify-center mb-4 transition-transform shadow-xl ${displayMatch.currentTurn === displayMatch.players?.[1]?._id ? 'border-red-500 scale-110 shadow-red-500/50' : 'border-slate-600'}`}>
                                    <Trophy className={`w-10 h-10 ${displayMatch.currentTurn === displayMatch.players?.[1]?._id ? 'text-red-400' : 'text-slate-500'}`} weight="duotone" />
                                </div>
                                <h2 className="text-xl font-black text-white uppercase tracking-wider">{displayMatch.players?.[1]?.name || 'Waiting...'}</h2>
                                <p className="text-red-400 font-bold text-sm">Player 2</p>
                                {displayMatch.winner === displayMatch.players?.[1]?._id && (
                                    <div className="mt-2 inline-block px-3 py-1 bg-yellow-500/20 text-yellow-400 border border-yellow-500/50 rounded-full text-xs font-bold uppercase tracking-widest">
                                        Winner
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Game Component Container */}
                    <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl border border-slate-700 p-1 min-h-[400px] flex flex-col relative overflow-hidden">
                        {/* Decorative Corner Accents */}
                        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-indigo-500 rounded-tl-lg"></div>
                        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-indigo-500 rounded-tr-lg"></div>
                        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-indigo-500 rounded-bl-lg"></div>
                        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-indigo-500 rounded-br-lg"></div>

                        {/* Start Match / Ready Button Overlay */}
                        {displayMatch.status === 'ready' && isPlayer && (
                            <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm">
                                <div className="text-center">
                                    <h3 className="text-2xl font-bold text-white mb-4">
                                        {displayMatch.playersReady?.includes(currentUser?._id) 
                                            ? 'Waiting for Opponent...' 
                                            : 'Are you Ready?'}
                                    </h3>
                                    
                                    {displayMatch.playersReady?.includes(currentUser?._id) ? (
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                                            <p className="text-indigo-400 font-bold uppercase tracking-wider text-sm mt-2">
                                                {displayMatch.playersReady?.length || 1} / {displayMatch.players?.length || 2} Ready
                                            </p>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={handleStartMatch}
                                            className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-black text-xl rounded-xl hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transition-all transform hover:scale-105 border border-green-400/50"
                                        >
                                            READY UP
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="flex-1 p-6">
                           {renderGameComponent()}
                        </div>
                    </div>

                    {/* Banner Ads Section */}
                    <div className="mt-8">
                        <MatchAdDisplay matchId={matchId} placement="banner" />
                    </div>
                </div>

                {/* Right Column: Chat & Sidebar Ads */}
                <div className={`space-y-6 ${!isPlayer ? 'grid grid-cols-1 md:grid-cols-2 gap-6 space-y-0' : ''}`}>
                    
                     {/* Connection Status Indicator */}
                     {!isConnected && (
                        <div className="bg-orange-500/20 text-orange-400 px-4 py-3 rounded-xl border border-orange-500/30 flex items-center justify-between animate-pulse">
                            <div className="flex items-center font-bold">
                                <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
                                <span>Disconnected</span>
                            </div>
                            <div className="text-xs text-orange-300">
                               Reconnecting...
                            </div>
                        </div>
                    )}

                    {/* Chat Window - Only visible to players */}
                    {isPlayer && (
                        <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl border border-slate-700 overflow-hidden shadow-xl h-[600px] flex flex-col">
                            <div className="p-4 border-b border-slate-700 bg-slate-900/50 flex items-center justify-between">
                                <h3 className="font-bold text-white flex items-center">
                                    <ChatCircleText className="w-5 h-5 mr-2 text-indigo-400" weight="duotone" />
                                    Live Chat
                                </h3>
                                <div className="flex items-center text-xs text-green-400">
                                    <span className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></span>
                                    Online
                                </div>
                            </div>
                            <div className="flex-1 overflow-hidden bg-slate-900/30">
                                <MatchChat 
                                    matchId={matchId} 
                                    sendMessage={sendChatMessage}
                                    currentUser={currentUser}
                                    isSpectator={!isPlayer}
                                />
                            </div>
                        </div>
                    )}

                    {/* Sidebar Ad (Square) */}
                    <div className="bg-slate-800/30 rounded-2xl border border-slate-700 p-4 flex justify-center">
                         <MatchAdDisplay matchId={matchId} placement="sidebar" />
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default MatchView;
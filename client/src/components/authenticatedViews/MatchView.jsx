// client/src/components/authenticatedViews/MatchView.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../../Auth/AuthContext';
import { apiService } from '../../APIs/apiService';
import TicTacToeBoard from '../../GameComponents/TicTacToeBoard';
import RPS from '../../GameComponents/RPS';
import NumberGuessDuelUI from '../../GameComponents/NumberGuessDuelUI';
import LoadingScreen from '../reuseableComponents/LoadingScreen';

const MatchView = ({ matchId, setCurrentView }) => {
   const { currentUser } = useAuth();
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('MatchView mounted with matchId:', matchId);
    if (matchId) {
      fetchMatchData();
    }
  }, [matchId]);

  const fetchMatchData = async () => {
    try {
      setLoading(true);
      console.log('Fetching match data for:', matchId);
      
      const data = await apiService.matches.getById(matchId);
      console.log('Match data received:', data);
      
      setMatch(data.match || data);
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
      console.log('Starting match:', matchId);
      await apiService.matches.start(matchId);
      console.log('Match started successfully');
      fetchMatchData();
    } catch (err) {
      console.error('Error starting match:', err);
      setError(err.message || 'Failed to start match');
    }
  };

  const handleBackButton = () => {
    console.log('Navigating back to dashboard');
    setCurrentView('dashboard');
  };

  const renderGameComponent = () => {
    if (!match || !match.game) {
      console.log('Cannot render game - no match or game data');
      return null;
    }

    const gameType = match.game.type;
    console.log('Rendering game component for type:', gameType);

    switch (gameType) {
      case 'TicTacToe':
        return <TicTacToeBoard matchId={matchId} onMatchUpdate={fetchMatchData} />;
      
      case 'RockPaperScissors':
        return <RPS matchId={matchId} onMatchUpdate={fetchMatchData} />;
      
      case 'NumberGuessDuel':
        return <NumberGuessDuelUI matchId={matchId} onMatchUpdate={fetchMatchData} />;
      
      default:
        return <div className="text-white">Game type not supported: {gameType}</div>;
    }
  };

  useEffect(() => {
    if (match) {
      console.log('Match loaded - status:', match.status);
      console.log('Current game state:', match.currentGameState);
      console.log('Current turn:', match.currentTurn);
    }
  }, [match]);
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <LoadingScreen />
          <p className="text-white mt-4">Loading match...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-red-500/10 border border-red-500 rounded-lg p-6 max-w-md w-full">
          <h2 className="text-xl font-bold text-red-500 mb-2">Error Loading Match</h2>
          <p className="text-red-400 mb-4">{error}</p>
          <div className="space-y-2">
            <button
              onClick={fetchMatchData}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg transition"
            >
              Retry
            </button>
            <button
              onClick={handleBackButton}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg transition"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl text-white mb-4">Match not found</div>
          <button
            onClick={handleBackButton}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const isPlayer = match.players?.some(p => p._id === currentUser?._id);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        
        {/* Back Button */}
        <button
          onClick={handleBackButton}
          className="mb-4 flex items-center text-gray-400 hover:text-white transition"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </button>

        {/* Match Header */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold">{match.game?.name || 'Match'}</h1>
              {match.tournament && (
                <p className="text-gray-400">
                  {match.tournament.name} - Round {match.round}
                  {match.isFinals && ' - Finals'}
                </p>
              )}
            </div>
            
            <div className={`px-4 py-2 rounded-lg font-semibold ${
              match.status === 'live' ? 'bg-green-500' :
              match.status === 'finished' ? 'bg-blue-500' :
              'bg-yellow-500'
            }`}>
              {match.status?.toUpperCase() || 'PENDING'}
            </div>
          </div>

          {/* Players */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            {match.players?.map((player) => (
              <div key={player._id} className="bg-gray-700 rounded-lg p-4">
                <div className="font-semibold text-lg">{player.name}</div>
                <div className="text-gray-400 text-sm">
                  {player.stats?.wins || 0}W - {player.stats?.losses || 0}L
                </div>
                {match.status === 'finished' && match.winner?._id === player._id && (
                  <div className="text-green-400 font-bold mt-2">WINNER 🏆</div>
                )}
              </div>
            ))}
          </div>

          {/* Score (for best of X) */}
          {match.bestOf > 1 && (
            <div className="flex justify-center gap-4 text-2xl font-bold">
              <span>{match.score?.player1 || 0}</span>
              <span className="text-gray-400">-</span>
              <span>{match.score?.player2 || 0}</span>
              <span className="text-gray-400 text-sm ml-2">
                (Best of {match.bestOf})
              </span>
            </div>
          )}

          {/* Start Match Button */}
          {match.status === 'ready' && isPlayer && (
            <button
              onClick={handleStartMatch}
              className="w-full mt-4 bg-green-600 hover:bg-green-700 py-3 rounded-lg font-semibold text-lg transition"
            >
              Start Match
            </button>
          )}
        </div>

        {/* Game Component */}
        {match.status === 'live' || match.status === 'finished' ? (
          <div className="bg-gray-800 rounded-lg p-6">
            {renderGameComponent()}
          </div>
        ) : (
          <div className="bg-gray-800 rounded-lg p-12 text-center">
            <div className="text-2xl text-gray-400">
              {match.status === 'pending' ? 'Waiting for both players...' : 'Match not started yet'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MatchView;
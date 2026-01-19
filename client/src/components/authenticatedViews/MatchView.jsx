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
    if (matchId) {
      fetchMatchData();
    }
  }, [matchId]);

  useEffect(() => {
    if (match) {
      console.log('Match View Updated State:', {
        id: match._id,
        status: match.status,
        hasGame: !!match.game,
        gameType: match.game?.type,
        currentTurn: match.currentTurn,
        hasGameState: !!match.currentGameState
      });
      
      // Auto-fetch state if match is live but state is missing
      if (match.status === 'live' && !match.currentGameState && !loading) {
         console.log('Match is live but missing state - triggering state fetch');
         fetchMatchData();
      }
    }
  }, [match]);

  const fetchMatchData = async () => {
    try {
      setLoading(true);
      console.log('Fetching match data for:', matchId);
      
      let data;
      // ALWAYS try to get state for live matches to ensure initialization
      // But first get the basic match info to know the status
      const initialMatch = await (currentUser 
        ? apiService.matches.getById(matchId) 
        : apiService.public.getMatchDetails(matchId));
      
      const matchObj = initialMatch.match || initialMatch;
      console.log('Initial match status:', matchObj.status);

      if (matchObj.status === 'live') {
        console.log('Match is live, fetching full state...');
        data = await (currentUser 
          ? apiService.matches.getState(matchId) 
          : apiService.public.getMatchState(matchId));
      } else {
        data = matchObj;
      }
      
      console.log('Final match data for state:', data);
      
      // Merge results if necessary (getState might return different structure)
      const finalMatch = (data._id || data.matchId) ? data : matchObj;
      setMatch(finalMatch);
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
    console.log('Navigating back');
    setCurrentView(currentUser ? 'dashboard' : 'live');
  };

  const renderGameComponent = () => {
    // Robust checks
    if (!match) return null;
    
    if (!match.game && !match.gameType) {
       console.warn('Match object exists but game data is missing:', match);
       return <div className="text-yellow-500 p-4 bg-yellow-500/10 rounded">Game configuration is missing for this match.</div>;
    }

    const gameType = match.game?.type || match.gameType;
    if (!gameType) {
      console.warn('Game object exists but type is missing');
      return <div className="text-yellow-500 p-4 bg-yellow-500/10 rounded">Cannot determine game type.</div>;
    }

    console.log('Rendering game component for type:', gameType);
    
    // Ensure we have a match object to pass to children if needed
    // Some children might expect matchId or other props
    const props = { matchId, onMatchUpdate: fetchMatchData };

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
              {currentUser ? 'Back to Dashboard' : 'Back to Live Matches'}
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
            {currentUser ? 'Back to Dashboard' : 'Back to Live Matches'}
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
          {currentUser ? 'Back to Dashboard' : 'Back to Live Matches'}
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
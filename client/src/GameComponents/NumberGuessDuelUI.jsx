import React, { useState, useEffect } from 'react';
import { useAuth } from '../Auth/AuthContext';
import { apiService } from '../APIs/apiService';

const NumberGuessDuelUI = ({ matchId, onMatchUpdate }) => {
  const { currentUser } = useAuth();
  const [match, setMatch] = useState(null);
  const [gameState, setGameState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [makingMove, setMakingMove] = useState(false);
  const [guess, setGuess] = useState('');
  const [roundResult, setRoundResult] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);

  useEffect(() => {
    if (matchId) {
      fetchMatchState();
      const interval = setInterval(fetchMatchState, 2000);
      return () => clearInterval(interval);
    }
  }, [matchId]);

  /**
   * Extract gameState from various possible response structures
   */
  const extractGameState = (data) => {
  console.log('Raw API data:', data);
  
  // Possible locations for gameState
  const possiblePaths = [
    data?.currentGameState,           // ⭐ ADD THIS - your backend uses this!
    data?.match?.currentGameState,    // ⭐ ADD THIS too
    data?.match?.gameState,
    data?.gameState,
    data?.state,
    data?.game,
    // If the response IS the gameState directly (has playerIds)
    data?.playerIds ? data : null,
    // If match object IS the gameState
    data?.match?.playerIds ? data.match : null,
  ];

  for (const gs of possiblePaths) {
    if (gs && (gs.playerIds || gs.players)) {
      console.log('Found gameState at path:', gs);
      return gs;
    }
  }

  return null;
};

  /**
   * Extract match object from response
   */
  const extractMatch = (data) => {
    if (data?.match) return data.match;
    if (data?.status) return data; // data itself is the match
    return data;
  };

  const fetchMatchState = async () => {
    try {
      const data = await apiService.matches.getState(matchId);
      
      // Store raw response for debugging
      setDebugInfo(data);
      
      console.log('=== API Response ===', JSON.stringify(data, null, 2));
      
      const extractedMatch = extractMatch(data);
      const extractedGameState = extractGameState(data);
      
      console.log('Extracted match:', extractedMatch);
      console.log('Extracted gameState:', extractedGameState);
      
      setMatch(extractedMatch);
      setGameState(extractedGameState);
      
      // Check for round result
      if (data.roundResult) {
        setRoundResult(data.roundResult);
        setTimeout(() => setRoundResult(null), 3000);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching match state:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGuess = async (e) => {
    e.preventDefault();
    
    if (!match || !gameState || !currentUser) {
      console.log('Missing data - match:', !!match, 'gameState:', !!gameState, 'user:', !!currentUser);
      return;
    }

    if (makingMove) return;
    if (match.status !== 'live') return;

    const myId = currentUser._id?.toString() || currentUser._id;
    
    // Check if user is a player
    const playerIds = gameState.playerIds || [];
    const isPlayer = playerIds.some(id => id?.toString() === myId);
    
    if (!isPlayer) {
      console.log('User is not a player. PlayerIds:', playerIds, 'MyId:', myId);
      return;
    }

    // Check if already guessed
    if (gameState.players?.[myId]?.guess !== null) {
      setError('You have already guessed this round. Waiting for opponent...');
      return;
    }

    const guessNumber = parseInt(guess.trim(), 10);

    if (isNaN(guessNumber) || guessNumber < 1 || guessNumber > 100) {
      setError('Please enter a number between 1 and 100');
      return;
    }

    try {
      setMakingMove(true);
      setError(null);

      const response = await apiService.matches.makeMove(matchId, {
        move: guessNumber,
        player: currentUser._id
      });

      console.log('Move response:', response);
      setGuess('');
      
      if (response.roundResult) {
        setRoundResult(response.roundResult);
        setTimeout(() => setRoundResult(null), 4000);
      }
      
      await fetchMatchState();
      onMatchUpdate?.();
    } catch (err) {
      console.error('Error making guess:', err);
      setError(err.message);
    } finally {
      setMakingMove(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-400">Loading game...</span>
      </div>
    );
  }

  // Debug: Show raw response if gameState is missing
  if (!gameState) {
    return (
      <div className="text-center p-8">
        <div className="bg-red-500/10 border border-red-500 rounded-lg p-4 mb-4">
          <p className="text-red-400 font-semibold">Unable to load game state</p>
          <p className="text-gray-400 text-sm mt-2">
            The API response structure may not match expected format.
          </p>
        </div>
        
        {/* Show what we received for debugging */}
        <div className="bg-gray-800 rounded-lg p-4 text-left mt-4">
          <div className="text-yellow-400 font-bold mb-2">🔍 Debug - Raw API Response:</div>
          <pre className="text-xs text-gray-300 overflow-auto max-h-64">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>
        
        <button
          onClick={fetchMatchState}
          className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  // Extract values with safe defaults
  const { 
    players = {}, 
    playerIds = [], 
    round = 1, 
    maxRounds = 5, 
    scores = {}, 
    gameOver = false, 
    winner = null,
    bothGuessed = false 
  } = gameState;

  const myId = currentUser?._id?.toString() || currentUser?._id;
  const isPlayer = playerIds.some(id => id?.toString() === myId);
  const myPlayerData = players?.[myId];
  const hasGuessedThisRound = myPlayerData?.guess !== null && myPlayerData?.guess !== undefined;

  const opponentId = playerIds.find(id => id?.toString() !== myId);
  const opponentData = players?.[opponentId];
  const opponentHasGuessed = opponentData?.guess !== null && opponentData?.guess !== undefined;

  const getWinnerName = () => {
    if (!winner) return null;
    if (winner?.toString() === myId) return 'You';
    return players?.[winner]?.name || 'Opponent';
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Round Result Toast */}
      {roundResult && (
        <div className="mb-4 p-4 bg-yellow-500/20 border border-yellow-500 rounded-lg text-center animate-pulse">
          <div className="text-lg font-bold text-yellow-400">Round Complete!</div>
          <div className="text-sm mt-1">
            {roundResult.isDraw 
              ? "It's a tie! Both guesses were equally close."
              : roundResult.roundWinner?.toString() === myId
                ? "🎉 You won this round!"
                : "Opponent won this round"
            }
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500 rounded-lg">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Game Header */}
      <div className="mb-6 text-center">
        {gameOver ? (
          <div className="space-y-2">
            <div className="text-2xl font-bold text-green-400">
              {winner ? `${getWinnerName()} Wins! 🎉` : "It's a Draw! 🤝"}
            </div>
            <div className="text-gray-400">
              Final Score: {scores[playerIds[0]] || 0} - {scores[playerIds[1]] || 0}
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-xl font-semibold">🎯 Number Guess Duel</div>
            <div className="text-2xl font-bold text-blue-400">
              Round {round} of {maxRounds}
            </div>
            <div className="text-gray-400">Guess a number between 1 - 100</div>
          </div>
        )}
      </div>

      {/* Scoreboard */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {playerIds.map((playerId) => {
          const pid = playerId?.toString() || playerId;
          const playerData = players?.[pid] || players?.[playerId];
          const isMe = pid === myId;
          const playerScore = scores?.[pid] || scores?.[playerId] || 0;
          const hasGuessed = playerData?.guess !== null && playerData?.guess !== undefined;
          
          return (
            <div
              key={pid}
              className={`p-4 rounded-lg ${
                isMe ? 'bg-blue-900/50 border border-blue-500' : 'bg-gray-700'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-semibold">
                    {playerData?.name || 'Player'}
                    {isMe && <span className="text-blue-400 text-sm ml-2">(You)</span>}
                  </div>
                  <div className="text-3xl font-bold mt-2 text-yellow-400">
                    {playerScore}
                  </div>
                  <div className="text-xs text-gray-400">rounds won</div>
                </div>
                {!gameOver && (
                  <div className={`text-sm px-2 py-1 rounded ${
                    hasGuessed ? 'bg-green-500/20 text-green-400' : 'bg-gray-600 text-gray-400'
                  }`}>
                    {hasGuessed ? '✓ Guessed' : 'Waiting...'}
                  </div>
                )}
              </div>
              
              {(bothGuessed || gameOver) && hasGuessed && (
                <div className="mt-3 pt-3 border-t border-gray-600">
                  <div className="text-sm text-gray-400">Last Guess:</div>
                  <div className="text-xl font-bold">{playerData?.guess}</div>
                  {playerData?.distance != null && (
                    <div className="text-xs text-gray-500">
                      Distance: {playerData.distance}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Status Message */}
      {!gameOver && hasGuessedThisRound && (
        <div className="mb-6 p-4 bg-gray-800 rounded-lg text-center">
          <div className="text-lg text-yellow-400">⏳ Waiting for opponent...</div>
          <div className="text-sm text-gray-400 mt-2">
            Your guess: <span className="font-bold text-white">{myPlayerData?.guess}</span>
          </div>
        </div>
      )}

      {/* Guess Input */}
      {!gameOver && isPlayer && !hasGuessedThisRound && (
        <form onSubmit={handleGuess} className="mb-6">
          <div className="flex gap-2">
            <input
              type="number"
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              placeholder="Enter your guess (1-100)"
              min="1"
              max="100"
              disabled={makingMove}
              className="flex-1 px-4 py-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
            />
            <button
              type="submit"
              disabled={makingMove || !guess}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold rounded-lg"
            >
              {makingMove ? 'Submitting...' : 'Submit Guess'}
            </button>
          </div>
        </form>
      )}

      {/* Debug Panel */}
      {process.env.NODE_ENV === 'development' && (
        <details className="mt-6 bg-gray-900 rounded-lg p-4">
          <summary className="text-yellow-400 font-bold cursor-pointer">🔧 Debug Info</summary>
          <pre className="text-xs text-gray-300 mt-2 overflow-auto max-h-48">
            {JSON.stringify({ match, gameState, myId, playerIds }, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
};

export default NumberGuessDuelUI;

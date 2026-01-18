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

  useEffect(() => {
    if (matchId) {
      fetchMatchState();
      const interval = setInterval(fetchMatchState, 2000);
      return () => clearInterval(interval);
    }
  }, [matchId]);

  const fetchMatchState = async () => {
    try {
      const data = await apiService.matches.getState(matchId);
      console.log('Match state received:', data);
      
      // ✅ FIX: The response IS the match object (not nested under 'match')
      setMatch(data);
      
      // ✅ FIX: Game state is in 'currentGameState', not 'gameState'
      setGameState(data.currentGameState || null);
      
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

    if (match.status !== 'live') {
      console.log('Match is not live');
      return;
    }

    const myId = currentUser._id?.toString() || currentUser._id;
    
    // Check if user is a player
    const isPlayer = gameState.playerIds?.some(
      id => id?.toString() === myId
    );
    if (!isPlayer) {
      console.log('User is not a player');
      return;
    }

    // Check if already guessed this round
    const myPlayerData = gameState.players?.[myId];
    if (myPlayerData?.guess !== null) {
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
      console.log('Making guess:', guessNumber);

      const response = await apiService.matches.makeMove(matchId, {
        move: guessNumber,
        player: currentUser._id
      });

      console.log('Guess submitted successfully', response);
      setGuess('');
      
      if (response.roundResult) {
        setRoundResult(response.roundResult);
        setTimeout(() => setRoundResult(null), 4000);
      }
      
      await fetchMatchState();
      
      if (onMatchUpdate) {
        onMatchUpdate();
      }
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
      </div>
    );
  }

  // Error/Missing state
  if (!match || !gameState) {
    return (
      <div className="text-center p-8 text-gray-400">
        <p>Unable to load game state</p>
        <button
          onClick={fetchMatchState}
          className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  // Extract game state values
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
  const hasGuessedThisRound = myPlayerData?.guess !== null;

  // Get opponent info
  const opponentId = playerIds.find(id => id?.toString() !== myId);
  const opponentData = players?.[opponentId];
  const opponentHasGuessed = opponentData?.guess !== null;

  // Get winner name
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
          <div className="text-lg font-bold text-yellow-400">
            Round Complete!
          </div>
          <div className="text-sm mt-1">
            {roundResult.isDraw ? (
              "It's a tie! Both guesses were equally close."
            ) : roundResult.roundWinner?.toString() === myId ? (
              "🎉 You won this round!"
            ) : (
              "Opponent won this round"
            )}
          </div>
          {roundResult.previousTargetNumber && (
            <div className="text-xs text-gray-400 mt-2">
              Target was: {roundResult.previousTargetNumber}
            </div>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500 rounded-lg">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Game Status Header */}
      <div className="mb-6 text-center">
        {gameOver ? (
          <div className="space-y-2">
            <div className="text-2xl font-bold text-green-400">
              {winner ? (
                <>{getWinnerName()} Wins! 🎉</>
              ) : (
                "It's a Draw! 🤝"
              )}
            </div>
            <div className="text-gray-400">
              Final Score: {scores[playerIds[0]] || 0} - {scores[playerIds[1]] || 0}
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-xl font-semibold">
              🎯 Number Guess Duel
            </div>
            <div className="text-2xl font-bold text-blue-400">
              Round {round} of {maxRounds}
            </div>
            <div className="text-gray-400">
              Guess a number between 1 - 100
            </div>
            {/* Match info */}
            {match.bestOf && (
              <div className="text-sm text-gray-500">
                Match {match.matchNumber} of {match.bestOf}
                {match.isFinals && ' (Finals)'}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Scoreboard */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {playerIds.map((playerId) => {
          const playerData = players?.[playerId];
          const isMe = playerId?.toString() === myId;
          const playerScore = scores?.[playerId] || 0;
          const hasGuessed = playerData?.guess !== null;
          
          return (
            <div
              key={playerId}
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
                <div className="text-right">
                  {!gameOver && (
                    <div className={`text-sm px-2 py-1 rounded ${
                      hasGuessed 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-gray-600 text-gray-400'
                    }`}>
                      {hasGuessed ? '✓ Guessed' : 'Waiting...'}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Show guess after both have guessed or game over */}
              {(bothGuessed || gameOver) && playerData?.guess !== null && (
                <div className="mt-3 pt-3 border-t border-gray-600">
                  <div className="text-sm text-gray-400">Last Guess:</div>
                  <div className="text-xl font-bold">{playerData.guess}</div>
                  {playerData.distance !== null && (
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
      {!gameOver && (
        <div className="mb-6 text-center">
          {hasGuessedThisRound ? (
            <div className="p-4 bg-gray-800 rounded-lg">
              <div className="text-lg text-yellow-400">
                ⏳ Waiting for opponent to guess...
              </div>
              <div className="text-sm text-gray-400 mt-2">
                Your guess: <span className="font-bold text-white">{myPlayerData?.guess}</span>
              </div>
            </div>
          ) : opponentHasGuessed ? (
            <div className="p-4 bg-orange-500/20 border border-orange-500 rounded-lg">
              <div className="text-lg text-orange-400">
                🚨 Opponent has guessed! Your turn!
              </div>
            </div>
          ) : null}
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
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition"
            >
              {makingMove ? (
                <span className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Submitting
                </span>
              ) : (
                'Submit Guess'
              )}
            </button>
          </div>
        </form>
      )}

      {/* Round Progress */}
      {!gameOver && (
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>Progress</span>
            <span>{round} / {maxRounds} rounds</span>
          </div>
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 transition-all duration-500"
              style={{ width: `${((round - 1) / maxRounds) * 100}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Game Rules */}
      <div className="mt-6 p-4 bg-gray-800 rounded-lg text-sm text-gray-400">
        <div className="font-semibold mb-2 text-white">📋 How to Play:</div>
        <ul className="list-disc list-inside space-y-1">
          <li>Both players guess a secret number between 1 and 100</li>
          <li>The player whose guess is <strong className="text-white">closer</strong> to the target wins the round</li>
          <li>First to win <strong className="text-white">{Math.ceil(maxRounds / 2)}</strong> rounds wins the game!</li>
          <li>Best of {maxRounds} rounds total</li>
        </ul>
      </div>

      {/* Debug Info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-6 p-4 bg-gray-900 rounded-lg text-xs font-mono">
          <div className="font-bold mb-2 text-yellow-400">🔧 Debug Info:</div>
          <div className="grid grid-cols-2 gap-2">
            <div>Match Status: <span className="text-green-400">{match.status}</span></div>
            <div>Round: <span className="text-blue-400">{round}/{maxRounds}</span></div>
            <div>My ID: <span className="text-gray-400">{myId}</span></div>
            <div>Has Guessed: <span className={hasGuessedThisRound ? 'text-green-400' : 'text-red-400'}>{String(hasGuessedThisRound)}</span></div>
            <div>Both Guessed: <span className={bothGuessed ? 'text-green-400' : 'text-red-400'}>{String(bothGuessed)}</span></div>
            <div>Game Over: <span className={gameOver ? 'text-red-400' : 'text-green-400'}>{String(gameOver)}</span></div>
            <div>Current Turn: <span className="text-purple-400">{match.currentTurn}</span></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NumberGuessDuelUI;

import React, { useState, useEffect } from 'react';
import { useAuth } from '../Auth/AuthContext';
import { apiService } from '../APIs/apiService';

const RPS = ({ matchId, onMatchUpdate }) => {
  const { currentUser } = useAuth();
  const [match, setMatch] = useState(null);
  const [gameState, setGameState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [makingMove, setMakingMove] = useState(false);
  const [selectedMove, setSelectedMove] = useState(null);

  // State for result overlay
  const [lastRoundResult, setLastRoundResult] = useState(null);
  const [showResultOverlay, setShowResultOverlay] = useState(false);
  
  // Use a ref to track the last processed game to avoid showing same result twice
  const lastProcessedGameId = React.useRef(null);

  // Effect to detect new round completion
  useEffect(() => {
    if (match && match.games && match.games.length > 0) {
        // Check local storage or ref to see if we just finished a round
        // For simplicity, we compare with current gameState.round
        // If match.games.length >= gameState.round, it means the previous round finished
        
        const lastGame = match.games[match.games.length - 1];
        if (lastGame.completedAt && !showResultOverlay) {
             // Basic check: if we haven't shown this result yet?
             // We can use a timestamp check or just react to change.
             // Better: Store processedGameId
        }
    }
  }, [match, gameState, showResultOverlay]); // Added dependencies to satisfy linter

  useEffect(() => {
    if (!match?.games?.length) return;

    // Safe user ID extraction for effect
    const currentUserId = currentUser?._id?.toString();
    if (!currentUserId) return;

    const lastGame = match.games[match.games.length - 1];
    
    // If we haven't shown this game's result yet
    if (lastGame._id !== lastProcessedGameId.current && lastGame.completedAt) {
        lastProcessedGameId.current = lastGame._id;
        
        // Determine result of THIS game/round
        let resultType = 'draw';
        let winnerName = null;
        
        if (lastGame.winner) {
            resultType = lastGame.winner === currentUserId ? 'win' : 'loss';
            winnerName = match.players.find(p => p._id === lastGame.winner)?.name;
        } else {
            // It's a draw
        }
        
        setLastRoundResult({
            type: resultType,
            winnerName,
            round: lastGame.gameNumber || match.games.length,
            player1Move: lastGame.gameState?.choices?.[match.players[0]._id],
            player2Move: lastGame.gameState?.choices?.[match.players[1]._id]
        });
        
        setShowResultOverlay(true);
        
        // Hide after 3 seconds
        setTimeout(() => {
            setShowResultOverlay(false);
        }, 3000);
    }
  }, [match, currentUser]);

  const moves = [
    { name: 'Rock', icon: '🪨', value: 'rock' },
    { name: 'Paper', icon: '📄', value: 'paper' },
    { name: 'Scissors', icon: '✂️', value: 'scissors' }
  ];

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
      
      setMatch(data.match || data);
      setGameState(data.match?.currentGameState || data.currentGameState || data.match?.gameState || data.gameState || {
        round: 1,
        moves: {},
        winner: null,
        results: []
      });
      setError(null);
    } catch (err) {
      console.error('Error fetching match state:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMoveSelection = async (move) => {
    // Comprehensive validation
    if (!currentUser || !currentUser._id) {
      console.error('Current user not loaded:', currentUser);
      setError('User not authenticated. Please refresh the page.');
      return;
    }

    if (!match || !gameState) {
      console.error('Missing data - match:', !!match, 'gameState:', !!gameState);
      setError('Game state not loaded. Please refresh the page.');
      return;
    }

    if (makingMove) {
      console.log('Already making a move');
      return;
    }

    if (match.status !== 'live') {
      console.log('Match is not live, status:', match.status);
      setError('Match is not currently live');
      return;
    }

    // Ensure currentUser._id is a string for comparison
    const userId = currentUser._id.toString();
    const playerIndex = match.players?.findIndex(p => p._id?.toString() === userId);
    
    if (playerIndex === -1) {
      console.error('User is not a player. UserId:', userId, 'Players:', match.players);
      setError('You are not a player in this match');
      return;
    }

    // Check if player already made a move this round
    if (gameState.moves?.[userId] !== undefined) {
      console.log('Already made a move this round');
      setError('You have already made your move. Waiting for opponent...');
      return;
    }

    try {
      setMakingMove(true);
      setSelectedMove(move);
      setError(null);
      console.log('Making move:', { move, userId, round: gameState.round });

      const moveData = {
        move: { choice: move },  // ✅ Wrap in object with 'choice' property
        player: userId,  // Ensure it's a string
        round: gameState.round || 1
      };

      console.log('Sending move data:', moveData);

      await apiService.matches.makeMove(matchId, moveData);

      console.log('Move made successfully');
      await fetchMatchState();
      
      if (onMatchUpdate) {
        onMatchUpdate();
      }
    } catch (err) {
      console.error('Error making move:', err);
      setError(err.message || 'Failed to make move');
      setSelectedMove(null);
    } finally {
      setMakingMove(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-400">Loading game...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500 rounded-lg p-4">
        <p className="text-red-500 font-semibold">Error: {error}</p>
        <button
          onClick={() => {
            setError(null);
            fetchMatchState();
          }}
          className="mt-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!match || !gameState) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-400 mb-4">Unable to load game state</p>
        <button
          onClick={fetchMatchState}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
        >
          Reload
        </button>
      </div>
    );
  }

  // Safe user ID extraction
  const userId = currentUser?._id?.toString();
  const playerIndex = match.players?.findIndex(p => p._id?.toString() === userId) ?? -1;
  const hasPlayerMoved = userId ? (gameState.moves?.[userId] !== undefined) : false;
  const bothPlayersMoved = Object.keys(gameState.moves || {}).length === 2;



  return (
    <div className="max-w-2xl mx-auto relative">
      {/* Result Overlay */}
      {showResultOverlay && lastRoundResult && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/90 backdrop-blur-sm rounded-xl animate-in fade-in zoom-in duration-300">
             <div className="text-center p-8">
                <h2 className={`text-4xl font-black mb-4 uppercase tracking-tighter ${
                    lastRoundResult.type === 'win' ? 'text-green-500' :
                    lastRoundResult.type === 'loss' ? 'text-red-500' :
                    'text-yellow-400'
                }`}>
                    {lastRoundResult.type === 'win' ? 'You Won!' :
                     lastRoundResult.type === 'loss' ? 'You Lost!' :
                     'Draw!'}
                </h2>
                
                {lastRoundResult.winnerName && lastRoundResult.type === 'loss' && (
                    <p className="text-slate-400 text-lg mb-4">{lastRoundResult.winnerName} wins this round</p>
                )}
                
                <div className="flex justify-center gap-8 mt-6">
                    {/* Show moves if available */}
                     {/* This would require reconstructing moves from gameState history which might be messy here, 
                         so we stick to the main result message. */}
                </div>
             </div>
        </div>
      )}

      {/* Game Status */}
      <div className="mb-6 text-center">
        {match.winner ? (
          <div className="text-2xl font-bold text-green-400">
            {match.players?.[gameState.winner]?.name || 'Player'} Wins! 🎉
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-xl font-semibold">
              🎮 Rock Paper Scissors
            </div>
            <div className="text-2xl font-bold text-blue-400">
              Round {gameState.round || 1}
            </div>
            {hasPlayerMoved ? (
              <div className="text-yellow-400">
                ⏳ Waiting for opponent...
              </div>
            ) : (
              <div className="text-green-400">
                Choose your move!
              </div>
            )}
          </div>
        )}
      </div>

      {/* Player Scores */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {match.players?.map((player, idx) => {
          const isCurrentPlayer = player._id?.toString() === userId;
          return (
            <div
              key={player._id || idx}
              className={`p-4 rounded-lg ${
                isCurrentPlayer ? 'bg-blue-900/50 border border-blue-500' : 'bg-gray-700'
              }`}
            >
              <div className="font-semibold">
                {player.name}
                {isCurrentPlayer && <span className="text-blue-400 text-sm ml-2">(You)</span>}
              </div>
              <div className="text-3xl font-bold text-yellow-400">
                {match.score?.[`player${idx + 1}`] || 0}
              </div>
              <div className="text-xs text-gray-400">rounds won</div>
            </div>
          );
        })}
      </div>

      {/* Move Selection */}
      {!gameState.winner && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4 text-center">
            {hasPlayerMoved ? 'Your Move (Hidden)' : 'Select Your Move'}
          </h3>
          <div className="grid grid-cols-3 gap-4">
            {moves.map((move) => (
              <button
                key={move.value}
                onClick={() => handleMoveSelection(move.value)}
                disabled={hasPlayerMoved || makingMove || playerIndex === -1}
                className={`
                  p-6 rounded-lg text-center transition-all
                  ${hasPlayerMoved || playerIndex === -1
                    ? 'bg-gray-800 cursor-not-allowed opacity-50'
                    : 'bg-gray-700 hover:bg-gray-600 cursor-pointer hover:scale-105'
                  }
                  ${selectedMove === move.value ? 'ring-2 ring-blue-500' : ''}
                  ${makingMove ? 'animate-pulse' : ''}
                `}
              >
                <div className="text-6xl mb-2">{move.icon}</div>
                <div className="font-semibold">{move.name}</div>
              </button>
            ))}
          </div>
          {playerIndex === -1 && (
            <p className="text-center text-red-400 text-sm mt-4">
              You are not a player in this match
            </p>
          )}
        </div>
      )}

      {/* Round Results */}
      {gameState.results && gameState.results.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-3">Round History</h3>
          <div className="space-y-2">
            {gameState.results.map((result, idx) => (
              <div key={idx} className="flex justify-between items-center p-2 bg-gray-700 rounded">
                <span className="text-gray-400">Round {idx + 1}</span>
                <span className="flex items-center gap-4">
                  <span>{result.player1Move}</span>
                  <span className="text-gray-500">vs</span>
                  <span>{result.player2Move}</span>
                </span>
                <span className="font-semibold">
                  {result.winner === null ? '🤝 Draw' : `🎉 P${result.winner + 1} Wins`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Debug Info */}
      {process.env.NODE_ENV === 'development' && (
        <details className="mt-6 p-4 bg-gray-900 rounded-lg text-xs">
          <summary className="font-bold mb-2 cursor-pointer text-yellow-400">🔧 Debug Info</summary>
          <div className="mt-2 space-y-1 text-gray-300">
            <div>Match Status: {match.status}</div>
            <div>User ID: {userId || 'null'}</div>
            <div>Your Player Index: {playerIndex}</div>
            <div>Has Moved: {hasPlayerMoved ? 'Yes' : 'No'}</div>
            <div>Both Moved: {bothPlayersMoved ? 'Yes' : 'No'}</div>
            <div>Current Round: {gameState.round}</div>
            <div>Moves: {JSON.stringify(gameState.moves)}</div>
          </div>
        </details>
      )}
    </div>
  );
};

export default RPS;
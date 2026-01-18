import React, { useState, useEffect } from 'react';
import { useAuth } from '../Auth/AuthContext';
import { apiService } from '../APIs/apiService';

const TicTacToeBoard = ({ matchId, onMatchUpdate }) => {
  const { currentUser } = useAuth();
  const [match, setMatch] = useState(null);
  const [gameState, setGameState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [makingMove, setMakingMove] = useState(false);

  useEffect(() => {
    if (matchId) {
      fetchMatchState();
      const interval = setInterval(fetchMatchState, 3000);
      return () => clearInterval(interval);
    }
  }, [matchId]);

  const fetchMatchState = async () => {
    try {
      const data = await apiService.matches.getState(matchId);
      console.log('Match state received:', data);
      
      setMatch(data);
      
      const state = data.currentGameState;
      
      if (!state) {
        console.warn('No game state in response');
        setGameState({
          board: Array(9).fill(null),
          currentPlayer: 0,
          winner: null,
          isDraw: false
        });
      } else {
        setGameState(state);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching match state:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCellClick = async (index) => {
    if (!match || !gameState || !currentUser) {
      console.log('Missing data:', { match, gameState, currentUser });
      return;
    }

    if (makingMove) {
      console.log('Already making a move');
      return;
    }

    if (match.status !== 'live') {
      console.log('Match is not live:', match.status);
      return;
    }

    if (gameState.board[index] !== null) {
      console.log('Cell already occupied');
      return;
    }

    if (gameState.winner || gameState.isDraw) {
      console.log('Game is over');
      return;
    }

    // FIX: Check using match.currentTurn (player ID), not gameState.currentPlayer (index)
    const isMyTurn = match.currentTurn?.toString() === currentUser._id?.toString();
    
    if (!isMyTurn) {
      console.log('Not your turn - currentTurn:', match.currentTurn, 'your ID:', currentUser._id);
      return;
    }

    // Make the move
    try {
      setMakingMove(true);
      console.log('Making move at position:', index);

      await apiService.matches.makeMove(matchId, {
        move: index
      });

      console.log('Move made successfully');
      
      await fetchMatchState();
      
      if (onMatchUpdate) {
        onMatchUpdate();
      }
    } catch (err) {
      console.error('Error making move:', err);
      setError(err.message);
    } finally {
      setMakingMove(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500 rounded-lg p-4">
        <p className="text-red-500">Error: {error}</p>
        <button
          onClick={fetchMatchState}
          className="mt-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!match || !gameState) {
    return (
      <div className="text-center p-8 text-gray-400">
        <p>Unable to load game state</p>
      </div>
    );
  }

  const playerIndex = match.players?.findIndex(p => p._id === currentUser?._id) ?? -1;
  
  // FIX: Use match.currentTurn to determine whose turn it is
  const isMyTurn = match.currentTurn?.toString() === currentUser?._id?.toString();
  
  // Find which player's turn it is based on currentTurn
  const currentTurnPlayerIndex = match.players?.findIndex(
    p => p._id?.toString() === match.currentTurn?.toString()
  ) ?? -1;
  
  const currentPlayerName = match.players?.[currentTurnPlayerIndex]?.name || 'Unknown';

  const getCellSymbol = (value) => {
    if (value === null) return '';
    // Value is 'X' or 'O' string
    return value;
  };

  const getCellColor = (value) => {
    if (value === null) return '';
    return value === 'X' ? 'text-blue-500' : 'text-red-500';
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Game Status */}
      <div className="mb-6 text-center">
        {gameState.winner ? (
          <div className="text-2xl font-bold text-green-400">
            {match.players?.find(p => p._id?.toString() === gameState.winner?.toString())?.name || 'Player'} Wins! 🎉
          </div>
        ) : gameState.isDraw ? (
          <div className="text-2xl font-bold text-yellow-400">
            It's a Draw! 🤝
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-xl font-semibold">
              Current Turn: {currentPlayerName}
            </div>
            {isMyTurn && (
              <div className="text-green-400 font-medium">
                Your turn! Make your move
              </div>
            )}
            {!isMyTurn && playerIndex !== -1 && (
              <div className="text-gray-400">
                Waiting for opponent...
              </div>
            )}
          </div>
        )}
      </div>

      {/* Player Info */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {match.players?.map((player, idx) => (
          <div
            key={player._id}
            className={`p-4 rounded-lg ${
              match.currentTurn?.toString() === player._id?.toString() && !gameState.winner && !gameState.isDraw
                ? 'bg-blue-600'
                : 'bg-gray-700'
            }`}
          >
            <div className="font-semibold">{player.name}</div>
            <div className="text-2xl font-bold">
              {gameState.players?.[player._id] || (idx === 0 ? 'X' : 'O')}
            </div>
            {playerIndex === idx && (
              <div className="text-sm text-green-400">You</div>
            )}
          </div>
        ))}
      </div>

      {/* Tic Tac Toe Board */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        {gameState.board.map((cell, index) => (
          <button
            key={index}
            onClick={() => handleCellClick(index)}
            disabled={
              cell !== null ||
              !isMyTurn ||
              gameState.winner !== null ||
              gameState.isDraw ||
              makingMove ||
              playerIndex === -1
            }
            className={`
              aspect-square flex items-center justify-center
              text-6xl font-bold rounded-lg
              transition-all duration-200
              ${cell === null && isMyTurn && !gameState.winner && !gameState.isDraw
                ? 'bg-gray-700 hover:bg-gray-600 cursor-pointer'
                : 'bg-gray-800 cursor-not-allowed'
              }
              ${getCellColor(cell)}
              ${makingMove ? 'opacity-50' : ''}
            `}
          >
            {getCellSymbol(cell)}
          </button>
        ))}
      </div>

      {/* Debug Info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-6 p-4 bg-gray-800 rounded-lg text-xs">
          <div className="font-bold mb-2">Debug Info:</div>
          <div>Match Status: {match.status}</div>
          <div>Current Turn (ID): {match.currentTurn}</div>
          <div>Your ID: {currentUser._id}</div>
          <div>Is Your Turn: {isMyTurn ? 'Yes' : 'No'}</div>
          <div>Your Player Index: {playerIndex}</div>
          <div>Winner: {gameState.winner || 'None'}</div>
          <div>Is Draw: {gameState.isDraw ? 'Yes' : 'No'}</div>
          <div>Making Move: {makingMove ? 'Yes' : 'No'}</div>
        </div>
      )}
    </div>
  );
};

export default TicTacToeBoard;
import React, { useState, useEffect } from 'react';
import { useAuth } from '../Auth/AuthContext';

const TicTacToeBoard = ({ match, makeMove, isConnected }) => {
  const { currentUser } = useAuth();
  // We don't need local state for the match data anymore, it comes from props
  const [localMakingMove, setLocalMakingMove] = useState(false);

  // Derived state from props
  const gameState = match?.currentGameState || {
    board: Array(9).fill(null),
    currentPlayer: 0,
    winner: null,
    isDraw: false
  };

  const handleCellClick = async (index) => {
    if (!match || !gameState || !currentUser) return;

    if (localMakingMove) return;

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

    // Check turn
    const isMyTurn = match.currentTurn?.toString() === currentUser._id?.toString();
    
    if (!isMyTurn) {
        console.log('Not your turn');
        return;
    }

    // Make the move via socket function passed from parent
    try {
      setLocalMakingMove(true);
      console.log('Making move at position:', index);
      
      // The parent's makeMove function handles the socket emission
      makeMove(index);

      // Note: We don't wait for 'success' here because socket is fire-and-forget in this context
      // The state will update when the server broadcasts the new state
    } catch (err) {
      console.error('Error making move:', err);
    } finally {
      // Small timeout to prevent double clicks before state update arrives
      setTimeout(() => setLocalMakingMove(false), 500);
    }
  };

  if (!match) {
    return (
      <div className="text-center p-8 text-gray-400">
        <p>Waiting for match data...</p>
      </div>
    );
  }

  const playerIndex = match.players?.findIndex(p => p._id === currentUser?._id) ?? -1;
  const isMyTurn = match.currentTurn?.toString() === currentUser?._id?.toString();
  
  // Find which player's turn it is based on currentTurn
  const currentTurnPlayerIndex = match.players?.findIndex(
    p => p._id?.toString() === match.currentTurn?.toString()
  ) ?? -1;
  
  const currentPlayerName = match.players?.[currentTurnPlayerIndex]?.name || 'Unknown';

  const getCellSymbol = (value) => {
    if (value === null) return '';
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
              <div className="text-green-400 font-medium animate-pulse">
                Your turn! Make your move
              </div>
            )}
            {!isMyTurn && playerIndex !== -1 && (
              <div className="text-gray-400">
                Waiting for opponent...
              </div>
            )}
             {!isConnected && (
                <div className="text-red-400 text-sm">
                    Disconnected from server
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
            className={`p-4 rounded-lg transition-colors border-2 ${
              match.currentTurn?.toString() === player._id?.toString() && !gameState.winner && !gameState.isDraw
                ? 'bg-blue-600/20 border-blue-500'
                : 'bg-gray-700/50 border-transparent'
            }`}
          >
            <div className="font-semibold">{player.name}</div>
            <div className={`text-2xl font-bold ${idx === 0 ? 'text-blue-500' : 'text-red-500'}`}>
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
              localMakingMove ||
              playerIndex === -1 ||
              !isConnected
            }
            className={`
              aspect-square flex items-center justify-center
              text-6xl font-bold rounded-lg
              transition-all duration-200
              ${cell === null && isMyTurn && !gameState.winner && !gameState.isDraw
                ? 'bg-gray-700 hover:bg-gray-600 cursor-pointer hover:scale-105'
                : 'bg-gray-800'
              }
              ${cell !== null ? 'bg-gray-800/80' : ''}
              ${getCellColor(cell)}
              ${(localMakingMove || !isConnected) ? 'opacity-50 cursor-not-allowed' : ''}
              ${(!isMyTurn && cell === null) ? 'cursor-default' : ''}
            `}
          >
            {getCellSymbol(cell)}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TicTacToeBoard;
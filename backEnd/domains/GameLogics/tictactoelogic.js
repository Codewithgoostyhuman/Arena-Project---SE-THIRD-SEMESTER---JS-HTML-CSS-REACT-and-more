class TicTacToeLogic {
  
  /**
   * Initialize a new TicTacToe game
   */
  static initializeGame(players) {
    // FIX: Store the first player's ID, not index 0
    return {
      board: Array(9).fill(null),
      currentPlayer: players[0]._id, // ← Changed from 0 to actual player ID
      players: {
        [players[0]._id]: 'X',
        [players[1]._id]: 'O'
      },
      playerIds: [players[0]._id, players[1]._id],
      gameOver: false,
      winner: null,
      winningLine: null,
      isDraw: false
    };
  }
  
  /**
   * Process a move
   */
  static processMove(gameState, playerId, move, players) {
    // Validate move
    if (gameState.gameOver) {
      throw new Error('Game is already over');
    }
    
    // FIX: Proper comparison of player IDs
    if (gameState.currentPlayer.toString() !== playerId.toString()) {
      throw new Error('Not your turn');
    }
    
    // 'move' is just the position number, not an object
    const position = move;
    
    if (position < 0 || position > 8) {
      throw new Error('Invalid position');
    }
    
    if (gameState.board[position] !== null) {
      throw new Error('Position already taken');
    }
    
    // Make the move
    const newBoard = [...gameState.board];
    newBoard[position] = gameState.players[playerId];
    
    // Check for winner
    const winResult = this._checkWinner(newBoard);
    
    // Determine next player
    const currentPlayerIndex = gameState.playerIds.findIndex(
      id => id.toString() === playerId.toString()
    );
    const nextPlayerIndex = (currentPlayerIndex + 1) % 2;
    const nextPlayer = gameState.playerIds[nextPlayerIndex];
    
    // Build new state
    const newState = {
      ...gameState,
      board: newBoard,
      currentPlayer: nextPlayer, // This is now a player ID, not an index
      gameOver: winResult.gameOver,
      winner: winResult.winner ? 
        gameState.playerIds.find(id => gameState.players[id] === winResult.winner) : null,
      winningLine: winResult.winningLine,
      isDraw: winResult.isDraw
    };
    
    return {
      newState,
      nextPlayer,
      gameOver: newState.gameOver,
      winner: newState.winner,
      isDraw: newState.isDraw,
      validMove: true
    };
  }
  
  /**
   * Check if there's a winner
   */
  static _checkWinner(board) {
    const winningCombinations = [
      [0, 1, 2], // Top row
      [3, 4, 5], // Middle row
      [6, 7, 8], // Bottom row
      [0, 3, 6], // Left column
      [1, 4, 7], // Middle column
      [2, 5, 8], // Right column
      [0, 4, 8], // Diagonal
      [2, 4, 6]  // Anti-diagonal
    ];
    
    for (const combination of winningCombinations) {
      const [a, b, c] = combination;
      
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return {
          gameOver: true,
          winner: board[a], // 'X' or 'O'
          winningLine: combination,
          isDraw: false
        };
      }
    }
    
    // Check for draw
    const isBoardFull = board.every(cell => cell !== null);
    
    if (isBoardFull) {
      return {
        gameOver: true,
        winner: null,
        winningLine: null,
        isDraw: true
      };
    }
    
    // Game continues
    return {
      gameOver: false,
      winner: null,
      winningLine: null,
      isDraw: false
    };
  }
}

export default TicTacToeLogic;
// backEnd/domains/GameLogics/rockpaperscissorslogic.js

class RockPaperScissorsLogic {
  
  /**
   * Initialize a new Rock Paper Scissors game
   */
  initializeGame(players, roundNumber = 1) {
    return {
      players: {
        [players[0]._id]: {
          name: players[0].name,
          choice: null,
          ready: false
        },
        [players[1]._id]: {
          name: players[1].name,
          choice: null,
          ready: false
        }
      },
      playerIds: [players[0]._id, players[1]._id],
      playerIds: [players[0]._id, players[1]._id],
      currentPlayer: null, // Both play simultaneously
      round: roundNumber,
      gameOver: false,
      winner: null,
      result: null, // 'player1_wins', 'player2_wins', 'draw'
      choices: ['rock', 'paper', 'scissors']
    };
  }
  
  /**
   * Process a move (choice submission)
   */
  processMove(gameState, playerId, move, players) {
    // Validate move
    if (gameState.gameOver) {
      throw new Error('Game is already over');
    }
    
    const { choice } = move; // 'rock', 'paper', or 'scissors'
    
    if (!['rock', 'paper', 'scissors'].includes(choice)) {
      throw new Error('Invalid choice. Must be rock, paper, or scissors');
    }
    
    if (gameState.players[playerId].choice !== null) {
      throw new Error('You have already made your choice');
    }
    
    // Record player's choice
    const newState = {
      ...gameState,
      players: {
        ...gameState.players,
        [playerId]: {
          ...gameState.players[playerId],
          choice: choice,
          ready: true
        }
      }
    };
    
    // Check if both players have chosen
    const allReady = newState.playerIds.every(
      id => newState.players[id].ready
    );
    
    if (allReady) {
      // Determine winner
      const result = this._determineWinner(newState);
      
      return {
        newState: {
          ...newState,
          gameOver: true,
          winner: result.winner,
          result: result.result
        },
        nextPlayer: null,
        gameOver: true,
        winner: result.winner,
        isDraw: result.isDraw,
        validMove: true,
        choices: {
          [newState.playerIds[0]]: newState.players[newState.playerIds[0]].choice,
          [newState.playerIds[1]]: newState.players[newState.playerIds[1]].choice
        },
        result: result.result
      };
    }
    
    // Waiting for other player
    return {
      newState,
      nextPlayer: null, // No turns in RPS
      gameOver: false,
      winner: null,
      isDraw: false,
      validMove: true,
      waitingForOpponent: true
    };
  }
  
  /**
   * Determine the winner based on choices
   */
  _determineWinner(gameState) {
    const [player1Id, player2Id] = gameState.playerIds;
    const choice1 = gameState.players[player1Id].choice;
    const choice2 = gameState.players[player2Id].choice;
    
    // Draw
    if (choice1 === choice2) {
      return {
        winner: null,
        isDraw: true,
        result: 'draw'
      };
    }
    
    // Determine winner
    const winConditions = {
      rock: 'scissors',
      paper: 'rock',
      scissors: 'paper'
    };
    
    if (winConditions[choice1] === choice2) {
      return {
        winner: player1Id,
        isDraw: false,
        result: 'player1_wins'
      };
    } else {
      return {
        winner: player2Id,
        isDraw: false,
        result: 'player2_wins'
      };
    }
  }
}

export default new RockPaperScissorsLogic();
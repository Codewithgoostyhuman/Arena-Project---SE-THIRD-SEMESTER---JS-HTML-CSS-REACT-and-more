// backEnd/domains/GameLogics/numberguessduellogic.js

class NumberGuessDuelLogic {
  
  /**
   * Initialize a new Number Guess Duel game
   * Players take turns guessing a number between 1-100
   * Closer guess wins the round
   */
  initializeGame(players) {
    const targetNumber = Math.floor(Math.random() * 100) + 1; // 1-100
    
    return {
      players: {
        [players[0]._id]: {
          name: players[0].name,
          guess: null,
          distance: null
        },
        [players[1]._id]: {
          name: players[1].name,
          guess: null,
          distance: null
        }
      },
      playerIds: [players[0]._id, players[1]._id],
      currentPlayer: players[0]._id,
      targetNumber: targetNumber, // Hidden from players
      round: 1,
      maxRounds: 5,
      scores: {
        [players[0]._id]: 0,
        [players[1]._id]: 0
      },
      gameOver: false,
      winner: null,
      bothGuessed: false
    };
  }
  
  /**
   * Process a guess
   */
  processMove(gameState, playerId, move, players) {
 const guess = Number(move); // parse and use directly
  console.log('Received guess:', guess, 'type:', typeof guess);

  if (isNaN(guess) || guess < 1 || guess > 100) {
    throw new Error("Guess must be a number between 1 and 100");
  }
  console.log('Current target number:', gameState.targetNumber);

  // Validate game state
  if (gameState.gameOver) {
    throw new Error('Game is already over');
  }

  if (gameState.players[playerId].guess !== null) {
    throw new Error('You have already made your guess this round');
  }

  // Record player's guess
  const distance = Math.abs(gameState.targetNumber - guess);
    
    const newState = {
      ...gameState,
      players: {
        ...gameState.players,
        [playerId]: {
          ...gameState.players[playerId],
          guess: guess,
          distance: distance
        }
      }
    };
    
    // Check if both players have guessed
    const bothGuessed = newState.playerIds.every(
      id => newState.players[id].guess !== null
    );
    
    newState.bothGuessed = bothGuessed;
    
    if (bothGuessed) {
      // Determine round winner
      const result = this._determineRoundWinner(newState);
      
      // Update scores
      if (result.roundWinner) {
        newState.scores[result.roundWinner]++;
      }
      
      // Check if game is over
      const gameResult = this._checkGameOver(newState);
      
      if (gameResult.gameOver) {
        return {
          newState: {
            ...newState,
            gameOver: true,
            winner: gameResult.winner
          },
          nextPlayer: null,
          gameOver: true,
          winner: gameResult.winner,
          isDraw: gameResult.isDraw,
          validMove: true,
          roundResult: result,
          targetNumber: newState.targetNumber
        };
      }
      
      // Start new round
      const newTargetNumber = Math.floor(Math.random() * 100) + 1;
      
      return {
        newState: {
          ...newState,
          round: newState.round + 1,
          targetNumber: newTargetNumber,
          players: {
            [newState.playerIds[0]]: {
              ...newState.players[newState.playerIds[0]],
              guess: null,
              distance: null
            },
            [newState.playerIds[1]]: {
              ...newState.players[newState.playerIds[1]],
              guess: null,
              distance: null
            }
          },
          bothGuessed: false,
          currentPlayer: newState.playerIds[0]
        },
        nextPlayer: newState.playerIds[0],
        gameOver: false,
        winner: null,
        validMove: true,
        roundResult: result,
        previousTargetNumber: newState.targetNumber,
        newRound: true
      };
    }
    
    // Switch to next player
    const currentPlayerIndex = newState.playerIds.findIndex(
      id => id.toString() === playerId.toString()
    );
    const nextPlayerIndex = (currentPlayerIndex + 1) % 2;
    const nextPlayer = newState.playerIds[nextPlayerIndex];
    
    return {
      newState: {
        ...newState,
        currentPlayer: nextPlayer
      },
      nextPlayer,
      gameOver: false,
      winner: null,
      validMove: true,
      waitingForOpponent: false
    };
  }
  
  /**
   * Determine round winner
   */
  _determineRoundWinner(gameState) {
    const [player1Id, player2Id] = gameState.playerIds;
    const distance1 = gameState.players[player1Id].distance;
    const distance2 = gameState.players[player2Id].distance;
    
    if (distance1 < distance2) {
      return {
        roundWinner: player1Id,
        isDraw: false,
        winner: 'player1',
        distances: { player1: distance1, player2: distance2 }
      };
    } else if (distance2 < distance1) {
      return {
        roundWinner: player2Id,
        isDraw: false,
        winner: 'player2',
        distances: { player1: distance1, player2: distance2 }
      };
    } else {
      return {
        roundWinner: null,
        isDraw: true,
        winner: 'draw',
        distances: { player1: distance1, player2: distance2 }
      };
    }
  }
  
  /**
   * Check if game is over
   */
  _checkGameOver(gameState) {
    const [player1Id, player2Id] = gameState.playerIds;
    const score1 = gameState.scores[player1Id];
    const score2 = gameState.scores[player2Id];
    
    // Game ends after maxRounds or if one player has majority
    const roundsRemaining = gameState.maxRounds - gameState.round;
    const scoreDiff = Math.abs(score1 - score2);
    
    // Someone has won majority
    if (score1 > gameState.maxRounds / 2) {
      return { gameOver: true, winner: player1Id, isDraw: false };
    }
    
    if (score2 > gameState.maxRounds / 2) {
      return { gameOver: true, winner: player2Id, isDraw: false };
    }
    
    // All rounds played
    if (gameState.round >= gameState.maxRounds) {
      if (score1 > score2) {
        return { gameOver: true, winner: player1Id, isDraw: false };
      } else if (score2 > score1) {
        return { gameOver: true, winner: player2Id, isDraw: false };
      } else {
        return { gameOver: true, winner: null, isDraw: true };
      }
    }
    
    return { gameOver: false, winner: null, isDraw: false };
  }
}

export default new NumberGuessDuelLogic();
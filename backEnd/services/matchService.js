import Match from '../schemas/MatchSchema.js';
import Game from '../schemas/GameSchema.js';
import User from '../schemas/UserSchema.js';
import tournamentBracketService from './tournamentBracketService.js';

// Import game logic engines
import TicTacToeLogic from '../domains/GameLogics/tictactoelogic.js';
import RockPaperScissorsLogic from '../domains/GameLogics/rockpaperscissorslogic.js';
import NumberGuessDuelLogic from '../domains/GameLogics/numberguessduellogic.js';

class MatchGameService {
  
  /**
   * Initialize a match and start the first game
   */
  async startMatch(matchId) {
    const match = await Match.findById(matchId)
      .populate('players')
      .populate('game');
    
    if (!match) {
      throw new Error('Match not found');
    }
    
    if (match.players.length !== 2) {
      throw new Error('Match needs exactly 2 players');
    }
    
    if (match.status !== 'pending' && match.status !== 'ready') {
      throw new Error('Match already started or finished');
    }
    
    // Initialize first game
    const gameState = this._initializeGameState(match.game.type, match.players, 1);
    
    // Set currentTurn based on game type
    // For simultaneous games (RPS, NumberGuessDuel), currentPlayer is null
    // So we default to first player for tracking purposes
    const currentTurnPlayerId = gameState.currentPlayer || match.players[0]._id;
    
    // Update match
    match.status = 'live';
    match.startedAt = new Date();
    match.currentGameState = gameState;
    match.currentTurn = currentTurnPlayerId;
    match.games = [{
      gameNumber: 1,
      gameState: gameState,
      moves: []
    }];
    
    await match.save();
    
    console.log('Match started:', {
      matchId: match._id,
      gameType: match.game.type,
      currentTurn: match.currentTurn,
      gameStateCurrentPlayer: gameState.currentPlayer
    });
    
    return match;
  }
  

  /**
   * Process a player's move
   */
 async processMove(matchId, playerId, move) {
    console.log('=== PROCESS MOVE ===');
    console.log('Match ID:', matchId);
    console.log('Player ID:', playerId);
    console.log('Move:', move);
    
    const match = await Match.findById(matchId)
      .populate('players')
      .populate('game');
    
    if (!match) {
      throw new Error('Match not found');
    }
    
    // Auto-start match if it's not live yet
    if (match.status === 'pending' || match.status === 'ready') {
      console.log('⚠️ Match not started yet - auto-starting now');
      const startedMatch = await this.startMatch(matchId);
      // Re-fetch to get the updated match
      const updatedMatch = await Match.findById(matchId)
        .populate('players')
        .populate('game');
      Object.assign(match, updatedMatch);
    }
    
    if (match.status !== 'live') {
      throw new Error('Match is not active');
    }
    
    console.log('Current turn:', match.currentTurn);
    console.log('Current game state:', match.currentGameState);
    
    // If game state doesn't exist, initialize it
    if (!match.currentGameState) {
      console.log('⚠️ No game state found - initializing now');
      const gameState = this._initializeGameState(match.game.type, match.players, 1);
      match.currentGameState = gameState;
      match.currentTurn = gameState.currentPlayer;
      
      match.games = [{
        gameNumber: 1,
        gameState: gameState,
        moves: []
      }];
      
      await match.save();
    }
    
    // If currentTurn is not set, initialize it from gameState
    if (!match.currentTurn && match.currentGameState) {
      console.log('⚠️ currentTurn is null, using currentPlayer from gameState');
      match.currentTurn = match.currentGameState.currentPlayer;
      await match.save();
    }
    
    // Validate playerId
    if (!playerId) {
      throw new Error('Player ID is required');
    }
    
    // Final validation - currentTurn must exist
    if (!match.currentTurn) {
      // Last resort: set it to the first player
      console.log('⚠️ Still no currentTurn - setting to first player');
      match.currentTurn = match.players[0]._id;
      await match.save();
    }
    
    if (!match.currentTurn) {
      console.error('Match data:', {
        id: match._id,
        status: match.status,
        players: match.players.map(p => ({ id: p._id, name: p.name })),
        currentGameState: match.currentGameState,
        currentTurn: match.currentTurn
      });
      throw new Error('Unable to determine current turn. Please contact support.');
    }
    
    // Convert to strings for comparison
    const currentTurnStr = match.currentTurn.toString();
    const playerIdStr = playerId.toString();
    
    console.log('Comparing turns:', { currentTurnStr, playerIdStr });
    
    // For simultaneous move games (RPS, NumberGuessDuel), skip turn validation
    const simultaneousMoveGames = ['RockPaperScissors', 'NumberGuessDuel'];
    const isSimultaneousGame = simultaneousMoveGames.includes(match.game.type);
    
    if (!isSimultaneousGame && currentTurnStr !== playerIdStr) {
      throw new Error('Not your turn');
    }
    
    // Verify player is in the match
    const isPlayerInMatch = match.players.some(p => 
      p._id.toString() === playerIdStr
    );
    
    if (!isPlayerInMatch) {
      throw new Error('You are not a player in this match');
    }
    
    // Get current game
    const currentGame = match.games[match.games.length - 1];
    
    if (!currentGame) {
      throw new Error('No active game found');
    }
    
    // Process move based on game type
    const result = await this._processMoveByGameType(
      match.game.type,
      currentGame.gameState,
      playerId,
      move,
      match.players
    );
    
    console.log('Move processed:', result);
    
    // Record the move
    currentGame.moves.push({
      player: playerId,
      move: move,
      timestamp: new Date()
    });
    
    // Update game state
    currentGame.gameState = result.newState;
    match.currentGameState = result.newState;
    
    // Update current turn
    if (result.nextPlayer) {
      match.currentTurn = result.nextPlayer;
    }
    
    // Check if game is over
    if (result.gameOver) {
      await this._handleGameEnd(match, currentGame, result.winner);
    }
    
    await match.save();
    
    return {
      match,
      moveResult: result
    };
  }
  
  /**
   * Initialize game state based on game type
   */
  _initializeGameState(gameType, players, roundNumber = 1) {
    switch (gameType) {
      case 'TicTacToe':
        return TicTacToeLogic.initializeGame(players, roundNumber);
      
      case 'RockPaperScissors':
        return RockPaperScissorsLogic.initializeGame(players, roundNumber);
      
      case 'NumberGuessDuel':
        return NumberGuessDuelLogic.initializeGame(players, roundNumber);
      
      default:
        throw new Error(`Unknown game type: ${gameType}`);
    }
  }
  
  /**
   * Process move based on game type
   */
  async _processMoveByGameType(gameType, gameState, playerId, move, players) {
    switch (gameType) {
      case 'TicTacToe':
        return TicTacToeLogic.processMove(gameState, playerId, move, players);
      
      case 'RockPaperScissors':
        return RockPaperScissorsLogic.processMove(gameState, playerId, move, players);
      
      case 'NumberGuessDuel':
        return NumberGuessDuelLogic.processMove(gameState, playerId, move, players);
      
      default:
        throw new Error(`Unknown game type: ${gameType}`);
    }
  }
  
  /**
   * Handle when a single game ends
   */
  async _handleGameEnd(match, currentGame, winnerId) {
    currentGame.winner = winnerId;
    currentGame.completedAt = new Date();

    // Update scores
    let winnerIndex = -1;
    if (winnerId) {
      winnerIndex = match.players.findIndex(p => p._id.toString() === winnerId.toString());
      
      if (winnerIndex === 0) {
        match.score.player1++;
      } else {
        match.score.player2++;
      }
    }
    
    // Check if match is over (best of X OR if we've played max games)
    const gamesNeededToWin = Math.ceil(match.bestOf / 2);
    const maxGamesReached = match.games.length >= match.bestOf;
    
    if (match.score.player1 >= gamesNeededToWin || match.score.player2 >= gamesNeededToWin || maxGamesReached) {
      // Determines match winner based on score
      let matchWinner = null;
      let isMatchDraw = false;

      if (match.score.player1 > match.score.player2) {
        matchWinner = match.players[0]._id;
      } else if (match.score.player2 > match.score.player1) {
        matchWinner = match.players[1]._id;
      } else {
        // Scores are equal -> Match Draw
        isMatchDraw = true;
      }

      await this._handleMatchEnd(match, matchWinner, isMatchDraw);
    } else {
      // Start next game
      const nextGameNumber = match.games.length + 1;
      const nextGameState = this._initializeGameState(match.game.type, match.players, nextGameNumber);
      match.currentGameState = nextGameState;
      // ✅ FIX: nextGameState.currentPlayer is already a player ID
      match.currentTurn = nextGameState.currentPlayer;
      
      match.games.push({
        gameNumber: nextGameNumber,
        gameState: nextGameState,
        moves: []
      });
    }
  }
  
  /**
   * Handle when entire match ends
   */
  async _handleMatchEnd(match, winnerId, isDraw = false) {
    return this.resolveMatch(match._id, winnerId, isDraw);
  }

  /**
   * Resolve a match manually or automatically
   * Updates status, calculates stats, and advances bracket
   */
  async resolveMatch(matchId, winnerId, isDraw = false) {
    const match = await Match.findById(matchId)
      .populate('players')
      .populate({
        path: 'league',
        populate: { path: 'ratingFormula' }
      });

    if (!match) throw new Error('Match not found');

    // Update match status
    match.status = 'finished';
    match.completedAt = new Date();
    match.isDraw = isDraw;

    if (!isDraw && winnerId) {
      match.winner = winnerId;
      match.loser = match.players.find(p => p._id.toString() !== winnerId.toString())?._id;
    }

    await match.save();

    // Calculate Stats
    const formula = match?.league?.ratingFormula || { winnerScore: 3, loserScore: 0, drawScore: 1 };
    
    if (isDraw) {
      // Draw: Update both players
      for (const player of match.players) {
        await User.findByIdAndUpdate(player._id, {
          $inc: { 'stats.draws': 1, 'stats.points': formula.drawScore }
        });
      }
    } else if (winnerId) {
      // Winner/Loser
      const loserId = match.players.find(p => p._id.toString() !== winnerId.toString())?._id;
      
      await User.findByIdAndUpdate(winnerId, {
        $inc: { 'stats.wins': 1, 'stats.points': formula.winnerScore }
      });
      
      if (loserId) {
        await User.findByIdAndUpdate(loserId, {
          $inc: { 'stats.losses': 1, 'stats.points': formula.loserScore }
        });
      }
    }

    // Advance Bracket if Tournament
    if (match.tournament && match.winner) {
      await tournamentBracketService.advanceWinner(match._id, match.winner);
    }
    
    return match;
  }
  
  /**
   * Get match state for spectators/players
   */
  async getMatchState(matchId) {
    const match = await Match.findById(matchId)
      .populate('players', 'name stats')
      .populate('winner', 'name')
      .populate('game');
    
    if (!match) {
      throw new Error('Match not found');
    }
    
    // If match is live but has no game state, initialize it
    if (match.status === 'live' && !match.currentGameState) {
      console.log('⚠️ Match is live but missing game state - initializing now');
      
      if (!match.game) {
        console.error('❌ Cannot initialize match state: match.game is NULL', { matchId });
        throw new Error('Match game configuration is missing');
      }

      try {
        const gameState = this._initializeGameState(match.game.type, match.players, 1);
        
        // ✅ FIX: gameState.currentPlayer is already a player ID, not an index
        const currentTurnPlayerId = gameState.currentPlayer;
        
        // Use atomic update to avoid version conflicts
        const updatedMatch = await Match.findOneAndUpdate(
          { 
            _id: matchId,
            status: 'live',
            $or: [
              { currentGameState: { $exists: false } },
              { currentGameState: null }
            ]
          },
          {
            $set: {
              currentGameState: gameState,
              currentTurn: currentTurnPlayerId  // ← Now using the correct player ID
            },
            $push: {
              games: {
                gameNumber: 1,
                gameState: gameState,
                moves: []
              }
            }
          },
          { 
            new: true,
            runValidators: false
          }
        )
        .populate('players', 'name stats')
        .populate('winner', 'name')
        .populate('game');
        
        if (updatedMatch) {
          console.log('✅ Game state initialized successfully');
          console.log('Current turn set to:', updatedMatch.currentTurn);
          return {
            matchId: updatedMatch._id,
            players: updatedMatch.players,
            game: updatedMatch.game,
            status: updatedMatch.status,
            score: updatedMatch.score,
            currentGameState: updatedMatch.currentGameState,
            currentTurn: updatedMatch.currentTurn,
            round: updatedMatch.round,
            matchNumber: updatedMatch.matchNumber,
            bestOf: updatedMatch.bestOf,
            winner: updatedMatch.winner,
            isFinals: updatedMatch.isFinals
          };
        }
        
        // If no update happened, re-fetch
        const refetchedMatch = await Match.findById(matchId)
          .populate('players', 'name stats')
          .populate('winner', 'name')
          .populate('game');
        
        if (refetchedMatch && refetchedMatch.currentGameState) {
          console.log('✅ Game state already initialized by another request');
          return {
            matchId: refetchedMatch._id,
            players: refetchedMatch.players,
            game: refetchedMatch.game,
            status: refetchedMatch.status,
            score: refetchedMatch.score,
            currentGameState: refetchedMatch.currentGameState,
            currentTurn: refetchedMatch.currentTurn,
            round: refetchedMatch.round,
            matchNumber: refetchedMatch.matchNumber,
            bestOf: refetchedMatch.bestOf,
            winner: refetchedMatch.winner,
            isFinals: refetchedMatch.isFinals
          };
        }
      } catch (error) {
        console.error('Error initializing game state:', error);
        throw error;
      }
    }
    
    return {
      matchId: match._id,
      players: match.players,
      game: match.game,
      status: match.status,
      score: match.score,
      currentGameState: match.currentGameState,
      currentTurn: match.currentTurn,
      round: match.round,
      matchNumber: match.matchNumber,
      bestOf: match.bestOf,
      winner: match.winner,
      isFinals: match.isFinals
    };
    
    console.log('Returning match state:', {
      hasGame: !!result.game,
      gameId: result.game?._id,
      gameType: result.game?.type
    });
    
    return result;
  }
  
  /**
   * Get all ready matches (waiting for players)
   */
  async getReadyMatches(tournamentId) {
    return await Match.find({
      tournament: tournamentId,
      status: 'ready'
    })
      .populate('players', 'name')
      .sort({ round: 1, matchNumber: 1 });
  }
}

export default new MatchGameService();
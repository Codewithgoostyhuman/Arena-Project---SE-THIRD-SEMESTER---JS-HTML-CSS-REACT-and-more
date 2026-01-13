// backend/services/matchService.js
import Match from "../schemas/MatchSchema.js";
import Tournament from "../schemas/TournamentSchema.js";
import Game from "../schemas/GameSchema.js";
import TicTacToeEngine from "../domains/GameLogics/tictactoelogic.js";

class MatchService {
  constructor() {
    // Store active game engines in memory
    this.activeGames = new Map();
  }

  /**
   * Create a match
   */
  async createMatch(data) {
    const match = new Match(data);
    await match.save();

    if (data.tournament) {
      const tournament = await Tournament.findById(data.tournament);
      if (tournament) {
        tournament.matches.push(match._id);
        await tournament.save();
      }
    }

    return match.populate("players tournament league game");
  }

  /**
   * Get match by ID
   */
  async getMatchById(id) {
    const match = await Match.findById(id)
      .populate("players tournament league game");
    if (!match) throw new Error("Match not found");
    return match;
  }

  /**
   * Get all matches
   */
  async getAllMatches() {
    return Match.find().populate("players tournament league game");
  }

  /**
   * Update match
   */
  async updateMatch(id, data) {
    const match = await Match.findByIdAndUpdate(id, data, { new: true })
      .populate("players tournament league game");
    if (!match) throw new Error("Match not found");
    return match;
  }

  /**
   * Delete match
   */
  async deleteMatch(id) {
    const match = await Match.findByIdAndDelete(id);
    if (!match) throw new Error("Match not found");
    return match;
  }

  /**
   * START MATCH - Initialize game engine
   */
  async startMatch(matchId) {
    const match = await this.getMatchById(matchId);

    if (match.status !== "upcoming") {
      throw new Error("Match has already started or finished");
    }

    // Get game type
    const game = await Game.findById(match.game);
    if (!game) throw new Error("Game not found");

    // Initialize game engine based on game type
    let gameEngine;
    switch (game.type) {
      case "TicTacToe":
        gameEngine = new TicTacToeEngine(match.players.map(p => p._id));
        break;
      // Add more game types here
      default:
        throw new Error(`Game engine not implemented for ${game.type}`);
    }

    // Start the game
    gameEngine.start();

    // Store in active games
    this.activeGames.set(matchId.toString(), gameEngine);

    // Update match status
    match.status = "live";
    match.startedAt = new Date();
    await match.save();

    return {
      match,
      gameState: gameEngine.getState()
    };
  }

  /**
   * MAKE MOVE - Player makes a move in match
   */
  async makeMove(matchId, playerId, move) {
    const match = await this.getMatchById(matchId);

    if (match.status !== "live") {
      throw new Error("Match is not in progress");
    }

    // Get or restore game engine
    let gameEngine = this.activeGames.get(matchId.toString());
    
    if (!gameEngine) {
      // Restore from database (if server restarted)
      const game = await Game.findById(match.game);
      switch (game.type) {
        case "TicTacToe":
          gameEngine = TicTacToeEngine.deserialize(match.gameState || {
            players: match.players.map(p => p._id)
          });
          break;
        default:
          throw new Error("Cannot restore game engine");
      }
      this.activeGames.set(matchId.toString(), gameEngine);
    }

    // Make the move
    const newState = gameEngine.makeMove(playerId, move);

    // Save game state to match
    match.gameState = gameEngine.serialize();
    match.moves = gameEngine.moveHistory;

    // Check if game finished
    if (gameEngine.isFinished()) {
      match.status = "finished";
      
      if (!gameEngine.isDraw) {
        match.winner = gameEngine.getWinner();
        
        // Update scores
        match.score = {
          player1: match.players[0]._id.toString() === gameEngine.getWinner().toString() ? 1 : 0,
          player2: match.players[1]._id.toString() === gameEngine.getWinner().toString() ? 1 : 0
        };
      } else {
        match.isDraw = true;
        match.score = { player1: 0, player2: 0 };
      }

      // Remove from active games
      this.activeGames.delete(matchId.toString());
    }

    await match.save();

    return {
      match,
      gameState: newState,
      isFinished: gameEngine.isFinished()
    };
  }

  /**
   * GET MATCH STATE - Get current game state
   */
  async getMatchState(matchId) {
    const match = await this.getMatchById(matchId);

    if (match.status !== "live") {
      return {
        match,
        gameState: match.gameState,
        message: "Match not in progress"
      };
    }

    let gameEngine = this.activeGames.get(matchId.toString());
    
    if (!gameEngine && match.gameState) {
      // Restore from saved state
      const game = await Game.findById(match.game);
      switch (game.type) {
        case "TicTacToe":
          gameEngine = TicTacToeEngine.deserialize(match.gameState);
          break;
      }
      if (gameEngine) {
        this.activeGames.set(matchId.toString(), gameEngine);
      }
    }

    return {
      match,
      gameState: gameEngine ? gameEngine.getState() : match.gameState
    };
  }

  /**
   * FORFEIT MATCH - Player gives up
   */
  async forfeitMatch(matchId, playerId) {
    const match = await this.getMatchById(matchId);

    if (match.status === "finished") {
      throw new Error("Match already finished");
    }

    // Determine winner (the other player)
    const winner = match.players.find(
      p => p._id.toString() !== playerId.toString()
    );

    match.status = "finished";
    match.winner = winner._id;
    match.score = {
      player1: match.players[0]._id.toString() === winner._id.toString() ? 1 : 0,
      player2: match.players[1]._id.toString() === winner._id.toString() ? 1 : 0
    };

    // Remove from active games
    this.activeGames.delete(matchId.toString());

    await match.save();
    return match;
  }

  /**
   * Get matches by league
   */
  async getMatchesByLeague(leagueId) {
    return Match.find({ league: leagueId })
      .populate("tournament players game");
  }

  /**
   * Get matches by tournament
   */
  async getMatchesByTournament(tournamentId) {
    return Match.find({ tournament: tournamentId })
      .populate("league players game");
  }

  /**
   * Get matches by game
   */
  async getMatchesByGame(gameId) {
    return Match.find({ game: gameId })
      .populate("league tournament players");
  }

  /**
   * Get player's matches
   */
  async getPlayerMatches(playerId) {
    return Match.find({ players: playerId })
      .populate("tournament league game players")
      .sort({ createdAt: -1 });
  }

  /**
   * Get live matches
   */
  async getLiveMatches() {
    return Match.find({ status: "live" })
      .populate("players tournament league game");
  }
}

export default new MatchService();
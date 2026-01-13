export default class GameEngine {
  constructor(gameType, players) {
    this.gameType = gameType;
    this.players = players; // Array of player IDs
    this.state = "waiting"; // waiting, active, finished
    this.currentPlayerIndex = 0;
    this.winner = null;
    this.isDraw = false;
    this.moveHistory = [];
    this.startedAt = null;
    this.finishedAt = null;
  }

  /**
   * Start the game
   */
  start() {
    if (this.state !== "waiting") {
      throw new Error("Game already started");
    }
    this.state = "active";
    this.startedAt = new Date();
  }

  /**
   * Make a move (to be overridden by specific game implementations)
   */
  makeMove(playerId, move) {
    throw new Error("makeMove must be implemented by game subclass");
  }

  /**
   * Get current game state
   */
  getState() {
    return {
      gameType: this.gameType,
      state: this.state,
      currentPlayer: this.players[this.currentPlayerIndex],
      winner: this.winner,
      isDraw: this.isDraw,
      moveHistory: this.moveHistory
    };
  }

  /**
   * Check if game is finished
   */
  isFinished() {
    return this.state === "finished";
  }

  /**
   * Get winner
   */
  getWinner() {
    return this.winner;
  }

  /**
   * Validate player turn
   */
  isPlayerTurn(playerId) {
    return this.players[this.currentPlayerIndex].toString() === playerId.toString();
  }

  /**
   * Switch to next player
   */
  nextPlayer() {
    this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
  }

  /**
   * End the game
   */
  endGame(winner = null, isDraw = false) {
    this.state = "finished";
    this.winner = winner;
    this.isDraw = isDraw;
    this.finishedAt = new Date();
  }

  /**
   * Record a move in history
   */
  recordMove(playerId, move) {
    this.moveHistory.push({
      player: playerId,
      move: move,
      timestamp: new Date()
    });
  }

  /**
   * Serialize game state for storage
   */
  serialize() {
    return {
      gameType: this.gameType,
      players: this.players,
      state: this.state,
      currentPlayerIndex: this.currentPlayerIndex,
      winner: this.winner,
      isDraw: this.isDraw,
      moveHistory: this.moveHistory,
      startedAt: this.startedAt,
      finishedAt: this.finishedAt
    };
  }

  /**
   * Restore game from serialized state
   */
  static deserialize(data) {
    const game = new this(data.gameType, data.players);
    game.state = data.state;
    game.currentPlayerIndex = data.currentPlayerIndex;
    game.winner = data.winner;
    game.isDraw = data.isDraw;
    game.moveHistory = data.moveHistory;
    game.startedAt = data.startedAt;
    game.finishedAt = data.finishedAt;
    return game;
  }
}
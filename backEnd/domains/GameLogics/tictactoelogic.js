// backend/games/TicTacToeEngine.js
import GameEngine from "./GameEngine.js";

export default class TicTacToeEngine extends GameEngine {
  constructor(players) {
    super("TicTacToe", players);
    this.board = Array(9).fill(null); // 3x3 grid (0-8)
    this.symbols = ["X", "O"]; // Player symbols
  }

  /**
   * Make a move in TicTacToe
   * @param {string} playerId - Player making the move
   * @param {number} position - Position on board (0-8)
   */
  makeMove(playerId, position) {
    // Validate game state
    if (this.state !== "active") {
      throw new Error("Game is not active");
    }

    // Validate player turn
    if (!this.isPlayerTurn(playerId)) {
      throw new Error("Not your turn");
    }

    // Validate position
    if (position < 0 || position > 8) {
      throw new Error("Invalid position. Must be 0-8");
    }

    // Validate position is empty
    if (this.board[position] !== null) {
      throw new Error("Position already taken");
    }

    // Make the move
    const symbol = this.symbols[this.currentPlayerIndex];
    this.board[position] = symbol;

    // Record move
    this.recordMove(playerId, { position, symbol });

    // Check for winner
    if (this.checkWin(symbol)) {
      this.endGame(playerId, false);
      return this.getState();
    }

    // Check for draw
    if (this.board.every(cell => cell !== null)) {
      this.endGame(null, true);
      return this.getState();
    }

    // Switch to next player
    this.nextPlayer();

    return this.getState();
  }

  /**
   * Check if a symbol has won
   */
  checkWin(symbol) {
    const winPatterns = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
      [0, 4, 8], [2, 4, 6]             // Diagonals
    ];

    return winPatterns.some(pattern =>
      pattern.every(index => this.board[index] === symbol)
    );
  }

  /**
   * Get current board state
   */
  getState() {
    return {
      ...super.getState(),
      board: this.board,
      symbols: this.symbols
    };
  }

  /**
   * Get visual representation of board
   */
  getBoardDisplay() {
    const display = [];
    for (let i = 0; i < 9; i += 3) {
      display.push(
        this.board.slice(i, i + 3)
          .map(cell => cell || "-")
          .join(" | ")
      );
    }
    return display.join("\n---------\n");
  }

  /**
   * Serialize TicTacToe state
   */
  serialize() {
    return {
      ...super.serialize(),
      board: this.board,
      symbols: this.symbols
    };
  }

  /**
   * Restore TicTacToe game
   */
  static deserialize(data) {
    const game = new TicTacToeEngine(data.players);
    game.board = data.board;
    game.symbols = data.symbols;
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
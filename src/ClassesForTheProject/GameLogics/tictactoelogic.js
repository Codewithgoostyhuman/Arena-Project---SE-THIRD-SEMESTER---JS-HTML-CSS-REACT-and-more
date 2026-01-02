import Game from "../Game";

export default class TicTacToe extends Game {
  constructor(players) {
    super(players);
    this.board = Array(9).fill(null);
    this.currentPlayerIndex = 0;
  }

  makeMove(index) {
    if (this.board[index] || this.status !== "running") return;

    const symbol = this.currentPlayerIndex === 0 ? "X" : "O";
    this.board[index] = symbol;

    if (this.checkWin(symbol)) {
      this.winner = this.players[this.currentPlayerIndex];
      this.status = "finished";
      return;
    }

    if (this.board.every(cell => cell)) {
      this.draw = true;
      this.status = "finished";
      return;
    }

    this.currentPlayerIndex = 1 - this.currentPlayerIndex;
  }

  checkWin(symbol) {
    const wins = [
      [0,1,2],[3,4,5],[6,7,8],
      [0,3,6],[1,4,7],[2,5,8],
      [0,4,8],[2,4,6],
    ];
    return wins.some(pattern =>
      pattern.every(i => this.board[i] === symbol)
    );
  }
}

export default class Game {
  constructor(players , style) {
    this.players = players;
    this.style = style;
    this.status = "idle"; 
    this.winner = null;
    this.draw = false;
  }

  start() {
    this.status = "running";
    this.winner = null;
    this.draw = false;
  }

  makeMove(_) {
    throw new Error("makeMove() must be implemented by Game");
  }

  isFinished() {
    return this.status === "finished";
  }

  result() {
    return {
      winner: this.winner,
      draw: this.draw,
    };
  }
}

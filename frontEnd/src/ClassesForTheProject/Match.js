
export default class Match {
  constructor(GameClass, players) {
    this.game = new GameClass(players);
    this.players = players;
    this.status = "idle"; // idle | running | finished
  }

  start() {
    this.game.start();
    this.status = "running";
  }

  makeMove(move) {
    if (this.status !== "running") return;

    this.game.makeMove(move);

    if (this.game.isFinished()) {
      this.status = "finished";
    }
  }

  result() {
    return {
      players: this.players,
      ...this.game.result(),
    };
  }
}

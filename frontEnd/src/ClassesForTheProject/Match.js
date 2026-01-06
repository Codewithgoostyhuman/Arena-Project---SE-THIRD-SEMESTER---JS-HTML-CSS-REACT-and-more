
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
 getResultFor(player) {
    if (this.status !== "finished") {
      throw new Error("Match not finished yet");
    }

    const { winner, isDraw } = this.game.result();

    if (isDraw) return MatchResult.DRAW;
    if (winner === player) return MatchResult.WIN;
    return MatchResult.LOSE;
  }

 result() {
    return this.game.result();
  }
}

import GameEngine from "../Game.js";

export default class RockPaperScissors extends GameEngine {
  constructor(players) {
    super(players);
    this.moves = {};
  }

  makeMove({ playerId, choice }) {
    this.moves[playerId] = choice;

    if (Object.keys(this.moves).length < 2) return;

    const [p1, p2] = this.players;
    const m1 = this.moves[p1.Id];
    const m2 = this.moves[p2.Id];

    if (m1 === m2) {
      this.draw = true;
    } else if (
      (m1 === "rock" && m2 === "scissors") ||
      (m1 === "paper" && m2 === "rock") ||
      (m1 === "scissors" && m2 === "paper")
    ) {
      this.winner = p1;
    } else {
      this.winner = p2;
    }

    this.status = "finished";
  }
}

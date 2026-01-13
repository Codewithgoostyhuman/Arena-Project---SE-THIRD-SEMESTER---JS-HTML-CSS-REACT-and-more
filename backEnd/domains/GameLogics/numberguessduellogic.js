import GameEngine from "../Game.js";

export default class NumberGuessDuel extends GameEngine {
  constructor(players) {
    super(players);
    this.secretNumbers = {};
    this.turn = 0;
    this.rounds = 0;
    this.maxRounds = 6; // 3 guesses per player
  }

  setSecretNumber(playerId, number) {
    this.secretNumbers[playerId] = number;
  }

  makeMove({ playerId, guess }) {
    if (this.status !== "running") return;

    const opponent = this.players.find(p => p.Id !== playerId);
    if (!opponent) return;

    this.rounds++;

    if (this.secretNumbers[opponent.Id] === guess) {
      this.winner = this.players.find(p => p.Id === playerId);
      this.status = "finished";
      return;
    }

    if (this.rounds >= this.maxRounds) {
      this.draw = true;
      this.status = "finished";
      return;
    }

    this.turn = 1 - this.turn;
  }
}

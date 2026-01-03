
import TournamentStyle from "../TournamentStyles/TournamentStyle.js";
export default class RoundRobinTournamentStyles extends TournamentStyle {
     getMatchCount() {
    const n = this.players.length;
    return (n * (n - 1)) / 2;
  }

  generateMatches() {
    const matches = [];

    for (let i = 0; i < this.players.length; i++) {
      for (let j = i + 1; j < this.players.length; j++) {
        matches.push({
          player1: this.players[i],
          player2: this.players[j],
        });
      }
    }

    return matches;
  }
}
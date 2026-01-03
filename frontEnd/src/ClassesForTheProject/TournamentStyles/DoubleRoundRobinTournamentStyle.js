
import TournamentStyle from "../TournamentStyles/TournamentStyle.js";
class DoubleRoundRobinTournamentStyle extends TournamentStyle {
  getMatchCount() {
    const n = this.players.length;
    return n * (n - 1);
  }

  generateMatches() {
    const matches = [];

    for (let i = 0; i < this.players.length; i++) {
      for (let j = i + 1; j < this.players.length; j++) {
        matches.push({
          home: this.players[i],
          away: this.players[j],
        });
        matches.push({
          home: this.players[j],
          away: this.players[i],
        });
      }
    }

    return matches;
  }
}
export default DoubleRoundRobinTournamentStyle;
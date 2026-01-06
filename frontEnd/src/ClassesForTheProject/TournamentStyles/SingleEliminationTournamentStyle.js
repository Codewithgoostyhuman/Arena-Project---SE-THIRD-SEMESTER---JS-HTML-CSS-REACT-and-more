import TournamentStyle from "./TournamentStyle.js";
import Match from "../Match.js";

export default class SingleEliminationTournamentStyle extends TournamentStyle {
  getMatchCount(players) {
    return players.length - 1;
  }

  generateMatches(players, GameClass) {
    const matches = [];
    const queue = [...players];

    while (queue.length > 1) {
      const p1 = queue.shift();
      const p2 = queue.shift();
      matches.push(new Match(GameClass, [p1, p2]));
    }

    return matches;
  }

  getWinners(matches) {
    const finalMatch = matches[matches.length - 1];
    const { winner } = finalMatch.result();
    return [winner];
  }
}

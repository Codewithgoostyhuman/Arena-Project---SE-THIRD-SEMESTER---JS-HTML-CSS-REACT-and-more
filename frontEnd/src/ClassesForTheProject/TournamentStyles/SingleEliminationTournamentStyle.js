import TournamentStyle from "../TournamentStyles/TournamentStyle.js";

class SingleEliminationTournamentStyle extends TournamentStyle {

  getMatchCount() {
    return this.players.length - 1;
  }

  generateMatches() {
    const matches = [];
    const queue = [...this.players];


    for (let i = queue.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [queue[i], queue[j]] = [queue[j], queue[i]];
    }

    while (queue.length > 1) {
      const player1 = queue.shift();
      const player2 = queue.shift();

      matches.push({
        players: [player1, player2],
        round: "Elimination",
      });
    }

    return matches;
  }

  getWinners(matches) {
    if (!matches || matches.length === 0) return [];

    const finishedMatches = matches.filter(m => m.status === "finished");
    if (finishedMatches.length === 0) return [];

    const finalMatch = finishedMatches[finishedMatches.length - 1];
    if (!finalMatch.result) return [];

    const { winner, draw } = finalMatch.result();
    if (draw || !winner) return [];

    return [winner];
  }
}

export default SingleEliminationTournamentStyle;

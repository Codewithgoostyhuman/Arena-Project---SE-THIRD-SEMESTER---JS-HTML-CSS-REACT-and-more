import TournamentStyle from "../TournamentStyles/TournamentStyle.js";

class DoubleRoundRobinTournamentStyle extends TournamentStyle {

  getMatchCount() {
    const n = this.players.length;
    return n * (n - 1); // each player plays every other twice
  }

  generateMatches() {
    const matches = [];

    for (let i = 0; i < this.players.length; i++) {
      for (let j = i + 1; j < this.players.length; j++) {
        // first leg
        matches.push({
          home: this.players[i],
          away: this.players[j],
        });
        // second leg
        matches.push({
          home: this.players[j],
          away: this.players[i],
        });
      }
    }

    return matches;
  }

  getWinners(matches) {
    if (!matches || matches.length === 0) return [];

    const points = new Map();


    const addPoints = (player, pts) => {
      if (!points.has(player)) points.set(player, 0);
      points.set(player, points.get(player) + pts);
    };

    
    for (const match of matches) {
      if (!match.result) continue; 
      const { winner, draw, players } = match.result();

      if (draw) {
        players.forEach(p => addPoints(p, 1)); 
      } else if (winner) {
        addPoints(winner, 3); 
      }
    }

    let maxPoints = 0;
    for (const pts of points.values()) {
      if (pts > maxPoints) maxPoints = pts;
    }

    const winners = [];
    for (const [player, pts] of points.entries()) {
      if (pts === maxPoints) winners.push(player);
    }

    return winners;
  }
}

export default DoubleRoundRobinTournamentStyle;

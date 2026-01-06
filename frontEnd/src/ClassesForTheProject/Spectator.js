import User from "./User.js";

export default class Spectator extends User {
  constructor(Id, name, email, password, role = "Spectator") {
    super(Id, name, email, password, role, "Active");
  }

  monitorMatch(match) {
    if (match.status !== "running") {
      console.log(`Match ${match.game.constructor.name} is currently ${match.status}.`);
      return;
    }

    const currentData = match.result();
    console.log(`--- [LIVE] Monitoring Match ---`);
    console.log(`Game: ${match.game.constructor.name}`);
    console.log(`Players: ${currentData.players.map(p => p.name).join(" vs ")}`);
    console.log(`Current State: ${match.game.status}`);
  }

  
  checkPastMatch(match) {
    if (match.status !== "finished") {
      console.log("This match is not completed yet.");
      return;
    }

    const stats = match.result();
    console.log(`--- Match Statistics ---`);
    if (stats.draw) {
      console.log("Result: Draw");
    } else {
      console.log(`Winner: ${stats.winner ? stats.winner.name : "N/A"}`);
    }
    console.log(`Participants: ${stats.players.map(p => p.name).join(", ")}`);
  }
  checkPlayerStats(player) {
    console.log(`--- Player Profile: ${player.name} ---`);
    console.log(`Status: ${player.status}`);
    console.log(`Points: ${player.getPoints()}`);
    console.log(`Record: ${player.wins}W - ${player.losses}L - ${player.draws || 0}D`);
    console.log(`Total Matches Played: ${player.totalMatches}`);
    
    if (player.isDroppedOut) {
      console.log(`Note: This player has dropped out of the current tournament.`);
    }
  }
  checkTournamentProgress(tournament) {
    console.log(`--- Tournament: ${tournament.name} ---`);
    console.log(`Status: ${tournament.status}`);
    console.log(`Registered Players: ${tournament.players.length}/${tournament.maxPlayers}`);
    
    if (tournament.status === "ongoing") {
      const activeMatches = tournament.matches.filter(m => m.status === "running").length;
      console.log(`Active Matches: ${activeMatches}`);
    }
  }
}

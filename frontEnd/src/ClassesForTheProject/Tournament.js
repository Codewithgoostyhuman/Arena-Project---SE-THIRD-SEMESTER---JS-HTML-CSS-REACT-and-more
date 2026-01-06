import Match from "./Match.js";

export default class Tournament {
  constructor(name, startDate, endDate, maxPlayers, style, GameClass, league) {
    this.name = name;
    this.startDate = startDate;
    this.endDate = endDate;
    this.maxPlayers = maxPlayers;

    this.style = style;
    this.GameClass = GameClass;
    this.league = league;

    this.players = [];
    this.applications = [];
    this.matches = [];
    this.winners = [];
    this.status = "upcoming";
  }


  addPlayer(player) {
    if (this.players.length >= this.maxPlayers) return;
    this.players.push(player);
  }

  removePlayer(player) {
    this.players = this.players.filter(p => p.Id !== player.Id);
  }
receiveApplication(application) {
    if (application.target !== this) {
      throw new Error("Invalid application target");
    }

    if (this.status !== "upcoming") {
      throw new Error("Tournament already started");
    }

    this.applications.push(application);
  }

  approveApplication(application) {
    if (!this.applications.includes(application)) {
      throw new Error("Application not found");
    }

    if (this.players.length >= this.maxPlayers) {
      throw new Error("Tournament is full");
    }

    application.approve();
    this.players.push(application.player);
    application.player.tournaments.push(this);
  }
  start() {
  if (this.players.length < 2) {
    throw new Error("Not enough players to start tournament");
  }

  this.matches = this.style.generateMatches(
    this.players,
    this.GameClass
  );

  this.status = "ongoing";
}
finish() {
  this.winners = this.style.getWinners(this.matches);
  this.status = "finished";
}
  getWinners() {
    if (!this.matches || this.matches.length === 0) return [];
    winners = this.style.getWinners(this.matches);
    return winners;
  }
  finalizeMatch(match) {
  for (const player of match.players) {
    const result = match.getResultFor(player);
    player.recordMatchResult(result);
    this.league.awardPoints(player, result);
  }
}


  

}

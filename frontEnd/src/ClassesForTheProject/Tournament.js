import Match from "./Match.js";

export default class Tournament {
  constructor(name, startDate, endDate, maxPlayers = 64, style, GameClass) {
    this.id = Date.now();
    this.name = name;
    this.startDate = startDate;
    this.endDate = endDate;
    this.maxPlayers = maxPlayers;
    this.status = "upcoming";
    this.style = style;
    this.players = [];
    this.matches = [];
    this.GameClass = GameClass;
    winners = [];
  }

  addPlayer(player) {
    if (this.players.length >= this.maxPlayers) return;
    this.players.push(player);
  }

  removePlayer(player) {
    this.players = this.players.filter(p => p.Id !== player.Id);
  }

  start() {
    this.matches = this.style.generateMatches(this.players, this.GameClass);
    this.status = "ongoing";
  }
  getWinners() {
    if (!this.matches || this.matches.length === 0) return [];
    winners = this.style.getWinners(this.matches);
    return winners;
  }

  

}

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
}

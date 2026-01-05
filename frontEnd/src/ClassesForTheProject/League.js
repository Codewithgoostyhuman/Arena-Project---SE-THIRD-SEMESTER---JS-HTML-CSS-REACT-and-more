import Tournament from "./Tournament.js";
import RoundRobin from "./TournamentStyles/RoundRobinTournamentStyles.js";
import DoubleRoundRobin from "./TournamentStyles/DoubleRoundRobinTournamentStyle.js";
import SingleElimination from "./TournamentStyles/SingleEliminationTournamentStyle.js";

export default class League {
  constructor(name, owner, GameClass, ratingFunction) {
    this.name = name;
    this.owner = owner;
    this.GameClass = GameClass;
    this.players = [];
    this.tournaments = [];
    this.ratingFunction = ratingFunction;
  }

  createTournament(name, styleType, startDate, endDate, maxPlayers = 64) {
    let style;

    if (styleType === "RoundRobin") style = new RoundRobin();
    if (styleType === "DoubleRoundRobin") style = new DoubleRoundRobin();
    if (styleType === "SingleElimination") style = new SingleElimination();

    const tournament = new Tournament(
      name,
      startDate,
      endDate,
      maxPlayers,
      style,
      this.GameClass
    );

    this.tournaments.push(tournament);
    return tournament;
  }
  announceTournament(tournamentName){
    let name = "";
    let i = 0;
    while(name != tournamentName){
      name = this.tournaments[i];
      i++;
    }
    if(name === tournamentName){
      return `A new tournament ${tournamentName} has been created under the League: ${this.name}!`;
    }
  }
  addPlayer(player) {
    this.players.push(player);
  }

  recordMatch(playerId, result) {
    const player = this.players.find(p => p.Id === playerId);
    if (!player) return;

    const points = this.ratingFunction(result);
    player.addPoints(points);
  }
}

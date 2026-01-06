import Tournament from "./Tournament.js";
import RoundRobin from "./TournamentStyles/RoundRobinTournamentStyle.js";
import DoubleRoundRobin from "./TournamentStyles/DoubleRoundRobinTournamentStyle.js";
import SingleElimination from "./TournamentStyles/SingleEliminationTournamentStyle.js";
import { assertValidRating } from "./helpers/assertValidRating.js";

export default class League {
  constructor(name, owner, GameClass, rating) {
    this.name = name;
    this.owner = owner;
    this.GameClass = GameClass;
    this.rating = rating;

    this.players = [];
    this.applications = [];
    this.tournaments = [];
  }
  receiveApplication(application) {
    if (application.target !== this) {
      throw new Error("Invalid application target");
    }

    this.applications.push(application);
  }

  approveApplication(application) {
    if (!this.applications.includes(application)) {
      throw new Error("Application not found in this league");
    }

    application.approve();

    this.players.push(application.player);
    application.player.leagues.push(this);
  }

  rejectApplication(application) {
    if (!this.applications.includes(application)) {
      throw new Error("Application not found in this league");
    }

    application.reject();
  }

  createTournament(name, styleType, startDate, endDate, maxPlayers = 64) {
    let style;

    switch (styleType) {
      case "RoundRobin":
        style = new RoundRobin();
        break;
      case "DoubleRoundRobin":
        style = new DoubleRoundRobin();
        break;
      case "SingleElimination":
        style = new SingleElimination();
        break;
      default:
        throw new Error(`Unknown tournament style: ${styleType}`);
    }

    const tournament = new Tournament(
      name,
      startDate,
      endDate,
      maxPlayers,
      style,
      this.GameClass,
      this // pass league reference
    );

    this.tournaments.push(tournament);
    return tournament;
  }
  announceTournament(tournamentName) {
    let name = "";
    let i = 0;
    while (name != tournamentName) {
      name = this.tournaments[i];
      i++;
    }
    if (name === tournamentName) {
      return `A new tournament ${tournamentName} has been created under the League: ${this.name}!`;
    }
  }
  addPlayer(player) {
    this.players.push(player);
  }

  awardPoints(player, matchResult) {
    const points = this.rating.calculate(matchResult);
    player.addPoints(points);
  }
}

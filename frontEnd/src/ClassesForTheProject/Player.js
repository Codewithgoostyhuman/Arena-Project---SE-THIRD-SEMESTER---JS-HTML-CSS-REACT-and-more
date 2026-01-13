import Application from "./Application.js";
import { MatchResult } from "./helpers/matchResult.js";
import User from './User.js'
import { Roles } from "./helpers/roles.js";
export default class Player extends User {
  constructor(id, name, email,password, role = Roles.PLAYER , status = "inactive") {
    super(id,name,email,password,role,status)

    // statistics
    this.wins = 0;
    this.losses = 0;
    this.draws = 0;
    this.points = 0;

    // participation
    this.applications = [];
    this.leagues = [];
    this.tournaments = [];
  }

  applyToLeague(league) {
    const application = new Application(this, league);
    this.applications.push(application);
    league.receiveApplication(application);
    return application;
  }

  applyToTournament(tournament) {
    // CASE STUDY RULE:
    // Player must belong to the league first
    if (!this.leagues.includes(tournament.league)) {
      throw new Error("Player must join league before applying to tournament");
    }

    const application = new Application(this, tournament);
    this.applications.push(application);
    tournament.receiveApplication(application);
    return application;
  }

  recordMatchResult(matchResult) {
    switch (matchResult) {
      case MatchResult.WIN:
        this.wins++;
        break;
      case MatchResult.DRAW:
        this.draws++;
        break;
      case MatchResult.LOSE:
        this.losses++;
        break;
      default:
        throw new Error(`Invalid match result: ${matchResult}`);
    }
  }

  addPoints(points) {
    this.points += points;
  }
}

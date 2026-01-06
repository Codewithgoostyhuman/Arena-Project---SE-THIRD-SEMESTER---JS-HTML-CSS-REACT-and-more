// Player.js
import User from "./User.js";
import Application from "./Applications.js";

export default class Player extends User {
  constructor(Id, name, email, password, role = "Player", status = "Pending") {
    super(Id, name, email, password, role, status);

    this.totalMatches = 0;
    this.wins = 0;
    this.losses = 0;
    this.points = 0;
    this.applications = [];
    this.assignedMatches = []; 
    this.currentArena = null;
    this.isDroppedOut = false;
  }

 
  registerInArena(arenaName) {
    if (this.isDroppedOut) return console.error("Cannot register: Player has dropped out.");
    this.currentArena = arenaName;
    console.log(`${this.name} registered in arena: ${arenaName}`);
  }


  submitApplication(leagueName) {
    if (this.isDroppedOut) return console.error("Cannot apply: Player has dropped out.");
    

    const application = new Application(this.Id, this.name, leagueName);
    this.applications.push(application);
    
    console.log(`Application for ${leagueName} submitted. ID: ${application.applicationId}`);
    return application;
  }


  playMatch(matchId, result, ratingSystem) {
    if (this.isDroppedOut) return console.error("Player has dropped out.");
    const pointsAwarded = ratingSystem.calculate(result);
    this.points += pointsAwarded;
    this.totalMatches++;
    if (result === "win") this.wins++;
    else if (result === "lose") this.losses++;
    else if (result === "draw") this.draws++;

    console.log(`Match ${matchId} updated: ${result}. Points earned: ${pointsAwarded}`);
  }


  dropOut() {
    this.isDroppedOut = true;
    this.status = "Inactive";
    this.assignedMatches = []; 
    console.log(`${this.name} has dropped out of the tournament.`);
  }
}

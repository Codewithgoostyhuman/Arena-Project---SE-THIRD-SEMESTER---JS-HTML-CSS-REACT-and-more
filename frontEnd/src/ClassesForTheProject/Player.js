import User from "./User.js";
import Application from "./Applications.js";

export default class Player extends User {
  constructor(Id, name, email, password, role = "Player", status = "Pending") {
    super(Id, name, email, password, role, status);

    this.totalMatches = 0;
    this.wins = 0;
    this.losses = 0;
    this.team = "";
    this.applications = [];
    this.points = 0;
  }

  addPoints(points) {
    this.points += points;
  }

  getPoints() {
    return this.points;
  }

  submitApplication(name, leagueName) {
    if (!leagueName) {
      alert("League name is required to submit an application.");
      return;
    }

    const application = new Application(name, leagueName);
    this.applications.push(application);
    alert("Application submitted successfully!");
    return application;
  }
}

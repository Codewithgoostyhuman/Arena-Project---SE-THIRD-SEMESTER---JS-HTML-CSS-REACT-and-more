export default class Application {
  constructor(playerId, playerName, leagueName, status = "Pending") {
    this.applicationId = Math.floor(Math.random() * 1000000);
    this.playerId = playerId;
    this.playerName = playerName;
    this.leagueName = leagueName;
    this.status = status;
    this.submissionDate = new Date(); 
  }
}

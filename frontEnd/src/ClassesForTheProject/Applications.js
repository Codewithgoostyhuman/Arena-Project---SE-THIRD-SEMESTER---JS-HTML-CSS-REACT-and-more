export default class Application {
  constructor(player, target) {
    this.player = player;     // Player
    this.target = target;     // League or Tournament
    this.status = "pending";  // pending | approved | rejected
    this.createdAt = new Date();
  }

  approve() {
    if (this.status !== "pending") {
      throw new Error("Application already processed");
    }
    this.status = "approved";
  }

  reject() {
    if (this.status !== "pending") {
      throw new Error("Application already processed");
    }
    this.status = "rejected";
  }
}

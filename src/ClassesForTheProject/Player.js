import { User } from "./User.js";
export class Player extends User {
    constructor(Id, name, email, password, role, status, playerStats = 0, team = "", ranking="") {
        super(Id, name, email, password, role, status);
        this.playerStats = playerStats;
        this.team = team;
        this.ranking = ranking;
    }
}
import League from "../schemas/LeagueSchema.js";
import User from "../schemas/UserSchema.js";

export default class LeagueDomain {
  static async createLeague(ownerId, leagueData) {
    const owner = await User.findById(ownerId);
    if (!owner || (owner.role !== "leagueOwner" && owner.role !== "operator")) {
      throw new Error("Only league owners or operators can create leagues");
    }

    const league = new LeagueModel({
      ...leagueData,
      owner: ownerId
    });

    await league.save();
    return league;
  }

  static async updateLeague(leagueId, data) {
    const league = await League.findByIdAndUpdate(leagueId, data, { new: true });
    if (!league) throw new Error("League not found");
    return league;
  }

  static async deleteLeague(leagueId) {
    const league = await League.findByIdAndDelete(leagueId);
    if (!league) throw new Error("League not found");
    return league;
  }

  static async getLeague(leagueId) {
    const league = await League.findById(leagueId)
      .populate("owner", "name email")
      .populate("players", "name email stats")
      .populate("tournaments", "name style status")
      .populate("applications.player", "name email");

    if (!league) throw new Error("League not found");
    return league;
  }

  static async getActiveLeagues() {
    return LeagueModel.find({ status: "active" })
      .populate("owner", "name email")
      .sort({ createdAt: -1 });
  }

  static async addPlayer(leagueId, playerId) {
    const league = await League.findById(leagueId);
    if (!league) throw new Error("League not found");
    if (league.players.includes(playerId)) throw new Error("Player already in league");
    league.players.push(playerId);
    await league.save();
    return league;
  }

  static async removePlayer(leagueId, playerId) {
    const league = await League.findById(leagueId);
    if (!league) throw new Error("League not found");
    league.players = league.players.filter(p => p.toString() !== playerId.toString());
    await league.save();
    return league;
  }

  static async getPlayers(leagueId) {
    const league = await League.findById(leagueId).populate("players", "name email stats");
    if (!league) throw new Error("League not found");
    return league.players;
  }

  static async getTournaments(leagueId) {
    const league = await League.findById(leagueId).populate("tournaments");
    if (!league) throw new Error("League not found");
    return league.tournaments;
  }

  static async getApplications(leagueId) {
    const league = await League.findById(leagueId).populate("applications.player", "name email");
    if (!league) throw new Error("League not found");
    return league.applications;
  }

  static async approveApplication(leagueId, applicationId) {
    const league = await League.findById(leagueId);
    if (!league) throw new Error("League not found");

    const app = league.applications.id(applicationId);
    if (!app) throw new Error("Application not found");

    app.status = "approved";
    if (!league.players.includes(app.player)) league.players.push(app.player);
    await league.save();
    return app;
  }

  static async rejectApplication(leagueId, applicationId) {
    const league = await League.findById(leagueId);
    if (!league) throw new Error("League not found");

    const app = league.applications.id(applicationId);
    if (!app) throw new Error("Application not found");

    app.status = "rejected";
    await league.save();
    return app;
  }

  static async applyToLeague(playerId, leagueId) {
    const league = await League.findById(leagueId);
    if (!league) throw new Error("League not found");

    const alreadyApplied = league.applications.some(app => app.player.toString() === playerId.toString());
    if (alreadyApplied) throw new Error("Already applied");

    league.applications.push({
      player: playerId,
      status: "pending",
      appliedAt: new Date()
    });

    await league.save();
    return league.applications[league.applications.length - 1];
  }
}

import LeagueModel from "../schemas/LeagueSchema.js";
import User from "../schemas/UserSchema.js";
import League from "../schemas/LeagueSchema.js"
import TournamentModel from "../schemas/TournamentSchema.js"
import Application from "../schemas/ApplicationSchema.js"

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
    owner.leagues.push(league._id);
    await owner.save();
    return league;
  }

  static async updateLeague(leagueId, data) {
    const league = await League.findByIdAndUpdate(leagueId, data, { new: true });
    if (!league) throw new Error("League not found");
    return league;
  }

  static async deleteLeague(leagueId,userId) {
    const league = await LeagueModel.findById(leagueId);
  
  if (!league) {
    throw new Error('League not found');
  }
  console.log("league.owner:", league.owner.toString());
console.log("req.user:", userId.toString());
  if (league.owner.toString() !== userId.toString()) {
    throw new Error('You do not own this league');
  }

  // Delete associated tournaments
  await TournamentModel.deleteMany({ league: leagueId });
  await LeagueModel.findByIdAndDelete(leagueId);
  
  return { message: 'League deleted' };

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
 static async getLeaguesByOwner(ownerId) {
  const leagues = await LeagueModel.find({ owner: ownerId })
    .populate("game", "name")
    .populate("ratingFormula", "name")
    .populate("players", "username avatar")
    .populate("tournaments", "name status maxPlayers")
    .sort({ createdAt: -1 });

  return leagues;
}

  static async getActiveLeagues() {
    return LeagueModel.find({ status: "active" })
      .populate("owner", "name email")
      .sort({ createdAt: -1 });
  }

   static async addPlayer(leagueId, playerId, ownerId) {
    const league = await League.findById(leagueId);
    if (!league) throw new Error("League not found");

    if (ownerId && league.owner.toString() !== ownerId.toString()) {
      throw new Error("Only league owner can add players");
    }

    if (league.players.includes(playerId)) {
      throw new Error("Player already in league");
    }

    if (league.maxPlayers && league.players.length >= league.maxPlayers) {
      throw new Error("League is full");
    }

    const player = await User.findById(playerId);
    if (!player || player.role !== 'player') {
      throw new Error("Invalid player");
    }

    league.players.push(playerId);
    await league.save();

    return league;
  }

  static async removePlayer(leagueId, playerId) {
    const league = await League.findById(leagueId);
    if (!league) throw new Error("League not found");

    if (!league.players.includes(playerId)) {
      throw new Error("Player not in league");
    }

    league.players = league.players.filter(
      p => p.toString() !== playerId.toString()
    );
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
  static async getApplications(leagueId, status = null) {
    const league = await League.findById(leagueId);
    if (!league) throw new Error("League not found");

    const query = {
      target: leagueId,
      targetType: 'League'
    };

    if (status) {
      query.status = status;
    }

    const applications = await Application.find(query)
      .populate('user', 'name email stats')
      .sort({ createdAt: -1 });

    return applications;
  }

   static async approveApplication(leagueId, applicationId, reviewerId) {
    // STEP 1: Find and update Application document
    const application = await Application.findOne({
      _id: applicationId,
      target: leagueId,
      targetType: 'League',
      status: 'pending'
    });

    if (!application) {
      throw new Error("Application not found or already processed");
    }

    // STEP 2: Find league
    const league = await League.findById(leagueId);
    if (!league) throw new Error("League not found");

    // Verify reviewer is owner
    if (reviewerId && league.owner.toString() !== reviewerId.toString()) {
      throw new Error("Only league owner can approve applications");
    }

    // Check if league is full
    if (league.maxPlayers && league.players.length >= league.maxPlayers) {
      throw new Error("League is full");
    }

    // Check if player already in league
    if (league.players.includes(application.user)) {
      throw new Error("Player already in this league");
    }

    // STEP 3: Update application in collection
    application.status = 'approved';
    application.reviewedAt = new Date();
    if (reviewerId) {
      application.reviewedBy = reviewerId;
    }
    await application.save();

    // STEP 4: Add player to league
    league.players.push(application.user);

    // STEP 5: Optional - Remove from applications array once processed
    // (keeps array clean, only showing pending applications)
    league.applications = league.applications.filter(
      appId => appId.toString() !== applicationId.toString()
    );

    await league.save();

    return {
      message: "Application approved and player added to league",
      application,
      league
    };
  }


  static async rejectApplication(leagueId, applicationId, reviewerId, reason = null) {
    // STEP 1: Find and update Application document
    const application = await Application.findOne({
      _id: applicationId,
      target: leagueId,
      targetType: 'League',
      status: 'pending'
    });

    if (!application) {
      throw new Error("Application not found or already processed");
    }

    // STEP 2: Find league
    const league = await League.findById(leagueId);
    if (!league) throw new Error("League not found");

    // Verify reviewer is owner
    if (reviewerId && league.owner.toString() !== reviewerId.toString()) {
      throw new Error("Only league owner can reject applications");
    }

    // STEP 3: Update application
    application.status = 'rejected';
    application.reviewedAt = new Date();
    if (reviewerId) {
      application.reviewedBy = reviewerId;
    }
    if (reason) {
      application.rejectionReason = reason;
    }
    await application.save();

    // STEP 4: Remove from league's applications array
    league.applications = league.applications.filter(
      appId => appId.toString() !== applicationId.toString()
    );
    await league.save();

    return {
      message: "Application rejected",
      application
    };
  }
   static async getPendingApplicationsCount(leagueId) {
    const league = await League.findById(leagueId).select('applications');
  return league.applications.length;
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

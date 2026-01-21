// backend/domains/Player.js - FIXED VERSION
import User from "../schemas/UserSchema.js";
import League from "../schemas/LeagueSchema.js";
import Tournament from "../schemas/TournamentSchema.js";
import Application from "../schemas/ApplicationSchema.js";

export default class Player {

  /* ================================
     APPLY TO LEAGUE
  ================================= */
  static async applyToLeague(playerId, leagueId) {
  const player = await User.findById(playerId);
  console.log('✅ Player found:', player);
  if (!player || player.role !== "player") {
    throw new Error("Only players can apply to leagues");
  }

  if (player.status !== "active") {
    throw new Error("Inactive players cannot apply");
  }

  const league = await League.findById(leagueId);
  if (!league) {
    throw new Error("League not found");
  }

  // Check if already a member
  if (league.players.includes(playerId)) {
    throw new Error("Already a member of this league");
  }

  // Check if already applied in Application collection
  const existingApp = await Application.findOne({
    user: playerId,
    target: leagueId,
    targetType: 'League',
    status: 'pending'
  });

  if (existingApp) {
    throw new Error("Already applied to this league");
  }

  // STEP 1: Create and save Application document
  console.log('🔍 Creating application...');
  const application = await Application.create({
    user: playerId,
    target: leagueId,
    targetType: 'League',
    status: 'pending'
  });
 console.log('✅ Application created:', application);
  // STEP 2: Add application ID reference to league's applications array
  league.applications.push(application._id);
  await league.save();

  return {
    message: "Application submitted successfully",
    applicationId: application._id,
    leagueId: league._id,
    leagueName: league.name
  };
}
   /* ================================
     GET PLAYER'S APPLICATIONS
  ================================= */
  static async getMyApplications(playerId) {
  const player = await User.findById(playerId);
  if (!player || player.role !== "player") {
    throw new Error("User is not a player");
  }

  // Query Application collection directly
  const applications = await Application.find({
    user: playerId,
    targetType: 'League'
  })
    .populate('target', 'name game owner')
    .populate({ path: 'target', populate: { path: 'game', select: 'name type' } })
    .populate({ path: 'target', populate: { path: 'owner', select: 'name' } })
    .sort({ createdAt: -1 });

  return applications.map(app => ({
    _id: app._id,
    league: app.target,
    status: app.status,
    appliedAt: app.createdAt,
    reviewedAt: app.reviewedAt,
    type: 'league'
  }));
}
  /* ================================
     CANCEL APPLICATION
  ================================= */
static async cancelApplication(playerId, leagueId, applicationId) {
  console.log("May i delete your application?")
  console.log("DELETE DB:", Application.db.name);

  const player = await User.findById(playerId);
  if (!player || player.role !== "player") {
    throw new Error("User is not a player");
  }

  // Find application - simplified query (applicationId is unique)
  const application = await Application.findById(applicationId);
  
  if (!application) {
    throw new Error("Application not found");
  }

  // Verify ownership and status
  if (application.user.toString() !== playerId.toString()) {
    throw new Error("Not your application");
  }

  if (application.target.toString() !== leagueId.toString()) {
    throw new Error("Application does not belong to this league");
  }

  if (application.status !== 'pending') {
    throw new Error("Can only cancel pending applications");
  }

  if (application.targetType !== 'League') {
    throw new Error("Not a league application");
  }

  // STEP 1: Delete from Application collection
  const deleted = await Application.findByIdAndDelete(applicationId);
console.log("Deleted application:", deleted);

  // STEP 2: Remove reference from league's applications array
  const league = await League.findById(leagueId);
  if (league) {
    league.applications = league.applications.filter(
      appId => appId.toString() !== applicationId.toString()
    );
    await league.save();
  }
  console.log("Your application has been successfully deleted")
  return { message: "Application cancelled successfully" };
}
  /* ================================
     APPLY TO TOURNAMENT
  ================================= */
  static async applyToTournament(playerId, tournamentId) {
    const player = await User.findById(playerId);
    console.log('✅ Player found:', player);
    if (!player || player.role !== "player") {
      throw new Error("User is not a player");
    }

    const tournament = await Tournament.findById(tournamentId).populate('league');
    if (!tournament) throw new Error("Tournament not found");
    
    // Check tournament status
    if (tournament.status === 'started' || tournament.status === 'ongoing') {
      throw new Error("Tournament has already started");
    }

    // Check if player is in the league
    const league = await League.findById(tournament.league._id);
    if (!league.players.includes(playerId)) {
      throw new Error("Must be in league to join tournament");
    }

    // Check if already in tournament
    if (tournament.players.includes(playerId)) {
      throw new Error("Already joined this tournament");
    }

    // Check if tournament is full
    if (tournament.players.length >= tournament.maxPlayers) {
      throw new Error("Tournament is full");
    }

    // Check if already applied
    const existingApp = await Application.findOne({
      user: playerId,
      target: tournamentId,
      targetType: 'Tournament',
      status: 'pending'
    });

    if (existingApp) {
      throw new Error("Already applied to this tournament");
    }

    // For tournaments, you might want direct join OR application
    // Based on your LeagueOwner code, it looks like tournaments use applications too
    
    // If tournament requires approval:
    console.log('🔍 Creating application...');
    const application = await Application.create({
      user: playerId,
      target: tournamentId,
      targetType: 'Tournament',
      status: 'pending'
    });
console.log('✅ Application created:', application);
    return {
      message: "Application submitted successfully",
      applicationId: application._id,
      tournamentId: tournament._id,
      tournamentName: tournament.name
    };

    // OR if tournament allows direct join (no approval):
    // tournament.players.push(playerId);
    // await tournament.save();
    // return { message: "Successfully joined tournament" };
  }
/* ================================
     GET PLAYER'S TOURNAMENT APPLICATIONS
  ================================= */
  static async getMyTournamentApplications(playerId) {
    const player = await User.findById(playerId);
    if (!player || player.role !== "player") {
      throw new Error("User is not a player");
    }

    const applications = await Application.find({
      user: playerId,
      targetType: 'Tournament'
    })
      .populate('target', 'name league maxPlayers')
      .populate({ path: 'target', populate: { path: 'league', select: 'name' } })
      .sort({ createdAt: -1 });

    return applications.map(app => ({
      _id: app._id,
      tournament: app.target,
      status: app.status,
      appliedAt: app.createdAt,
      reviewedAt: app.reviewedAt,
      type: 'tournament'
    }));
  }
  /* ================================
     GET ALL MY APPLICATIONS (League + Tournament)
  ================================= */
  static async getAllMyApplications(playerId) {
    const player = await User.findById(playerId);
    if (!player || player.role !== "player") {
      throw new Error("User is not a player");
    }

    const applications = await Application.find({
      user: playerId
    })
      .populate('target')
      .sort({ createdAt: -1 });

    return applications.map(app => ({
      _id: app._id,
      target: app.target,
      targetType: app.targetType,
      status: app.status,
      appliedAt: app.createdAt,
      reviewedAt: app.reviewedAt
    }));
  }
  /* ================================
     GET PLAYER STATS (with application count)
  ================================= */
  static async getStats(playerId) {
    const user = await User.findById(playerId);
    if (!user || user.role !== "player") {
      throw new Error("User is not a player");
    }

    const leaguesCount = await League.countDocuments({ 
      players: playerId,
      status: 'active'
    });
    
    const tournamentsCount = await Tournament.countDocuments({ 
      players: playerId 
    });
    
    // Count pending applications using Application collection
    const pendingApplications = await Application.countDocuments({ 
      user: playerId,
      status: 'pending'
    });

    // Count matches to be played (Live, Ready, Upcoming)
    const Match = (await import("../schemas/MatchSchema.js")).default;
    const upcomingMatchesCount = await Match.countDocuments({
      players: playerId,
      status: { $in: ['live', 'ready', 'upcoming'] }
    });

    const totalGames = (user.stats?.wins || 0) + (user.stats?.losses || 0) + (user.stats?.draws || 0);
    const winRate = totalGames > 0
      ? ((user.stats.wins / totalGames) * 100).toFixed(1)
      : '0.0';

    return {
      wins: user.stats?.wins || 0,
      losses: user.stats?.losses || 0,
      draws: user.stats?.draws || 0,
      points: user.stats?.points || 0,
      leaguesCount,
      tournamentsCount,
      pendingApplications,
      winRate: `${winRate}%`,
      totalGames,       // Finished matches
      finishedMatches: totalGames, // Alias for clarity
      upcomingMatchesCount // To be played
    };
  }
 /* ================================
     GET MY TOURNAMENTS
  ================================= */
  static async getMyTournaments(playerId) {
    const player = await User.findById(playerId);
    if (!player || player.role !== "player") {
      throw new Error("User is not a player");
    }

    return Tournament.find({ players: playerId })
      .populate('league', 'name game')
      .populate({ path: 'league', populate: { path: 'game', select: 'name type' } })
      .populate('players', 'name email stats')
      .populate('winners', 'name email')
      .sort({ createdAt: -1 });
  }

  
  /* ================================
     GET PLAYER'S LEAGUES
  ================================= */
  static async getMyLeagues(playerId) {
    const player = await User.findById(playerId);
    if (!player || player.role !== "player") {
      throw new Error("User is not a player");
    }

    return League.find({ players: playerId, status: 'active' })
      .populate('owner', 'name email')
      .populate('game', 'name type description')
      .populate('ratingFormula', 'name winnerScore drawScore loserScore')
      .populate('players', 'name email stats')
      .sort({ createdAt: -1 });
  }

  

  /* ================================
     GET AVAILABLE TOURNAMENTS
  ================================= */
  static async getAvailableTournaments(playerId) {
    const player = await User.findById(playerId);
    if (!player || player.role !== "player") {
      throw new Error("User is not a player");
    }

    const leagues = await League.find({ 
      players: playerId, 
      status: 'active' 
    }).select('_id');
    
    const leagueIds = leagues.map(l => l._id);

    return Tournament.find({
      league: { $in: leagueIds },
      status: 'open_for_applications',
      players: { $ne: playerId }
    })
      .populate('league', 'name game')
      .populate({ path: 'league', populate: { path: 'game', select: 'name type' } })
      .populate('players', 'name')
      .sort({ startDate: 1 });
  }


  /* ================================
     GET PLAYER STATS - FIXED
  ================================= */
 /* static async getStats(playerId) {
    const user = await User.findById(playerId);
    if (!user || user.role !== "player") {
      throw new Error("User is not a player");
    }

    const leaguesCount = await League.countDocuments({ 
      players: playerId,
      status: 'active'
    });
    
    const tournamentsCount = await Tournament.countDocuments({ 
      players: playerId 
    });
    
    const pendingApplications = await League.countDocuments({ 
      'applications': { 
        $elemMatch: { 
          player: playerId, 
          status: 'pending' 
        } 
      } 
    });

    const totalGames = (user.stats?.wins || 0) + (user.stats?.losses || 0);
    const winRate = totalGames > 0
      ? ((user.stats.wins / totalGames) * 100).toFixed(1)
      : '0.0';

    return {
      wins: user.stats?.wins || 0,
      losses: user.stats?.losses || 0,
      draws: user.stats?.draws || 0,
      points: user.stats?.points || 0,
      leaguesCount,
      tournamentsCount,
      pendingApplications,
      winRate: `${winRate}%`,
      totalGames
    };
  }*/

   /* ================================
     LEAVE LEAGUE
  ================================= */
  static async leaveLeague(playerId, leagueId) {
    const player = await User.findById(playerId);
    if (!player || player.role !== "player") {
      throw new Error("User is not a player");
    }

    const league = await League.findById(leagueId);
    if (!league) throw new Error("League not found");
    if (!league.players.includes(playerId)) {
      throw new Error("Not a member of this league");
    }

    league.players = league.players.filter(
      p => p.toString() !== playerId.toString()
    );
    await league.save();

    return { message: "Successfully left the league" };
  }


  /* ================================
     DROP OUT OF TOURNAMENT
  ================================= */
  static async dropOutOfTournament(playerId, tournamentId) {
    const player = await User.findById(playerId);
    if (!player || player.role !== "player") {
      throw new Error("User is not a player");
    }

    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) throw new Error("Tournament not found");

    if (tournament.status === "ongoing" || tournament.status === "finished") {
      throw new Error("Cannot drop out of ongoing or finished tournament");
    }

    if (!tournament.players.includes(playerId)) {
      throw new Error("You are not in this tournament");
    }

    tournament.players = tournament.players.filter(
      p => p.toString() !== playerId.toString()
    );

    await tournament.save();

    return {
      message: "Successfully dropped out of tournament",
      tournamentId: tournament._id
    };
  }

  /* ================================
     FORFEIT TOURNAMENT
  ================================= */
  static async forfeitTournament(playerId, tournamentId) {
    const Match = (await import("../schemas/MatchSchema.js")).default;
    
    const player = await User.findById(playerId);
    if (!player || player.role !== "player") {
      throw new Error("User is not a player");
    }

    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) throw new Error("Tournament not found");
    if (tournament.status !== "ongoing") {
      throw new Error("Tournament is not in progress");
    }
    if (!tournament.players.includes(playerId)) {
      throw new Error("You are not in this tournament");
    }

    const playerMatches = await Match.find({
      tournament: tournamentId,
      players: playerId,
      status: { $in: ["upcoming", "live"] }
    });

    for (const match of playerMatches) {
      const opponent = match.players.find(
        p => p.toString() !== playerId.toString()
      );

      match.status = "finished";
      match.winner = opponent;
      match.score = {
        player1: match.players[0].toString() === opponent.toString() ? 1 : 0,
        player2: match.players[1].toString() === opponent.toString() ? 1 : 0
      };

      await match.save();

      await User.findByIdAndUpdate(opponent, {
        $inc: { "stats.wins": 1 }
      });

      await User.findByIdAndUpdate(playerId, {
        $inc: { "stats.losses": 1 }
      });
    }

    return {
      message: `Forfeited ${playerMatches.length} remaining matches`,
      forfeitedMatches: playerMatches.length
    };
  }

  /* ================================
     CHECK IF CAN DROP OUT
  ================================= */
  static async canDropOut(playerId, tournamentId) {
    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) throw new Error("Tournament not found");

    const canDrop = 
      (tournament.status === "open_for_applications" || 
       tournament.status === "upcoming") &&
      tournament.players.includes(playerId);

    return {
      canDropOut: canDrop,
      status: tournament.status,
      reason: canDrop ? null : "Tournament already started or you're not enrolled"
    };
  }

  /* ================================
     GET ACTIVE TOURNAMENTS
  ================================= */
  static async getActiveTournaments(playerId) {
    const player = await User.findById(playerId);
    if (!player || player.role !== "player") {
      throw new Error("User is not a player");
    }

    return Tournament.find({
      players: playerId,
      status: { $in: ["open_for_applications", "upcoming", "ongoing"] }
    })
      .populate("league", "name game")
      .populate({ path: "league", populate: { path: "game", select: "name type" } })
      .sort({ playStartDate: 1 });
  }

  /* ================================
     GET MATCH SCHEDULE
  ================================= */
  static async getMatchSchedule(playerId) {
    const Match = (await import("../schemas/MatchSchema.js")).default;
    
    const player = await User.findById(playerId);
    if (!player || player.role !== "player") {
      throw new Error("User is not a player");
    }

    const matches = await Match.find({
      players: playerId,
      status: { $in: ["upcoming", "live"] }
    })
      .populate("tournament", "name playStartDate")
      .populate("players", "name")
      .populate("game", "name")
      .sort({ createdAt: 1 });

    return matches;
  }

  /* ================================
     RECORD MATCH RESULT
  ================================= */
  static async recordMatchResult(playerId, matchResult, points = 0) {
    const updates = {};

    if (matchResult === "WIN") updates["stats.wins"] = 1;
    else if (matchResult === "LOSE") updates["stats.losses"] = 1;
    else if (matchResult === "DRAW") updates["stats.draws"] = 1;
    else throw new Error("Invalid match result");

    updates["stats.points"] = points;

    const result = await User.updateOne(
      { _id: playerId, role: "player" },
      { $inc: updates }
    );

    if (result.matchedCount === 0) {
      throw new Error("Player not found");
    }

    return { message: "Match result recorded" };
  }
}
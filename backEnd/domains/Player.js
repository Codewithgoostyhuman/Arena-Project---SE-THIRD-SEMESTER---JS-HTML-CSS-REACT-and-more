// backend/domains/Player.js
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

    const alreadyApplied = league.applications.some(
      app => app.applicant.toString() === playerId
    );
    if (alreadyApplied) {
      throw new Error("Already applied to this league");
    }

    const application = new Application({
      applicant: playerId,
      target: leagueId,
      type: "league",
      status: "pending"
    });

    league.applications.push(application);
    await league.save();

    return application;
  }

  /* ================================
     GET PLAYER'S TOURNAMENTS
  ================================= */
  static async getMyTournaments(playerId) {
    // Verify user is a player
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
     APPLY TO TOURNAMENT
  ================================= */
  static async applyToTournament(playerId, tournamentId) {
    const player = await User.findById(playerId);
    if (!player || player.role !== "player") {
      throw new Error("User is not a player");
    }

    const tournament = await Tournament.findById(tournamentId).populate('league');
    if (!tournament) throw new Error("Tournament not found");
    if (tournament.status === 'started') throw new Error("Tournament has already started");

    const league = await League.findById(tournament.league._id);
    if (!league.players.includes(playerId)) {
      throw new Error("Must be in league to join tournament");
    }
    if (tournament.players.includes(playerId)) {
      throw new Error("Already joined");
    }
    if (tournament.players.length >= tournament.maxPlayers) {
      throw new Error("Tournament full");
    }

    tournament.players.push(playerId);
    await tournament.save();
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
  }

  /* ================================
     GET PLAYER'S LEAGUES
  ================================= */
  static async getMyLeagues(playerId) {
    // Verify user is a player
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
     GET PLAYER'S APPLICATIONS
  ================================= */
  static async getMyApplications(playerId) {
    // Verify user is a player
    const player = await User.findById(playerId);
    if (!player || player.role !== "player") {
      throw new Error("User is not a player");
    }

    const leagues = await League.find({ 'applications.player': playerId })
      .populate('game', 'name type')
      .populate('owner', 'name')
      .select('name game owner applications');

    const applications = [];
    leagues.forEach(league => {
      league.applications
        .filter(app => app.player.toString() === playerId.toString())
        .forEach(app => applications.push({
          _id: app._id,
          league: { 
            _id: league._id, 
            name: league.name, 
            game: league.game, 
            owner: league.owner 
          },
          status: app.status,
          appliedAt: app.appliedAt,
          reviewedAt: app.reviewedAt,
          type: 'league'
        }));
    });

    return applications.sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt));
  }

  /* ================================
     GET AVAILABLE TOURNAMENTS
  ================================= */
  static async getAvailableTournaments(playerId) {
    // Verify user is a player
    const player = await User.findById(playerId);
    if (!player || player.role !== "player") {
      throw new Error("User is not a player");
    }

    const leagues = await League.find({ players: playerId, status: 'active' }).select('_id');
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
     GET PLAYER STATS
  ================================= */
  static async getStats(playerId) {
    const user = await User.findById(playerId);
    if (!user || user.role !== "player") {
      throw new Error("User is not a player");
    }

    const leaguesCount = await League.countDocuments({ players: playerId });
    const tournamentsCount = await Tournament.countDocuments({ players: playerId });
    const pendingApplications = await League.countDocuments({ 
      applications: { $elemMatch: { player: playerId, status: 'pending' } } 
    });

    return {
      ...user.stats,
      leaguesCount,
      tournamentsCount,
      pendingApplications,
      winRate: user.stats.wins + user.stats.losses > 0
        ? ((user.stats.wins / (user.stats.wins + user.stats.losses)) * 100).toFixed(1)
        : 0
    };
  }

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
    if (!league.players.includes(playerId)) throw new Error("Not a member");

    league.players = league.players.filter(p => p.toString() !== playerId.toString());
    await league.save();
  }

  /* ================================
     CANCEL APPLICATION
  ================================= */
  static async cancelApplication(playerId, leagueId, applicationId) {
    const player = await User.findById(playerId);
    if (!player || player.role !== "player") {
      throw new Error("User is not a player");
    }

    const league = await League.findById(leagueId);
    if (!league) throw new Error("League not found");

    const application = league.applications.id(applicationId);
    if (!application) throw new Error("Application not found");
    if (application.player.toString() !== playerId.toString()) {
      throw new Error("Not your application");
    }
    if (application.status !== 'pending') {
      throw new Error("Can only cancel pending applications");
    }

    league.applications.pull(applicationId);
    await league.save();
  }
  /**
 * DROP OUT OF TOURNAMENT (Before it starts)
 * Can only drop before tournament begins
 */
static async dropOutOfTournament(playerId, tournamentId) {
  const Tournament = (await import("../schemas/TournamentSchema.js")).default;
  const User = (await import("../schemas/UserSchema.js")).default;

  const player = await User.findById(playerId);
  if (!player || player.role !== "player") {
    throw new Error("User is not a player");
  }

  const tournament = await Tournament.findById(tournamentId);
  if (!tournament) throw new Error("Tournament not found");

  // Can only drop out before tournament starts
  if (tournament.status === "ongoing" || tournament.status === "finished") {
    throw new Error("Cannot drop out of ongoing or finished tournament");
  }

  // Check if player is in tournament
  if (!tournament.players.includes(playerId)) {
    throw new Error("You are not in this tournament");
  }

  // Remove player from tournament
  tournament.players = tournament.players.filter(
    p => p.toString() !== playerId.toString()
  );

  // Update player's applications status
  const application = tournament.applications.find(
    app => app.player.toString() === playerId.toString()
  );
  if (application) {
    application.status = "withdrawn";
  }

  await tournament.save();

  return {
    message: "Successfully dropped out of tournament",
    tournament
  };
}

/**
 * FORFEIT TOURNAMENT (During tournament)
 * Forfeits all remaining matches
 */
static async forfeitTournament(playerId, tournamentId) {
  const Tournament = (await import("../schemas/TournamentSchema.js")).default;
  const Match = (await import("../schemas/MatchSchema.js")).default;
  const User = (await import("../schemas/UserSchema.js")).default;

  const player = await User.findById(playerId);
  if (!player || player.role !== "player") {
    throw new Error("User is not a player");
  }

  const tournament = await Tournament.findById(tournamentId)
    .populate("matches");

  if (!tournament) throw new Error("Tournament not found");

  if (tournament.status !== "ongoing") {
    throw new Error("Tournament is not in progress");
  }

  // Check if player is in tournament
  if (!tournament.players.includes(playerId)) {
    throw new Error("You are not in this tournament");
  }

  // Find all remaining matches for this player
  const playerMatches = await Match.find({
    tournament: tournamentId,
    players: playerId,
    status: { $in: ["upcoming", "live"] }
  });

  // Forfeit all remaining matches
  for (const match of playerMatches) {
    // Determine winner (the other player)
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

    // Update stats
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

/**
 * CHECK IF PLAYER CAN DROP OUT
 */
static async canDropOut(playerId, tournamentId) {
  const Tournament = (await import("../schemas/TournamentSchema.js")).default;

  const tournament = await Tournament.findById(tournamentId);
  if (!tournament) throw new Error("Tournament not found");

  // Can drop out if:
  // 1. Tournament hasn't started yet
  // 2. Player is in the tournament
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

/**
 * GET PLAYER'S ACTIVE TOURNAMENTS
 */
static async getActiveTournaments(playerId) {
  const Tournament = (await import("../schemas/TournamentSchema.js")).default;
  const User = (await import("../schemas/UserSchema.js")).default;

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

/**
 * GET PLAYER'S MATCH SCHEDULE
 */
static async getMatchSchedule(playerId) {
  const Match = (await import("../schemas/MatchSchema.js")).default;
  const User = (await import("../schemas/UserSchema.js")).default;

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
}
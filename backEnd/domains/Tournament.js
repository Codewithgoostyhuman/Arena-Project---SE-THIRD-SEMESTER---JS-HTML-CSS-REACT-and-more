import Tournament from '../schemas/TournamentSchema.js'
import League from '../schemas/LeagueSchema.js';

export default class Tournament {

  /* ================================
     CREATE TOURNAMENT
  ================================= */
  static async createTournament(data) {
    const tournament = new Tournament(data);
    await tournament.save();
    return tournament;
  }

  /* ================================
     GET TOURNAMENT BY ID
  ================================= */
  static async getTournamentById(tournamentId) {
    const tournament = await Tournament.findById(tournamentId)
      .populate('league', 'name game')
      .populate({ path: 'league', populate: { path: 'game', select: 'name type' } })
      .populate('players', 'name email stats')
      .populate('winners', 'name email')
      .populate('applications.player', 'name email')
      .populate('exclusiveSponsor', 'name');
    if (!tournament) throw new Error("Tournament not found");
    return tournament;
  }

  /* ================================
     UPDATE TOURNAMENT
  ================================= */
  static async updateTournament(tournamentId, data) {
    const tournament = await Tournament.findByIdAndUpdate(tournamentId, data, { new: true });
    if (!tournament) throw new Error("Tournament not found");
    return tournament;
  }

  /* ================================
     DELETE TOURNAMENT
  ================================= */
  static async deleteTournament(tournamentId) {
    const tournament = await Tournament.findByIdAndDelete(tournamentId);
    if (!tournament) throw new Error("Tournament not found");
    return tournament;
  }

  /* ================================
     PLAYER APPLICATION
  ================================= */
  static async apply(playerId, tournamentId) {
    const tournament = await Tournament.findById(tournamentId).populate('league');
    if (!tournament) throw new Error("Tournament not found");
    if (tournament.status !== "open_for_applications") throw new Error("Tournament not open");

    const league = await League.findById(tournament.league._id);
    if (!league.players.includes(playerId)) throw new Error("Must be a member of the league");

    if (tournament.players.includes(playerId)) throw new Error("Already joined");
    if (tournament.players.length >= tournament.maxPlayers) throw new Error("Tournament full");

    // Add application
    tournament.applications.push({ player: playerId });
    await tournament.save();
    return tournament;
  }

  /* ================================
     APPROVE / REJECT APPLICATION
  ================================= */
  static async updateApplicationStatus(tournamentId, applicationId, status) {
    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) throw new Error("Tournament not found");

    const app = tournament.applications.id(applicationId);
    if (!app) throw new Error("Application not found");

    app.status = status;
    app.reviewedAt = new Date();

    // Add to players if approved
    if (status === "approved") tournament.players.push(app.player);

    await tournament.save();
    return tournament;
  }

  /* ================================
     RECORD MATCH RESULT
  ================================= */
  static async recordMatchResult(tournamentId, matchId, winnerId, isDraw = false) {
    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) throw new Error("Tournament not found");

    const match = tournament.matches.id(matchId);
    if (!match) throw new Error("Match not found");

    match.winner = winnerId;
    match.isDraw = isDraw;
    await tournament.save();
    return match;
  }

  /* ================================
     GET AVAILABLE TOURNAMENTS FOR PLAYER
  ================================= */
  static async getAvailableTournaments(playerId) {
    const leagues = await League.find({ players: playerId, status: 'active' }).select('_id');
    const leagueIds = leagues.map(l => l._id);

    return TournamentModel.find({
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
     ADD EXCLUSIVE SPONSOR
  ================================= */
  static async addExclusiveSponsor(tournamentId, advertiserId) {
    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) throw new Error("Tournament not found");
    tournament.exclusiveSponsor = advertiserId;
    tournament.status = "seeking_sponsors";
    await tournament.save();
    return tournament;
  }

  /* ================================
     ADD ADVERTISEMENT
  ================================= */
  static async addAdvertisement(tournamentId, adId) {
    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) throw new Error("Tournament not found");
    tournament.advertisements.push(adId);
    await tournament.save();
    return tournament;
  }

  /* ================================
     NOTIFY INTEREST GROUPS
  ================================= */
  static async notifyGroups(tournamentId, groupIds) {
    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) throw new Error("Tournament not found");
    tournament.notifiedGroups.push(...groupIds);
    await tournament.save();
    return tournament;
  }

  /* ================================
     GET TOURNAMENT WINNERS
  ================================= */
  static async getWinners(tournamentId) {
    const tournament = await Tournament.findById(tournamentId)
      .populate('winners', 'name email');
    if (!tournament) throw new Error("Tournament not found");
    return tournament.winners;
  }

  /* ================================
     GET ALL PLAYERS
  ================================= */
  static async getPlayers(tournamentId) {
    const tournament = await Tournament.findById(tournamentId)
      .populate('players', 'name email stats');
    if (!tournament) throw new Error("Tournament not found");
    return tournament.players;
  }
  // Submit match result
  static async submitMatchResult(tournamentId, matchId, winnerId, score) {
    const tournament = await TournamentModel.findById(tournamentId).populate("matches players");
    if (!tournament) throw new Error("Tournament not found");

    const match = tournament.matches.id(matchId);
    if (!match) throw new Error("Match not found");

    match.winner = winnerId;
    match.score = score;
    match.status = "completed";

    await tournament.save();
    return match;
  }

  // Check if tournament is finished & declare winner
  static async finalizeTournament(tournamentId) {
    const tournament = await TournamentModel.findById(tournamentId).populate("matches players");
    if (!tournament) throw new Error("Tournament not found");

    // Check all matches completed
    const incomplete = tournament.matches.some(m => m.status !== "completed");
    if (incomplete) throw new Error("Tournament is not finished yet");

    // Determine winner: simplest = most match wins
    const winCounts = {};
    tournament.players.forEach(p => winCounts[p.toString()] = 0);
    tournament.matches.forEach(m => {
      if (m.winner) winCounts[m.winner.toString()] += 1;
    });

    const winnerId = Object.keys(winCounts).reduce((a, b) => winCounts[a] > winCounts[b] ? a : b);
    tournament.status = "completed";
    tournament.winner = winnerId;
    await tournament.save();
    return tournament;
  }


}

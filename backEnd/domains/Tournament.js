import TournamentModel from '../schemas/TournamentSchema.js'
import League from '../schemas/LeagueSchema.js';
import User from "../schemas/UserSchema.js"
import Application from "../schemas/ApplicationSchema.js"
export default class Tournament {

  /* ================================
     CREATE TOURNAMENT
  ================================= */
  static async createTournament(data) {
    const tournament = new TournamentModel(data);
    await tournament.save();
    return tournament;
  }

  /* ================================
     GET TOURNAMENT BY ID
  ================================= */
  static async getTournamentById(tournamentId) {
    const tournament = await TournamentModel.findById(tournamentId)
      .populate('league', 'name game')
      .populate({ path: 'league', populate: { path: 'game', select: 'name type' } })
      .populate('players', 'name email stats')
      .populate('winners', 'name email')
      .populate('applications', 'user status createdAt')
      .populate({
        path: 'matches',
        populate: { path: 'players', select: 'name email' }
      })
      .populate('exclusiveSponsor', 'companyName')
      .populate('sponsorshipRequests.advertiser', 'companyName');
    if (!tournament) throw new Error("Tournament not found");
    return tournament;
  }

  /* ================================
     UPDATE TOURNAMENT
  ================================= */
  static async updateTournament(tournamentId, data) {
    const tournament = await TournamentModel.findByIdAndUpdate(tournamentId, data, { new: true });
    if (!tournament) throw new Error("Tournament not found");
    return tournament;
  }

  /* ================================
     DELETE TOURNAMENT
  ================================= */
  static async deleteTournament(tournamentId) {
    const tournament = await TournamentModel.findByIdAndDelete(tournamentId);
    if (!tournament) throw new Error("Tournament not found");
    return tournament;
  }

  /* ================================
     PLAYER APPLICATION
  ================================= */
  static async apply(playerId, tournamentId) {
     const player = await User.findById(playerId);
        console.log('✅ Player found:', player);
        if (!player || player.role !== "player") {
          throw new Error("User is not a player");
        }
    
        const tournament = await TournamentModel.findById(tournamentId).populate('league');
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
  
        console.log('🔍 Creating application...');
        const application = await Application.create({
          user: playerId,
          target: tournamentId,
          targetType: 'Tournament',
          status: 'pending'
        });
        console.log('✅ Application created:', application);
console.log('📝 Application ID type:', typeof application._id);
console.log('📝 Application ID value:', application._id);
console.log('📝 Application ID toString:', application._id.toString());
        tournament.applications.push(application._id);
        console.log('📝 Tournament applications before save:', tournament.applications);
  await tournament.save();
  console.log('📝 Tournament applications after save:', tournament.applications);
  console.log('✅ Application added to tournament');
    console.log('✅ Application created:', application);
        return {
          message: "Application submitted successfully",
          applicationId: application._id,
          tournamentId: tournament._id,
          tournamentName: tournament.name
        };
  }

 /* ================================
   CANCEL TOURNAMENT APPLICATION
================================= */
static async cancelApplication(playerId, tournamentId, applicationId) {
  // Find the application in the Application collection
  const application = await Application.findById(applicationId);
  if (!application) throw new Error("Application not found");

  // Verify the application belongs to the player
  if (application.user.toString() !== playerId.toString()) {
    throw new Error("Unauthorized to cancel this application");
  }

  // Verify it's for this tournament
  if (application.target.toString() !== tournamentId.toString()) {
    throw new Error("Application does not belong to this tournament");
  }

  // Can only cancel pending applications
  if (application.status !== 'pending') {
    throw new Error("Can only cancel pending applications");
  }

  // Delete the application from the Application collection
  await Application.findByIdAndDelete(applicationId);

  // Remove the reference from the tournament
  const tournament = await TournamentModel.findById(tournamentId);
  if (tournament) {
    tournament.applications.pull(applicationId);
    await tournament.save();
  }

  return { message: "Application cancelled successfully" };
}

  /* ================================
     LEAVE TOURNAMENT
  ================================= */
  static async leaveTournament(playerId, tournamentId) {
    const tournament = await TournamentModel.findById(tournamentId);
    if (!tournament) throw new Error("Tournament not found");

    // Cannot leave if tournament is ongoing or completed
    if (tournament.status === 'ongoing' || tournament.status === 'finished') {
      throw new Error("Cannot leave tournament that is ongoing or finished");
    }

    // Check if player is in the tournament
    if (!tournament.players.includes(playerId)) {
      throw new Error("You are not in this tournament");
    }

    // Remove player
    tournament.players.pull(playerId);
    await tournament.save();
    return tournament;
  }

  /* ================================
   GET PLAYER'S TOURNAMENT APPLICATIONS
================================= */
static async getPlayerApplications(playerId) {
  // Query the Application collection, not tournament subdocuments
  const applications = await Application.find({
    user: playerId,
    targetType: 'Tournament'
  })
    .populate({
      path: 'target',
      populate: [
        { path: 'league', select: 'name game' },
        { path: 'league', populate: { path: 'game', select: 'name type' } }
      ]
    })
    .sort({ createdAt: -1 });

  // Format the response, filtering out applications with missing/deleted tournaments
  return applications
    .filter(app => app.target)
    .map(app => ({
      _id: app._id,
      tournament: {
        _id: app.target._id,
        name: app.target.name,
        startDate: app.target.playStartDate,
        status: app.target.status,
        league: app.target.league
      },
      status: app.status,
      appliedAt: app.createdAt,
      reviewedAt: app.updatedAt
    }));
}

  /* ================================
   APPROVE / REJECT APPLICATION
================================= */
static async updateApplicationStatus(tournamentId, applicationId, status) {
  // Find the application in the Application collection
  const application = await Application.findById(applicationId);
  if (!application) throw new Error("Application not found");

  // Verify it's for this tournament
  if (application.target.toString() !== tournamentId.toString()) {
    throw new Error("Application does not belong to this tournament");
  }

  // Update the application status
  application.status = status;
  await application.save();

  // If approved, add player to tournament
  if (status === "approved") {
    const tournament = await TournamentModel.findById(tournamentId);
    if (!tournament) throw new Error("Tournament not found");
    
    // Add player to tournament if not already there
    if (!tournament.players.includes(application.user)) {
      tournament.players.push(application.user);
      await tournament.save();
    }
  }

  // Remove from tournament's applications array
  const tournament = await TournamentModel.findById(tournamentId);
  if (tournament) {
    tournament.applications.pull(applicationId);
    await tournament.save();
  }

  return application;
}

  /* ================================
     RECORD MATCH RESULT
  ================================= */
  static async recordMatchResult(tournamentId, matchId, winnerId, isDraw = false) {
    const match = await MatchModel.findById(matchId);
    if (!match) throw new Error("Match not found");

    match.winner = winnerId;
    match.isDraw = isDraw;
    match.status = "finished";
    await match.save();
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
     GET PLAYER'S TOURNAMENTS
  ================================= */
  static async getPlayerTournaments(playerId) {
    return TournamentModel.find({ 
      players: playerId 
    })
      .populate('league', 'name game')
      .populate({ path: 'league', populate: { path: 'game', select: 'name type' } })
      .populate('players', 'name')
      .populate('matches')
      .sort({ createdAt: -1 });
  }

  /* ================================
     ADD EXCLUSIVE SPONSOR
  ================================= */
  static async addExclusiveSponsor(tournamentId, advertiserId) {
    const tournament = await TournamentModel.findById(tournamentId);
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
    const tournament = await TournamentModel.findById(tournamentId);
    if (!tournament) throw new Error("Tournament not found");
    tournament.advertisements.push(adId);
    await tournament.save();
    return tournament;
  }

  /* ================================
     NOTIFY INTEREST GROUPS
  ================================= */
  static async notifyGroups(tournamentId, groupIds) {
    const tournament = await TournamentModel.findById(tournamentId);
    if (!tournament) throw new Error("Tournament not found");
    tournament.notifiedGroups.push(...groupIds);
    await tournament.save();
    return tournament;
  }

  /* ================================
     GET TOURNAMENT WINNERS
  ================================= */
  static async getWinners(tournamentId) {
    const tournament = await TournamentModel.findById(tournamentId)
      .populate('winners', 'name email');
    if (!tournament) throw new Error("Tournament not found");
    return tournament.winners;
  }

  /* ================================
     GET ALL PLAYERS
  ================================= */
  static async getPlayers(tournamentId) {
    const tournament = await TournamentModel.findById(tournamentId)
      .populate('players', 'name email stats');
    if (!tournament) throw new Error("Tournament not found");
    return tournament.players;
  }

  /* ================================
     SUBMIT MATCH RESULT
  ================================= */
  static async submitMatchResult(tournamentId, matchId, winnerId, score) {
    const match = await MatchModel.findById(matchId);
    if (!match) throw new Error("Match not found");

    match.winner = winnerId;
    match.score = score;
    match.status = "finished";

    await match.save();
    return match;
  }

  /* ================================
     FINALIZE TOURNAMENT
  ================================= */
  static async finalizeTournament(tournamentId) {
    const tournament = await TournamentModel.findById(tournamentId).populate("matches players");
    if (!tournament) throw new Error("Tournament not found");

    // Check all matches finished
    const incomplete = tournament.matches.some(m => m.status !== "finished");
    if (incomplete) throw new Error("Tournament is not finished yet");

    // Determine winner: simplest = most match wins
    const winCounts = {};
    tournament.players.forEach(p => winCounts[p._id.toString()] = 0);
    tournament.matches.forEach(m => {
      if (m.winner) {
        const winnerId = m.winner.toString();
        if (winCounts[winnerId] !== undefined) {
          winCounts[winnerId] += 1;
        }
      }
    });

    const winnerId = Object.keys(winCounts).reduce((a, b) => winCounts[a] > winCounts[b] ? a : b);
    tournament.status = "finished";
    tournament.winners = [winnerId];
    await tournament.save();
    return tournament;
  }

  /* ================================
     GET OWNER'S TOURNAMENTS
  ================================= */
  static async getOwnerTournaments(userId){
    const leagues = await League.find({owner:userId}).select('_id');
    if(!leagues || leagues.length === 0){
      return [];
    }
    const leagueIds = leagues.map(l=>l._id);
    //get all tournaments
    const tournaments = await TournamentModel.find({
      league:{$in:leagueIds}
    }).populate('league','name game')
    .populate('players',"username avatar")
    .populate('matches')
    .sort({createdAt:-1});
    return tournaments;
  }

  /* ================================
     GET TOURNAMENT BRACKETS
  ================================= */
  static async getTournamentBrackets(tournamentId) {
    const tournament = await TournamentModel.findById(tournamentId)
      .populate('matches')
      .populate('players', 'name avatar');
    
    if (!tournament) throw new Error("Tournament not found");
    
    return {
      tournamentId: tournament._id,
      style: tournament.style,
      matches: tournament.matches,
      players: tournament.players
    };
  }

  /* ================================
     GET TOURNAMENT LEADERBOARD
  ================================= */
  static async getTournamentLeaderboard(tournamentId) {
    const tournament = await TournamentModel.findById(tournamentId)
      .populate('players', 'name stats')
      .populate('matches');
    
    if (!tournament) throw new Error("Tournament not found");

    // Calculate leaderboard
    const leaderboard = tournament.players.map(player => {
      const wins = tournament.matches.filter(
        m => m.winner && m.winner.toString() === player._id.toString()
      ).length;
      
      const matchesPlayed = tournament.matches.filter(
        m => m.players.some(p => p.toString() === player._id.toString())
      ).length;

      return {
        player: player,
        wins,
        losses: matchesPlayed - wins,
        matchesPlayed
      };
    });

    // Sort by wins
    leaderboard.sort((a, b) => b.wins - a.wins);

    return leaderboard;
  }
}
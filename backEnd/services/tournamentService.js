// backend/services/tournamentService.js
import TournamentModel from "../schemas/TournamentSchema.js";
import MatchModel from "../schemas/MatchSchema.js";
import LeagueModel from "../schemas/LeagueSchema.js";
import RatingFormula from "../schemas/RatingFormulaSchema.js";
import User from "../schemas/UserSchema.js";
import tournamentStyleService from "./tournamentStyleService.js";
import notificationService from "./notificationService.js";
import matchGameService from "./matchService.js";
import tournamentBracketService from "./tournamentBracketService.js";
import Tournament from "../domains/Tournament.js";

class TournamentService {
  /**
   * Step 2.3: ANNOUNCE TOURNAMENT - Complete Workflow
   * Creates tournament with sponsorship and notification support
   */
  getLiveTournaments = async (req, res, next) => {
    try {
      const tournaments = await TournamentModel.find({ 
        status: 'in-progress',
        visibility: 'public'
      })
      .populate('league', 'name logo')
      .populate('game', 'name')
      .sort({ startDate: -1 })
      .limit(10);
  
      res.json(tournaments);
    } catch (error) {
      console.error('Error fetching live tournaments:', error);
      next(error);
    }
  };
  
  getUpcomingTournaments = async (req, res, next) => {
    try {
      const tournaments = await TournamentModel.find({ 
        status: 'registration',
        startDate: { $gt: new Date() },
        visibility: 'public'
      })
      .populate('league', 'name logo')
      .populate('game', 'name')
      .sort({ startDate: 1 })
      .limit(10);
  
      res.json(tournaments);
    } catch (error) {
      console.error('Error fetching upcoming tournaments:', error);
      next(error);
    }
  };
  
  getTournamentById = async (tournamentId) => {
    try {
      return await Tournament.getTournamentById(tournamentId);
    } catch (error) {
      console.error('Error fetching tournament:', error);
      throw error;
    }
  };

  async announceTournament(leagueOwnerId, tournamentData) {
    const {
      name,
      leagueId,
      style,
      maxPlayers,
      applicationStartDate,
      applicationEndDate,
      playStartDate,
      playEndDate,
      seekSponsorship,
      selectedAdvertisers
    } = tournamentData;

    if (new Date(applicationStartDate) >= new Date(applicationEndDate)) {
      throw new Error("Application end date must be after start date");
    }
    if (new Date(applicationEndDate) >= new Date(playStartDate)) {
      throw new Error("Play dates must be after application dates");
    }

    const league = await LeagueModel.findById(leagueId);
    if (!league) throw new Error("League not found");
    if (league.owner.toString() !== leagueOwnerId.toString()) {
      throw new Error("You don't own this league");
    }

    const tournament = new TournamentModel({
      name,
      league: leagueId,
      style,
      maxPlayers,
      applicationStartDate,
      applicationEndDate,
      playStartDate,
      playEndDate,
      status: seekSponsorship ? "seeking_sponsors" : "open_for_applications"
    });

    await tournament.save();

    league.tournaments.push(tournament._id);
    await league.save();

    if (seekSponsorship && selectedAdvertisers?.length > 0) {
      await this.seekSponsorship(tournament._id, selectedAdvertisers);
    }

    if (!seekSponsorship) {
      await this.notifyInterestGroups(tournament._id, leagueId);
    }

    return tournament;
  }

  async seekSponsorship(tournamentId, advertiserIds) {
    const tournament = await TournamentModel.findById(tournamentId);
    if (!tournament) throw new Error("Tournament not found");

    advertiserIds.forEach(advertiserId => {
      tournament.sponsorshipRequests.push({
        advertiser: advertiserId,
        status: "pending",
        requestedAt: new Date()
      });
    });

    await tournament.save();
    return tournament;
  }

  async selectExclusiveSponsor(tournamentId, advertiserId) {
    const tournament = await TournamentModel.findById(tournamentId);
    if (!tournament) throw new Error("Tournament not found");

    tournament.exclusiveSponsor = advertiserId;
    tournament.status = "open_for_applications";

    const request = tournament.sponsorshipRequests.find(
      r => r.advertiser.toString() === advertiserId.toString()
    );
    if (request) {
      request.status = "selected";
      request.respondedAt = new Date();
    }

    await tournament.save();
    await this.notifyInterestGroups(tournamentId, tournament.league);

    return tournament;
  }

  async notifyInterestGroups(tournamentId, leagueId) {
    const tournament = await TournamentModel.findById(tournamentId).populate("league");
    const league = await LeagueModel.findById(leagueId).populate("game");
    
    await notificationService.notifyTournamentAnnouncement(
      tournament,
      leagueId,
      league.game._id
    );

    return tournament;
  }

  async createTournament(data, userId) {
    const {
      name,
      league,
      style,
      maxPlayers,
      applicationStartDate,
      applicationEndDate,
      playStartDate,
      playEndDate
    } = data;

    if (new Date(applicationStartDate) >= new Date(applicationEndDate)) {
      throw new Error("Application end date must be after start date");
    }
    if (new Date(applicationEndDate) >= new Date(playStartDate)) {
      throw new Error("Play start date must be after application end date");
    }
    if (new Date(playStartDate) >= new Date(playEndDate)) {
      throw new Error("Play end date must be after play start date");
    }

    const leagueDoc = await LeagueModel.findById(league);
    if (!leagueDoc) {
      throw new Error("League not found");
    }

    if (leagueDoc.owner.toString() !== userId.toString()) {
      throw new Error("You do not own this league");
    }

    const tournament = new TournamentModel({
      name,
      league,
      style,
      maxPlayers,
      applicationStartDate,
      applicationEndDate,
      playStartDate,
      playEndDate,
      status: 'planning'
    });

    await tournament.save();

    leagueDoc.tournaments.push(tournament._id);
    await leagueDoc.save();

    return tournament;
  }

  async getById(id) {
    return await Tournament.getTournamentById(id);
  }

  async getAll() {
    return TournamentModel.find()
      .populate("players", "name email")
      .populate("league", "name")
      .sort({ createdAt: -1 });
  }

  async update(id, data) {
    return await Tournament.updateTournament(id, data);
  }

  async delete(id) {
    const tournament = await TournamentModel.findByIdAndDelete(id);
    if (!tournament) throw new Error("Tournament not found");
    await MatchModel.deleteMany({tournament:id});
    await LeagueModel.findByIdAndUpdate(
      tournament.league,
      {$pull:{tournaments:id}}
    );
    return tournament;
  }

  /* ================================
     PLAYER METHODS
  ================================= */
  async applyToTournament(playerId, tournamentId) {
    return await Tournament.apply(playerId, tournamentId);
  }

  async cancelTournamentApplication(playerId, tournamentId, applicationId) {
    return await Tournament.cancelApplication(playerId, tournamentId, applicationId);
  }

  async leaveTournament(playerId, tournamentId) {
    return await Tournament.leaveTournament(playerId, tournamentId);
  }

  async getPlayerApplications(playerId) {
    return await Tournament.getPlayerApplications(playerId);
  }

  async getAvailableTournaments(playerId) {
    return await Tournament.getAvailableTournaments(playerId);
  }

  async getPlayerTournaments(playerId) {
    return await Tournament.getPlayerTournaments(playerId);
  }

  /* ================================
     OWNER/OPERATOR METHODS
  ================================= */
  async updateApplicationStatus(tournamentId, applicationId, status) {
    return await Tournament.updateApplicationStatus(tournamentId, applicationId, status);
  }

  async recordMatchResult(tournamentId, matchId, winnerId, isDraw) {
    // Delegate to match service to ensure stats are updated correctly
    const match = await matchGameService.resolveMatch(matchId, winnerId, isDraw);

    // Check if tournament is ready to complete
    const tournament = await TournamentModel.findById(tournamentId).populate('matches');
    if (tournament && tournament.status !== 'finished') {
      const allFinished = tournament.matches.every(m => m.status === 'finished');
      
      if (allFinished) {
        console.log(`🏆 Auto-completing tournament ${tournamentId} as all matches are finished.`);
        // Run asynchronously to not block response
        this.completeTournament(tournamentId).catch(err => 
          console.error("Failed to auto-complete tournament:", err)
        );
      }
    }

    return match;
  }

  async startTournament(tournamentId) {
  const tournament = await TournamentModel.findById(tournamentId)
    .populate({
      path: "league",
      populate: { path: "game" }
    })
    .populate("players");

  if (!tournament) throw new Error("Tournament not found");

  if (tournament.players.length < 2) {
    throw new Error("Need at least 2 players to start tournament");
  }

  // Set tournament status to ongoing
  tournament.status = "ongoing";

  // Check if matches already exist (generated during kickoff)
  let createdMatches = [];
  if (tournament.matches && tournament.matches.length > 0) {
    // Fetch existing matches
    createdMatches = await MatchModel.find({ _id: { $in: tournament.matches } });
  } else {
    // Generate matches if they don't exist
    const matches = await tournamentStyleService.generateMatches(
      tournament.style,
      tournament.players.map(p => p._id)
    );

    if (!tournament.league?.game) {
      console.error('❌ Cannot start tournament: League is missing game reference', { 
        tournamentId, 
        leagueId: tournament.league?._id 
      });
      throw new Error('Tournament league is missing game configuration');
    }

    createdMatches = await Promise.all(
      matches.map(matchData => {
        const match = new MatchModel({
          tournament: tournamentId,
          league: tournament.league._id,
          game: tournament.league.game._id,
          players: matchData.players,
          round: matchData.round,
          matchNumber: matchData.matchNumber,
          status: matchData.players.length === 2 ? "ready" : "pending"
        });
        return match.save();
      })
    );

    tournament.matches = createdMatches.map(m => m._id);
  }
  
  // Save tournament after status change (regardless of whether matches existed)
  await tournament.save();

  // Phase 2: Set Round 1 matches to live
  const round1Matches = createdMatches.filter(m => m.round === 1 && m.players.length === 2);
  
  for (const match of round1Matches) {
     try {
       await matchGameService.startMatch(match._id);
     } catch (err) {
       console.error(`Error starting match ${match._id}:`, err);
     }
  }

  return { tournament, matches: createdMatches };
}

  async completeTournament(tournamentId) {
    const tournament = await TournamentModel.findById(tournamentId)
      .populate("matches")
      .populate("players")
      .populate({
        path: "league",
        populate: { path: "game ratingFormula" }  // ✅ Populate both game and formula
      });

    if (!tournament) throw new Error("Tournament not found");

    const incompleteMatches = tournament.matches.filter(m => m.status !== "finished");
    if (incompleteMatches.length > 0) {
      throw new Error(`${incompleteMatches.length} matches still incomplete`);
    }

    const playerStats = {};
    tournament.players.forEach(player => {
      playerStats[player._id] = { wins: 0, points: 0 };
    });

    tournament.matches.forEach(match => {
      if (match.winner) {
        playerStats[match.winner].wins++;
      }
    });

    let winnerId = null;
    let maxWins = -1;
    Object.keys(playerStats).forEach(playerId => {
      if (playerStats[playerId].wins > maxWins) {
        maxWins = playerStats[playerId].wins;
        winnerId = playerId;
      }
    });

    // Stats are already updated per-match in matchService.
    // We only need to set the winner and status.

    tournament.status = "finished";
    tournament.winners = [winnerId];
    await tournament.save();

    // NOTIFY ALL PLAYERS
    const winnerName = tournament.players.find(p => p._id.toString() === winnerId)?.name || 'Unknown';
    
    // Create notifications for all participants
    const notifications = tournament.players.map(player => ({
      user: player._id,
      type: 'tournament_results',
      title: 'Tournament Ended',
      message: `The tournament ${tournament.name} has ended! The winner is ${winnerName}!`,
      relatedTournament: tournament._id,
      relatedLeague: tournament.league._id
    }));

    await notificationService.createMany(notifications);

    return tournament;
  }

  async kickoffTournamentAutomatically(tournamentId) {
    const tournament = await TournamentModel.findById(tournamentId)
      .populate({
  path: "league",
  populate: { path: "game" }  // ✅ Now league.game is populated!
})
    
    if (!tournament) {
      throw new Error('Tournament not found');
    }
    
    if (tournament.status !== 'open_for_applications') {
      throw new Error('Tournament not ready to kickoff');
    }
    
    // Approve pending applications (up to max players)
    const pendingApps = tournament.applications
      .filter(app => app.status === 'pending')
      .slice(0, tournament.maxPlayers - tournament.players.length);
    
    pendingApps.forEach(app => {
      app.status = 'approved';
      app.reviewedAt = new Date();
      if (!tournament.players.includes(app.player)) {
        tournament.players.push(app.player);
      }
    });
    
    // Reject remaining pending applications
    tournament.applications
      .filter(app => app.status === 'pending')
      .forEach(app => {
        app.status = 'rejected';
        app.reviewedAt = new Date();
      });
    
    // Check minimum player requirement
    if (tournament.players.length < 2) {
      tournament.status = 'finished';
      await tournament.save();
      return { 
        tournament, 
        cancelled: true, 
        reason: 'Not enough players (minimum 2 required)' 
      };
    }
    
    // Generate matches
    let createdMatches = [];
    
    if (tournament.style === 'SingleElimination') {
      // Use bracket service for SE (handles byes, seeding, nextMatch links)
      createdMatches = await tournamentBracketService.generateSingleEliminationBracket(tournamentId);
      
      // Bracket service sets status to 'ongoing', but for kickoff we might want 'upcoming'
      // if playStartDate hasn't arrived. But usually kickoff happens close to play start.
      // Let's respect the 'upcoming' logic for consistency with scheduling.
      tournament.status = 'upcoming';
      tournament.matches = createdMatches.map(m => m._id);
      await tournament.save();
      
    } else {
      // Use style service for other types (RoundRobin etc) - fallback
      const matches = await tournamentStyleService.generateMatches(
        tournament.style,
        tournament.players
      );
      
      if (!tournament.league?.game) {
        console.error('❌ Cannot kickoff tournament: League is missing game reference', { 
          tournamentId, 
          leagueId: tournament.league?._id 
        });
        throw new Error('Tournament league is missing game configuration');
      }
  
      console.log(`Creating ${matches.length} matches for game: ${tournament.league.game}`);
  
      // Create match documents in database
      createdMatches = await Promise.all(
        matches.map(matchData => {
          const match = new MatchModel({
            tournament: tournamentId,
            league: tournament.league._id,
            game: tournament.league.game._id,
            players: matchData.players,
            round: matchData.round,
            matchNumber: matchData.matchNumber,
            status: matchData.players.length === 2 ? "ready" : "pending"
          });
          return match.save();
        })
      );
      
      // Phase 1: Set status to upcoming
      tournament.matches = createdMatches.map(m => m._id);
      tournament.status = 'upcoming';
      await tournament.save();
    }
    
    return { tournament, matches: createdMatches };
  }

  async checkAndKickoffTournaments() {
    const now = new Date();
    
    const tournamentsToKickoff = await TournamentModel.find({
      status: 'open_for_applications',
      applicationEndDate: { $lte: now }
    }).populate('players');
    
    const results = [];
    for (const tournament of tournamentsToKickoff) {
      try {
        const result = await this.kickoffTournamentAutomatically(tournament._id);
        
        if (result.cancelled) {
          results.push({ 
            id: result.tournament._id, 
            status: 'finished', 
            reason: result.reason 
          });
        } else {
          results.push({ 
            id: result.tournament._id, 
            status: 'started', 
            matchesGenerated: result.matches.length 
          });
        }
      } catch (err) {
        results.push({ id: tournament._id, status: 'error', error: err.message });
      }
    }
    
    return results;
  }

  async archiveTournament(tournamentId) {
    const tournament = await TournamentModel.findById(tournamentId)
      .populate('players winners matches league');
    
    if (!tournament) throw new Error('Tournament not found');
    
    if (tournament.status !== 'finished') {
      throw new Error('Only finished tournaments can be archived');
    }
    
    const archiveData = {
      tournamentId: tournament._id,
      name: tournament.name,
      completedAt: new Date(),
      totalMatches: tournament.matches.length,
      winner: tournament.winners[0],
      participants: tournament.players.length,
      league: tournament.league._id,
      statistics: {
        totalGames: tournament.matches.length,
        averageMatchDuration: 'N/A',
      }
    };
    
    tournament.status = 'archived';
    tournament.archivedAt = new Date();
    tournament.archiveData = archiveData;
    
    await tournament.save();
    
    return tournament;
  }

  async getOwnerTournaments(userId){
    try{
      const tournaments = await Tournament.getOwnerTournaments(userId);
      return tournaments;
    }catch(err){
      console.error("Error in get owner tournaments service: ",err);
      throw new Error("Failed to fetch owners tournaments")
    }
  }

  /* ================================
     NEW: SHARED/PUBLIC METHODS
  ================================= */
  async getTournamentWinners(tournamentId) {
    return await Tournament.getWinners(tournamentId);
  }

  async getTournamentPlayers(tournamentId) {
    return await Tournament.getPlayers(tournamentId);
  }

  async getTournamentBrackets(tournamentId) {
    return await Tournament.getTournamentBrackets(tournamentId);
  }

  async getTournamentLeaderboard(tournamentId) {
    return await Tournament.getTournamentLeaderboard(tournamentId);
  }
  async getSponsorableTournaments() {
    return await TournamentModel.find({
      status: 'seeking_sponsors',
      exclusiveSponsor: { $exists: false }
    })
      .populate('league', 'name game')
      .populate({ path: 'league', populate: { path: 'game', select: 'name type' } })
      .sort({ playStartDate: 1 });
  }

  async updateTournamentStatus(tournamentId, status) {
    const tournament = await TournamentModel.findById(tournamentId);
    if (!tournament) throw new Error("Tournament not found");

    const validStatuses = [
      "planning", 
      "seeking_sponsors", 
      "open_for_applications", 
      "upcoming", 
      "ongoing", 
      "finished"
    ];

    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status: ${status}`);
    }

    tournament.status = status;
    await tournament.save();
    return tournament;
  }

  async manageSponsorshipRequest(tournamentId, requestId, status) {
    const tournament = await TournamentModel.findById(tournamentId);
    if (!tournament) throw new Error("Tournament not found");

    const request = tournament.sponsorshipRequests.id(requestId);
    if (!request) throw new Error("Sponsorship request not found");

    request.status = status;
    request.respondedAt = new Date();

    if (status === 'accepted' || status === 'selected') {
      // Delegate to AdvertiserService to handle funds and status sync
      // This ensures business logic (deductions, adding to sponsored list) is executed
      const advertiserService = (await import("./advertiserService.js")).default;
      await advertiserService.updateSponsorshipRequestByTournament(request.advertiser, tournamentId, status);
      
      // Reload tournament to return fresh state (AdvertiserService updates it internally)
      const freshTournament = await TournamentModel.findById(tournamentId);
      return freshTournament;
    } else {
        // For rejections, we can just update status locally or still delegate
        // Delegating is safer for consistency
        const advertiserService = (await import("./advertiserService.js")).default;
        await advertiserService.updateSponsorshipRequestByTournament(request.advertiser, tournamentId, status);
        
        return await TournamentModel.findById(tournamentId);
    }

    await tournament.save();
    return tournament;
  }
}

export default new TournamentService();
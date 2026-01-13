// backend/services/tournamentService.js
import TournamentModel from "../schemas/TournamentSchema.js";
import MatchModel from "../schemas/MatchSchema.js";
import LeagueModel from "../schemas/LeagueSchema.js";
import RatingFormula from "../schemas/RatingFormulaSchema.js";
import User from "../schemas/UserSchema.js";
import tournamentStyleService from "./tournamentStyleService.js";
import notificationService from "./notificationService.js";

class TournamentService {
  /**
   * Step 2.3: ANNOUNCE TOURNAMENT - Complete Workflow
   * Creates tournament with sponsorship and notification support
   */
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

    // Validate dates
    if (new Date(applicationStartDate) >= new Date(applicationEndDate)) {
      throw new Error("Application end date must be after start date");
    }
    if (new Date(applicationEndDate) >= new Date(playStartDate)) {
      throw new Error("Play dates must be after application dates");
    }

    // Verify league ownership
    const league = await LeagueModel.findById(leagueId);
    if (!league) throw new Error("League not found");
    if (league.owner.toString() !== leagueOwnerId.toString()) {
      throw new Error("You don't own this league");
    }

    // Create tournament
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

    // Add to league's tournaments
    league.tournaments.push(tournament._id);
    await league.save();

    // Handle sponsorship if requested
    if (seekSponsorship && selectedAdvertisers?.length > 0) {
      await this.seekSponsorship(tournament._id, selectedAdvertisers);
    }

    // Notify interest groups (if not seeking sponsorship)
    if (!seekSponsorship) {
      await this.notifyInterestGroups(tournament._id, leagueId);
    }

    return tournament;
  }

  /**
   * Seek sponsorship from selected advertisers
   */
  async seekSponsorship(tournamentId, advertiserIds) {
    const tournament = await TournamentModel.findById(tournamentId);
    if (!tournament) throw new Error("Tournament not found");

    // Create sponsorship requests
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

  /**
   * Select exclusive sponsor
   */
  async selectExclusiveSponsor(tournamentId, advertiserId) {
    const tournament = await TournamentModel.findById(tournamentId);
    if (!tournament) throw new Error("Tournament not found");

    tournament.exclusiveSponsor = advertiserId;
    tournament.status = "open_for_applications";

    // Update request status
    const request = tournament.sponsorshipRequests.find(
      r => r.advertiser.toString() === advertiserId.toString()
    );
    if (request) {
      request.status = "selected";
      request.respondedAt = new Date();
    }

    await tournament.save();

    // Now notify interest groups
    await this.notifyInterestGroups(tournamentId, tournament.league);

    return tournament;
  }

  /**
   * Notify interest groups about tournament
   */
  async notifyInterestGroups(tournamentId, leagueId) {
    const tournament = await TournamentModel.findById(tournamentId).populate("league");
    const league = await LeagueModel.findById(leagueId).populate("game");
    
    // Use notification service to notify users
    await notificationService.notifyTournamentAnnouncement(
      tournament,
      leagueId,
      league.game._id
    );

    return tournament;
  }

  /**
   * COMPLETE: Create Tournament (Enhanced)
   */
  async createTournament(data) {
    const tournament = new TournamentModel(data);
    await tournament.save();
    return tournament;
  }

  /**
   * Get tournament by ID
   */
  async getById(id) {
    const tournament = await TournamentModel.findById(id)
      .populate("players", "name email stats")
      .populate("matches")
      .populate("league")
      .populate("applications.player", "name email");

    if (!tournament) throw new Error("Tournament not found");
    return tournament;
  }

  /**
   * Get all tournaments
   */
  async getAll() {
    return TournamentModel.find()
      .populate("players", "name email")
      .populate("league", "name")
      .sort({ createdAt: -1 });
  }

  /**
   * Update tournament
   */
  async update(id, data) {
    const tournament = await TournamentModel.findByIdAndUpdate(id, data, { 
      new: true,
      runValidators: true 
    });
    if (!tournament) throw new Error("Tournament not found");
    return tournament;
  }

  /**
   * Delete tournament
   */
  async delete(id) {
    const tournament = await TournamentModel.findByIdAndDelete(id);
    if (!tournament) throw new Error("Tournament not found");
    return tournament;
  }

  /**
   * Apply to tournament (Player)
   */
  async applyToTournament(playerId, tournamentId) {
    const tournament = await TournamentModel.findById(tournamentId).populate("league");
    if (!tournament) throw new Error("Tournament not found");
    if (tournament.status !== "open_for_applications") {
      throw new Error("Tournament not open for applications");
    }

    const league = await LeagueModel.findById(tournament.league._id);
    if (!league.players.includes(playerId)) {
      throw new Error("Must be a member of the league");
    }

    if (tournament.players.includes(playerId)) {
      throw new Error("Already joined");
    }

    if (tournament.players.length >= tournament.maxPlayers) {
      throw new Error("Tournament full");
    }

    tournament.applications.push({ player: playerId });
    await tournament.save();
    return tournament;
  }

  /**
   * Process applications (League Owner approves/rejects)
   */
  async updateApplicationStatus(tournamentId, applicationId, status) {
    const tournament = await TournamentModel.findById(tournamentId);
    if (!tournament) throw new Error("Tournament not found");

    const app = tournament.applications.id(applicationId);
    if (!app) throw new Error("Application not found");

    app.status = status;
    app.reviewedAt = new Date();

    if (status === "approved") {
      tournament.players.push(app.player);
    }

    await tournament.save();
    return tournament;
  }

  /**
   * Step 2.3: START TOURNAMENT - Generate Matches
   */
  async startTournament(tournamentId) {
    const tournament = await TournamentModel.findById(tournamentId)
      .populate("league")
      .populate("players");

    if (!tournament) throw new Error("Tournament not found");

    if (tournament.players.length < 2) {
      throw new Error("Need at least 2 players to start tournament");
    }

    // Update status
    tournament.status = "ongoing";
    await tournament.save();

    // Generate matches based on style
    const matches = await tournamentStyleService.generateMatches(
      tournament.style,
      tournament.players.map(p => p._id)
    );

    // Create match documents
    const createdMatches = await Promise.all(
      matches.map(matchData => {
        const match = new MatchModel({
          tournament: tournamentId,
          league: tournament.league._id,
          game: tournament.league.game,
          players: matchData.players,
          status: "upcoming"
        });
        return match.save();
      })
    );

    // Add matches to tournament
    tournament.matches = createdMatches.map(m => m._id);
    await tournament.save();

    return { tournament, matches: createdMatches };
  }

  /**
   * Step 2.5: DECLARE WINNER - Complete Tournament
   */
  async completeTournament(tournamentId) {
    const tournament = await TournamentModel.findById(tournamentId)
      .populate("matches")
      .populate("players")
      .populate("league");

    if (!tournament) throw new Error("Tournament not found");

    // Verify all matches completed
    const incompleteMatches = tournament.matches.filter(m => m.status !== "finished");
    if (incompleteMatches.length > 0) {
      throw new Error(`${incompleteMatches.length} matches still incomplete`);
    }

    // Calculate winner based on points/wins
    const playerStats = {};
    tournament.players.forEach(player => {
      playerStats[player._id] = { wins: 0, points: 0 };
    });

    // Count wins for each player
    tournament.matches.forEach(match => {
      if (match.winner) {
        playerStats[match.winner].wins++;
      }
    });

    // Find winner (player with most wins)
    let winnerId = null;
    let maxWins = -1;
    Object.keys(playerStats).forEach(playerId => {
      if (playerStats[playerId].wins > maxWins) {
        maxWins = playerStats[playerId].wins;
        winnerId = playerId;
      }
    });

    // Apply rating formula to all players
    const league = await LeagueModel.findById(tournament.league._id).populate("ratingFormula");
    const formula = league.ratingFormula;

    for (const match of tournament.matches) {
      const matchDoc = await MatchModel.findById(match._id);
      
      if (matchDoc.winner) {
        // Update winner
        await User.findByIdAndUpdate(matchDoc.winner, {
          $inc: {
            "stats.wins": 1,
            "stats.points": formula.winnerScore
          }
        });

        // Update loser
        const loser = matchDoc.players.find(p => p.toString() !== matchDoc.winner.toString());
        await User.findByIdAndUpdate(loser, {
          $inc: {
            "stats.losses": 1,
            "stats.points": formula.loserScore
          }
        });
      } else if (matchDoc.status === "finished") {
        // Draw
        matchDoc.players.forEach(async playerId => {
          await User.findByIdAndUpdate(playerId, {
            $inc: {
              "stats.draws": 1,
              "stats.points": formula.drawScore
            }
          });
        });
      }
    }

    // Set tournament as finished
    tournament.status = "finished";
    tournament.winners = [winnerId];
    await tournament.save();

    return tournament;
  }

  /**
   * Get available tournaments for player
   */
  async getAvailableTournaments(playerId) {
    const leagues = await LeagueModel.find({ 
      players: playerId, 
      status: "active" 
    }).select("_id");

    const leagueIds = leagues.map(l => l._id);

    return TournamentModel.find({
      league: { $in: leagueIds },
      status: "open_for_applications",
      players: { $ne: playerId }
    })
      .populate("league", "name game")
      .populate("players", "name")
      .sort({ startDate: 1 });
  }

  /**
   * Get player's tournaments
   */
  async getPlayerTournaments(playerId) {
    return TournamentModel.find({ players: playerId })
      .populate("league", "name")
      .populate("matches")
      .sort({ createdAt: -1 });
  }
}

export default new TournamentService();
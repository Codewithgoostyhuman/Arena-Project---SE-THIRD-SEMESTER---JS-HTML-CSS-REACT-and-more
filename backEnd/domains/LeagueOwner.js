// backend/domains/LeagueOwner.js
import User from "../schemas/UserSchema.js";
import League from "../schemas/LeagueSchema.js";
import Tournament from "../schemas/TournamentSchema.js";
import Application from "../schemas/ApplicationSchema.js";

export default class LeagueOwnerDomain {

  /* ===============================
     LEAGUE OWNER MANAGEMENT
  =============================== */
  static async createLeagueOwner(userId) {
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");
    
    // Update user role to league_owner
    user.role = 'league_owner';
    user.status = user.status || 'active';
    await user.save();
    
    return user;
  }

  static async getAllLeagueOwners() {
    return User.find({ role: 'league_owner' })
      .populate('leagues tournaments')
      .select('-password');
  }

  static async getLeagueOwnerById(id) {
    const owner = await User.findOne({ _id: id, role: 'league_owner' })
      .populate('leagues tournaments')
      .select('-password');
    
    if (!owner) throw new Error("League owner not found");
    return owner;
  }

  static async updateLeagueOwner(id, data) {
    const owner = await User.findOne({ _id: id, role: 'league_owner' });
    if (!owner) throw new Error("League owner not found");
    
    // Prevent role change through this method
    delete data.role;
    
    Object.assign(owner, data);
    await owner.save();
    return owner;
  }

  static async deleteLeagueOwner(id) {
    const owner = await User.findOne({ _id: id, role: 'league_owner' });
    if (!owner) throw new Error("League owner not found");
    
    // Optionally handle cascading deletes for leagues/tournaments
    await User.findByIdAndDelete(id);
    return { message: "League owner deleted successfully" };
  }

  /* ===============================
     LEAGUE MANAGEMENT
  =============================== */
  static async createLeague(ownerId, { name, description, gameId }) {
    // Verify user is a league owner
    const owner = await User.findOne({ _id: ownerId, role: 'league_owner' });
    if (!owner) throw new Error("User is not a league owner");

    // Create league linked to owner and game
    const league = new League({ 
      name, 
      description, 
      owner: ownerId, 
      game: gameId, 
      status: "upcoming" 
    });
    await league.save();

    // Add league to owner's list
    owner.leagues.push(league._id);
    await owner.save();

    return league;
  }

  static async updateLeague(ownerId, leagueId, data) {
    // Verify ownership
    const owner = await User.findOne({ _id: ownerId, role: 'league_owner' });
    if (!owner) throw new Error("User is not a league owner");

    const league = await League.findById(leagueId);
    if (!league) throw new Error("League not found");
    
    if (league.owner.toString() !== ownerId.toString()) {
      throw new Error("You don't own this league");
    }

    Object.assign(league, data);
    await league.save();
    return league;
  }

  static async deleteLeague(ownerId, leagueId) {
    // Verify ownership
    const owner = await User.findOne({ _id: ownerId, role: 'league_owner' });
    if (!owner) throw new Error("User is not a league owner");

    const league = await League.findById(leagueId);
    if (!league) throw new Error("League not found");
    
    if (league.owner.toString() !== ownerId.toString()) {
      throw new Error("You don't own this league");
    }

    await League.findByIdAndDelete(leagueId);
    
    // Remove from owner's leagues array
    owner.leagues = owner.leagues.filter(l => l.toString() !== leagueId.toString());
    await owner.save();

    return { message: "League deleted", league };
  }

  static async startLeague(ownerId, leagueId) {
    // Verify ownership
    const owner = await User.findOne({ _id: ownerId, role: 'league_owner' });
    if (!owner) throw new Error("User is not a league owner");

    const league = await League.findById(leagueId);
    if (!league) throw new Error("League not found");
    
    if (league.owner.toString() !== ownerId.toString()) {
      throw new Error("You don't own this league");
    }

    league.status = "ongoing";
    await league.save();
    return league;
  }

  /* ===============================
     TOURNAMENT MANAGEMENT
  =============================== */
  static async createTournament(ownerId, leagueId, { name, startDate, endDate, style }) {
    // Verify ownership
    const owner = await User.findOne({ _id: ownerId, role: 'league_owner' });
    if (!owner) throw new Error("User is not a league owner");

    const league = await League.findById(leagueId);
    if (!league) throw new Error("League not found");
    
    if (league.owner.toString() !== ownerId.toString()) {
      throw new Error("You don't own this league");
    }

    // Tournament must inherit the same game as league
    const tournament = new Tournament({
      name,
      league: leagueId,
      game: league.game,
      startDate,
      endDate,
      style,
      status: "upcoming"
    });

    await tournament.save();

    // Add tournament to league
    league.tournaments.push(tournament._id);
    await league.save();

    // Add tournament to owner's tournaments
    owner.tournaments.push(tournament._id);
    await owner.save();

    return tournament;
  }

  static async updateTournament(ownerId, tournamentId, data) {
    // Verify ownership through league
    const owner = await User.findOne({ _id: ownerId, role: 'league_owner' });
    if (!owner) throw new Error("User is not a league owner");

    const tournament = await Tournament.findById(tournamentId).populate('league');
    if (!tournament) throw new Error("Tournament not found");
    
    if (tournament.league.owner.toString() !== ownerId.toString()) {
      throw new Error("You don't own this tournament's league");
    }

    Object.assign(tournament, data);
    await tournament.save();
    return tournament;
  }

  static async startTournament(ownerId, tournamentId) {
    // Verify ownership through league
    const owner = await User.findOne({ _id: ownerId, role: 'league_owner' });
    if (!owner) throw new Error("User is not a league owner");

    const tournament = await Tournament.findById(tournamentId).populate('league');
    if (!tournament) throw new Error("Tournament not found");
    
    if (tournament.league.owner.toString() !== ownerId.toString()) {
      throw new Error("You don't own this tournament's league");
    }

    tournament.status = "ongoing";
    await tournament.save();
    return tournament;
  }

  static async deleteTournament(ownerId, tournamentId) {
    // Verify ownership through league
    const owner = await User.findOne({ _id: ownerId, role: 'league_owner' });
    if (!owner) throw new Error("User is not a league owner");

    const tournament = await Tournament.findById(tournamentId).populate('league');
    if (!tournament) throw new Error("Tournament not found");
    
    if (tournament.league.owner.toString() !== ownerId.toString()) {
      throw new Error("You don't own this tournament's league");
    }

    await Tournament.findByIdAndDelete(tournamentId);

    // Remove from league's tournaments array
    const league = await League.findById(tournament.league._id);
    if (league) {
      league.tournaments = league.tournaments.filter(
        t => t.toString() !== tournamentId.toString()
      );
      await league.save();
    }

    // Remove from owner's tournaments array
    owner.tournaments = owner.tournaments.filter(
      t => t.toString() !== tournamentId.toString()
    );
    await owner.save();

    return { message: "Tournament deleted", tournament };
  }

  /* ===============================
     APPLICATION MANAGEMENT
  =============================== */
  static async handleApplication(ownerId, applicationId, action) {
    // Verify ownership
    const owner = await User.findOne({ _id: ownerId, role: 'league_owner' });
    if (!owner) throw new Error("User is not a league owner");

    const app = await Application.findById(applicationId);
    if (!app) throw new Error("Application not found");

    // Verify the league belongs to this owner
    const league = await League.findById(app.target);
    if (!league || league.owner.toString() !== ownerId.toString()) {
      throw new Error("You don't own this league");
    }

    app.status = action === "approve" ? "approved" : "rejected";
    await app.save();
    return app;
  }
}
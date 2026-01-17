import LeagueOwnerDomain from "../domains/LeagueOwner.js";

export default class LeagueOwnerService {

  /* ====================
     LEAGUE OWNER
  ==================== */
  static createLeagueOwner(userId) {
    return LeagueOwnerDomain.createLeagueOwner(userId);
  }

  static getAllLeagueOwners() {
    return LeagueOwnerDomain.getAllLeagueOwners();
  }

  static getLeagueOwnerById(id) {
    return LeagueOwnerDomain.getLeagueOwnerById(id);
  }

  static updateLeagueOwner(id, data) {
    return LeagueOwnerDomain.updateLeagueOwner(id, data);
  }

  static deleteLeagueOwner(id) {
    return LeagueOwnerDomain.deleteLeagueOwner(id);
  }

  /* ====================
     LEAGUE
  ==================== */
  static createLeague(ownerId, data) {
    return LeagueOwnerDomain.createLeague(ownerId, data);
  }

  static updateLeague(leagueId, data) {
    return LeagueOwnerDomain.updateLeague(leagueId, data);
  }

  static deleteLeague(leagueId) {
    return LeagueOwnerDomain.deleteLeague(leagueId);
  }

  static startLeague(leagueId) {
    return LeagueOwnerDomain.startLeague(leagueId);
  }

  /* ====================
     TOURNAMENT
  ==================== */
  static createTournament(leagueId, data) {
    return LeagueOwnerDomain.createTournament(leagueId, data);
  }

  static updateTournament(tournamentId, data) {
    return LeagueOwnerDomain.updateTournament(tournamentId, data);
  }

  static startTournament(tournamentId) {
    return LeagueOwnerDomain.startTournament(tournamentId);
  }
  static deleteTournament(tournamentId) {
  return LeagueOwnerDomain.deleteTournament(tournamentId);
}

  /* ====================
     APPLICATION
  ==================== */
  static handleApplication(applicationId, action) {
    return LeagueOwnerDomain.handleApplication(applicationId, action);
  }
  /* ====================
   LEAGUE APPLICATIONS
==================== */
static async getLeagueApplications(ownerId, leagueId = null, status = null) {
    try {
      return await LeagueOwnerDomain.getLeagueApplications(ownerId, leagueId, status);
    } catch (err) {
      console.error('Error in getLeagueApplications service:', err);
      throw err;
    }
  }

  static async approveLeagueApplication(ownerId, applicationId) {
    try {
      return await LeagueOwnerDomain.approveLeagueApplication(ownerId, applicationId);
    } catch (err) {
      console.error('Error in approveLeagueApplication service:', err);
      throw err;
    }
  }

  static async rejectLeagueApplication(ownerId, applicationId) {
    try {
      return await LeagueOwnerDomain.rejectLeagueApplication(ownerId, applicationId);
    } catch (err) {
      console.error('Error in rejectLeagueApplication service:', err);
      throw err;
    }
  }

/* ====================
   TOURNAMENT APPLICATIONS
==================== */
static async getTournamentApplications(ownerId, tournamentId = null, status = null) {
    try {
      return await LeagueOwnerDomain.getTournamentApplications(ownerId, tournamentId, status);
    } catch (err) {
      console.error('Error in getTournamentApplications service:', err);
      throw err;
    }
  }

  static async approveTournamentApplication(ownerId, applicationId) {
    try {
      return await LeagueOwnerDomain.approveTournamentApplication(ownerId, applicationId);
    } catch (err) {
      console.error('Error in approveTournamentApplication service:', err);
      throw err;
    }
  }

  static async rejectTournamentApplication(ownerId, applicationId) {
    try {
      return await LeagueOwnerDomain.rejectTournamentApplication(ownerId, applicationId);
    } catch (err) {
      console.error('Error in rejectTournamentApplication service:', err);
      throw err;
    }
  }
}

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
}

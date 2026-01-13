import LeagueDomain from "../domains/LeagueDomain.js";

class LeagueService {
  async createLeague(ownerId, data) {
    return LeagueDomain.createLeague(ownerId, data);
  }

  async updateLeague(leagueId, data) {
    return LeagueDomain.updateLeague(leagueId, data);
  }

  async deleteLeague(leagueId) {
    return LeagueDomain.deleteLeague(leagueId);
  }

  async getLeague(leagueId) {
    return LeagueDomain.getLeague(leagueId);
  }

  async getActiveLeagues() {
    return LeagueDomain.getActiveLeagues();
  }

  async addPlayer(leagueId, playerId) {
    return LeagueDomain.addPlayer(leagueId, playerId);
  }

  async removePlayer(leagueId, playerId) {
    return LeagueDomain.removePlayer(leagueId, playerId);
  }

  async getPlayers(leagueId) {
    return LeagueDomain.getPlayers(leagueId);
  }

  async getTournaments(leagueId) {
    return LeagueDomain.getTournaments(leagueId);
  }

  async getApplications(leagueId) {
    return LeagueDomain.getApplications(leagueId);
  }

  async approveApplication(leagueId, applicationId) {
    return LeagueDomain.approveApplication(leagueId, applicationId);
  }

  async rejectApplication(leagueId, applicationId) {
    return LeagueDomain.rejectApplication(leagueId, applicationId);
  }

  async applyToLeague(playerId, leagueId) {
    return LeagueDomain.applyToLeague(playerId, leagueId);
  }
}

export default new LeagueService();

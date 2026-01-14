import LeagueDomain from "../domains/League.js";

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
/**
 * Get leagues owned by a specific user
 */
async getLeaguesByOwner(ownerId) {
  const leagues = await LeagueModel.find({ owner: ownerId })
    .populate('game', 'name')
    .populate('ratingFormula', 'name')
    .populate('players', 'username avatar')
    .populate('tournaments', 'name status maxPlayers')
    .sort({ createdAt: -1 });

  return leagues;
}

/**
 * Get active leagues (for general listing)
 */
async getActiveLeagues(userId) {
  // If you want to show only user's leagues
  //return this.getLeaguesByOwner(userId);
  
  // OR if you want to show all active leagues:
  return LeagueModel.find({ status: 'active' })
  .populate('game', 'name')
  .populate('owner', 'username')
  .sort({ createdAt: -1 });
}
async getLeaguesByOwner(userId){
  return LeagueDomain.getLeaguesByOwner(userId);
}
async deleteLeague(leagueId, userId) {
  const league = await LeagueModel.findById(leagueId);
  
  if (!league) {
    throw new Error('League not found');
  }

  if (league.owner.toString() !== userId.toString()) {
    throw new Error('You do not own this league');
  }

  // Delete associated tournaments
  await TournamentModel.deleteMany({ league: leagueId });
  await LeagueModel.findByIdAndDelete(leagueId);
  
  return { message: 'League deleted' };
}
}

export default new LeagueService();

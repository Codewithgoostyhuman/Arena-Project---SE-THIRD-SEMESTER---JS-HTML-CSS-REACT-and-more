import LeagueDomain from "../domains/League.js";
import LeagueModel from '../schemas/LeagueSchema.js'
class LeagueService {
  async createLeague(ownerId, data) {
    return LeagueDomain.createLeague(ownerId, data);
  }

  async updateLeague(leagueId, data) {
    return LeagueDomain.updateLeague(leagueId, data);
  }

  async getLeague(leagueId) {
    return LeagueDomain.getLeague(leagueId);
  }

  async getActiveLeagues() {
    return LeagueDomain.getActiveLeagues();
  }

  async addPlayer(leagueId, playerId,ownerId) {
    return LeagueDomain.addPlayer(leagueId, playerId,ownerId);
  }

  async removePlayer(leagueId, playerId,ownerId) {
    return LeagueDomain.removePlayer(leagueId,playerId ,ownerId);
  }

  async getPlayers(leagueId) {
    return LeagueDomain.getPlayers(leagueId);
  }

  async getTournaments(leagueId) {
    return LeagueDomain.getTournaments(leagueId);
  }

  async getApplications(leagueId,status) {
    return LeagueDomain.getApplications(leagueId,status);
  }

  async approveApplication(leagueId, applicationId,ownerId) {
    return LeagueDomain.approveApplication(leagueId, applicationId,ownerId);
  }

  async rejectApplication(leagueId, applicationId,ownerId) {
    return LeagueDomain.rejectApplication(leagueId, applicationId,ownerId);
  }
  async getPendingApplicationsCount(leagueId){
    return LeagueDomain.getPendingApplicationsCount(leagueId)
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
  try {
    const leagues = await LeagueModel.find({ status: 'active' })
      .populate('owner', 'name email')
      .populate('game', 'name type description')
      .populate('players', 'name email stats')
      .sort({ createdAt: -1 });
    
    console.log(`Found ${leagues.length} active leagues`);
    return leagues;
  } catch (error) {
    console.error('Error in getActiveLeagues service:', error);
    throw error;
  }
}
async getLeaguesByOwner(userId){
  return LeagueDomain.getLeaguesByOwner(userId);
}
async deleteLeague(leagueId, userId) {
  return LeagueDomain.deleteLeague(leagueId,userId);
};
}
export default new LeagueService();

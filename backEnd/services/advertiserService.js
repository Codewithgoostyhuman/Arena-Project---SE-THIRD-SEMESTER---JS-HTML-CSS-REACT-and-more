// services/advertiserService.js
import AdvertiserDomain from "../domains/Advertiser.js"

class AdvertiserService {
  // Create new advertiser
  async createAdvertiser(userId, companyName, accountId = null) {
    // Check if user already has an advertiser profile
    const existing = await AdvertiserDomain.getByUserId(userId).catch(() => null);
    if (existing) {
      throw new Error("User already has an advertiser profile");
    }

    // Create advertiser
    const advertiser = await AdvertiserDomain.create(userId, companyName, accountId);
    return advertiser;
  }

  // Get advertiser by ID
  async getAdvertiserById(id) {
    return await AdvertiserDomain.getById(id);
  }

  // Get advertiser by user ID
  async getAdvertiserByUserId(userId) {
    return await AdvertiserDomain.getByUserId(userId);
  }

  // Get all advertisers
  async getAllAdvertisers() {
    return await AdvertiserDomain.getAll();
  }

  // Get advertisers by status
  async getAdvertisersByStatus(status) {
    return await AdvertiserDomain.getAll(status);
  }

  // Update advertiser basic info
  async updateAdvertiser(id, updateData) {
    return await AdvertiserDomain.update(id, updateData);
  }

  // Delete advertiser
  async deleteAdvertiser(id) {
    return await AdvertiserDomain.delete(id);
  }

  // Add league of interest
  async addLeagueOfInterest(id, leagueId) {
    return await AdvertiserDomain.addLeague(id, leagueId);
  }

  // Remove league of interest
  async removeLeagueOfInterest(id, leagueId) {
    return await AdvertiserDomain.removeLeague(id, leagueId);
  }

  // Add sponsorship request
  async addSponsorshipRequest(id, tournamentId = null, leagueId = null, proposedAmount = null) {
    const advertiser = await AdvertiserDomain.getById(id);
    if (advertiser.status !== "active") {
      throw new Error("Only active advertisers can submit sponsorship requests");
    }

    return await AdvertiserDomain.addSponsorshipRequest(id, tournamentId, leagueId, proposedAmount);
  }

  // Update sponsorship request status
  async updateSponsorshipRequest(id, requestIndex, status) {
    return await AdvertiserDomain.updateSponsorshipRequest(id, requestIndex, status);
  }

  // Add sponsored tournament
  async addSponsoredTournament(id, tournamentId, sponsorshipAmount, sponsorshipType = "general") {
    const advertiser = await AdvertiserDomain.getById(id);
    if (advertiser.status !== "active") {
      throw new Error("Only active advertisers can sponsor tournaments");
    }

    return await AdvertiserDomain.addSponsoredTournament(id, tournamentId, sponsorshipAmount, sponsorshipType);
  }

  // Remove sponsored tournament
  async removeSponsoredTournament(id, tournamentId) {
    return await AdvertiserDomain.removeSponsoredTournament(id, tournamentId);
  }

  // Change advertiser status
  async changeStatus(id, status) {
    return await AdvertiserDomain.changeStatus(id, status);
  }

  // Get advertiser dashboard data
  async getAdvertiserDashboard(id) {
    return await AdvertiserDomain.getDashboard(id);
  }

  // Get all pending sponsorship requests (for operators)
  async getAllPendingRequests() {
    return await AdvertiserDomain.getAllPendingRequests();
  }

  // Get sponsorship statistics (for operators)
  async getSponsorshipStatistics() {
    return await AdvertiserDomain.getSponsorshipStatistics();
  }

  // Get advertiser balance
  async getBalance(id) {
    return await AdvertiserDomain.getBalance(id);
  }
}

export default new AdvertiserService();

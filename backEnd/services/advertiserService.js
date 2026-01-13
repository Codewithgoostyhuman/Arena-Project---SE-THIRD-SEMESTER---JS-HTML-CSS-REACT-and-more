// services/advertiserService.js
import Advertiser from "../domains/Advertiser.js";

class AdvertiserService {
  // Create new advertiser
  async createAdvertiser(userId, companyName, accountId = null) {
    // Check if user already has an advertiser profile
    const existing = await Advertiser.getByUserId(userId).catch(() => null);
    if (existing) {
      throw new Error("User already has an advertiser profile");
    }

    // Create advertiser
    const advertiser = await Advertiser.create(userId, companyName, accountId);
    return advertiser;
  }

  // Get advertiser by ID
  async getAdvertiserById(id) {
    return await Advertiser.getById(id);
  }

  // Get advertiser by user ID
  async getAdvertiserByUserId(userId) {
    return await Advertiser.getByUserId(userId);
  }

  // Get all advertisers
  async getAllAdvertisers() {
    return await Advertiser.getAll();
  }

  // Get advertisers by status
  async getAdvertisersByStatus(status) {
    return await Advertiser.getAll(status);
  }

  // Update advertiser basic info
  async updateAdvertiser(id, updateData) {
    return await Advertiser.update(id, updateData);
  }

  // Delete advertiser
  async deleteAdvertiser(id) {
    return await Advertiser.delete(id);
  }

  // Add league of interest
  async addLeagueOfInterest(id, leagueId) {
    return await Advertiser.addLeague(id, leagueId);
  }

  // Remove league of interest
  async removeLeagueOfInterest(id, leagueId) {
    return await Advertiser.removeLeague(id, leagueId);
  }

  // Add sponsorship request
  async addSponsorshipRequest(id, tournamentId = null, leagueId = null, proposedAmount = null) {
    const advertiser = await Advertiser.getById(id);
    if (advertiser.status !== "active") {
      throw new Error("Only active advertisers can submit sponsorship requests");
    }

    return await Advertiser.addSponsorshipRequest(id, tournamentId, leagueId, proposedAmount);
  }

  // Update sponsorship request status
  async updateSponsorshipRequest(id, requestIndex, status) {
    return await Advertiser.updateSponsorshipRequest(id, requestIndex, status);
  }

  // Add sponsored tournament
  async addSponsoredTournament(id, tournamentId, sponsorshipAmount, sponsorshipType = "general") {
    const advertiser = await Advertiser.getById(id);
    if (advertiser.status !== "active") {
      throw new Error("Only active advertisers can sponsor tournaments");
    }

    return await Advertiser.addSponsoredTournament(id, tournamentId, sponsorshipAmount, sponsorshipType);
  }

  // Remove sponsored tournament
  async removeSponsoredTournament(id, tournamentId) {
    return await Advertiser.removeSponsoredTournament(id, tournamentId);
  }

  // Change advertiser status
  async changeStatus(id, status) {
    return await Advertiser.changeStatus(id, status);
  }

  // Get advertiser dashboard data
  async getAdvertiserDashboard(id) {
    return await Advertiser.getDashboard(id);
  }

  // Get all pending sponsorship requests (for operators)
  async getAllPendingRequests() {
    return await Advertiser.getAllPendingRequests();
  }

  // Get sponsorship statistics (for operators)
  async getSponsorshipStatistics() {
    return await Advertiser.getSponsorshipStatistics();
  }

  // Get advertiser balance
  async getBalance(id) {
    return await Advertiser.getBalance(id);
  }
}

export default new AdvertiserService();

// backend/domains/Advertiser.js
import User from "../schemas/UserSchema.js";
import Advertiser from "../schemas/AdvertiserSchema.js";

export default class AdvertiserDomain {

  /* ===============================
     ADVERTISER MANAGEMENT
  =============================== */
  
  // Create a new advertiser (creates both User and Advertiser profile)
  static async create(userId, companyName, accountId) {
    // Check if user exists and update role
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");
    
    // Update user role to advertiser
    user.role = 'advertiser';
    user.status = user.status || 'pending'; // Advertisers need approval
    await user.save();

    // Create advertiser profile
    const advertiser = new Advertiser({ 
      user: userId, 
      companyName, 
      accountId 
    });
    await advertiser.save();

    // Link advertiser profile to user
    user.advertiserProfile = advertiser._id;
    await user.save();

    return {
      user: user.toJSON(),
      advertiserProfile: advertiser.toJSON()
    };
  }

  // Get advertiser by ID (returns both user and profile)
  static async getById(advertiserId) {
    const advertiser = await Advertiser.findById(advertiserId).populate('user', '-password');
    if (!advertiser) throw new Error("Advertiser not found");
    return advertiser.toJSON();
  }

  // Get advertiser by user ID
  static async getByUserId(userId) {
    const user = await User.findOne({ _id: userId, role: 'advertiser' })
      .populate('advertiserProfile')
      .select('-password');
    
    if (!user) throw new Error("User is not an advertiser");
    if (!user.advertiserProfile) throw new Error("Advertiser profile not found");
    
    return {
      user: user.toJSON(),
      advertiserProfile: user.advertiserProfile.toJSON()
    };
  }

  // Get all advertisers, optionally by status
  static async getAll(status) {
    let query = { role: 'advertiser' };
    if (status) query.status = status;

    const users = await User.find(query)
      .populate('advertiserProfile')
      .select('-password');
    
    return users.map(user => ({
      user: user.toJSON(),
      advertiserProfile: user.advertiserProfile ? user.advertiserProfile.toJSON() : null
    }));
  }

  // Update advertiser profile
  static async update(advertiserId, data) {
    const advertiser = await Advertiser.findByIdAndUpdate(
      advertiserId, 
      data, 
      { new: true }
    ).populate('user', '-password');
    
    if (!advertiser) throw new Error("Advertiser not found");
    return advertiser.toJSON();
  }

  // Delete advertiser (deletes both profile and sets user role)
  static async delete(advertiserId) {
    const advertiser = await Advertiser.findById(advertiserId);
    if (!advertiser) throw new Error("Advertiser not found");

    // Remove advertiser profile reference from user
    await User.findByIdAndUpdate(advertiser.user, {
      advertiserProfile: null,
      role: 'player', // Revert to default role or handle as needed
      status: 'inactive'
    });

    // Delete advertiser profile
    await Advertiser.findByIdAndDelete(advertiserId);
    
    return { message: "Advertiser deleted successfully" };
  }

  /* ===============================
     LEAGUE INTEREST MANAGEMENT
  =============================== */
  
  static async addLeague(advertiserId, leagueId) {
    const advertiser = await Advertiser.findById(advertiserId);
    if (!advertiser) throw new Error("Advertiser not found");
    
    if (!advertiser.leagues.includes(leagueId)) {
      advertiser.leagues.push(leagueId);
      await advertiser.save();
    }
    
    return advertiser.toJSON();
  }

  static async removeLeague(advertiserId, leagueId) {
    const advertiser = await Advertiser.findById(advertiserId);
    if (!advertiser) throw new Error("Advertiser not found");
    
    advertiser.leagues = advertiser.leagues.filter(
      l => l.toString() !== leagueId.toString()
    );
    await advertiser.save();
    
    return advertiser.toJSON();
  }

  /* ===============================
     SPONSORSHIP REQUEST MANAGEMENT
  =============================== */
  
  static async addSponsorshipRequest(advertiserId, tournamentId, leagueId, proposedAmount) {
    const advertiser = await Advertiser.findById(advertiserId);
    if (!advertiser) throw new Error("Advertiser not found");

    advertiser.sponsorshipRequests.push({ 
      tournamentId, 
      leagueId, 
      proposedAmount, 
      status: "pending" 
    });
    await advertiser.save();
    
    return advertiser.toJSON();
  }

  static async updateSponsorshipRequest(advertiserId, requestIndex, status) {
    const advertiser = await Advertiser.findById(advertiserId);
    if (!advertiser) throw new Error("Advertiser not found");
    if (!advertiser.sponsorshipRequests[requestIndex]) {
      throw new Error("Sponsorship request not found");
    }

    advertiser.sponsorshipRequests[requestIndex].status = status;
    await advertiser.save();
    
    return advertiser.toJSON();
  }

  /* ===============================
     SPONSORED TOURNAMENT MANAGEMENT
  =============================== */
  
  static async addSponsoredTournament(advertiserId, tournamentId, sponsorshipAmount, sponsorshipType) {
    const advertiser = await Advertiser.findById(advertiserId);
    if (!advertiser) throw new Error("Advertiser not found");

    advertiser.sponsoredTournaments.push({ 
      tournamentId, 
      sponsorshipAmount, 
      sponsorshipType 
    });
    await advertiser.save();
    
    return advertiser.toJSON();
  }

  static async removeSponsoredTournament(advertiserId, tournamentId) {
    const advertiser = await Advertiser.findById(advertiserId);
    if (!advertiser) throw new Error("Advertiser not found");

    advertiser.sponsoredTournaments = advertiser.sponsoredTournaments.filter(
      t => t.tournamentId.toString() !== tournamentId.toString()
    );
    await advertiser.save();
    
    return advertiser.toJSON();
  }

  /* ===============================
     STATUS MANAGEMENT
  =============================== */
  
  static async changeStatus(userId, status) {
    const user = await User.findOne({ _id: userId, role: 'advertiser' });
    if (!user) throw new Error("Advertiser user not found");
    
    user.status = status;
    await user.save();
    
    return user;
  }

  /* ===============================
     DASHBOARD & ANALYTICS
  =============================== */
  
  static async getDashboard(advertiserId) {
    const advertiser = await Advertiser.findById(advertiserId)
      .populate('user', '-password')
      .populate('leagues')
      .populate('sponsoredTournaments.tournamentId')
      .populate('sponsorshipRequests.tournamentId');
    
    if (!advertiser) throw new Error("Advertiser not found");

    return {
      advertiser: advertiser.toJSON(),
      totalSponsored: advertiser.sponsoredTournaments.length,
      pendingRequests: advertiser.sponsorshipRequests.filter(
        r => r.status === "pending"
      ).length,
    };
  }

  static async getBalance(advertiserId) {
    const advertiser = await Advertiser.findById(advertiserId).populate('user', '-password');
    if (!advertiser) throw new Error("Advertiser not found");

    const totalCost = advertiser.ads.reduce(
      (sum, ad) =>
        sum +
        (ad.type === "exclusive"
          ? ad.fee
          : ad.impressions * ad.perImpressionCost + ad.clicks * ad.perClickCost),
      0
    );
    
    const balance = totalCost - advertiser.payments;
    
    return { 
      advertiser: advertiser.toJSON(), 
      balance 
    };
  }

  /* ===============================
     GLOBAL QUERIES
  =============================== */
  
  static async getAllPendingRequests() {
    const advertisers = await Advertiser.find({ 
      "sponsorshipRequests.status": "pending" 
    }).populate('user', '-password');
    
    return advertisers.map(a => a.toJSON());
  }

  static async getSponsorshipStatistics() {
    const advertisers = await Advertiser.find();
    
    return {
      totalAdvertisers: advertisers.length,
      totalSponsoredTournaments: advertisers.reduce(
        (sum, a) => sum + a.sponsoredTournaments.length, 
        0
      ),
    };
  }
}
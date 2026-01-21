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
    
    if (!advertiser.leaguesOfInterest.includes(leagueId)) {
      advertiser.leaguesOfInterest.push(leagueId);
      await advertiser.save();
    }
    
    return advertiser.toJSON();
  }

  static async removeLeague(advertiserId, leagueId) {
    const advertiser = await Advertiser.findById(advertiserId);
    if (!advertiser) throw new Error("Advertiser not found");
    
    advertiser.leaguesOfInterest = advertiser.leaguesOfInterest.filter(
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
      tournament: tournamentId, 
      league: leagueId, 
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
      tournament: tournamentId, 
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
      t => t.tournament.toString() !== tournamentId.toString()
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
      .populate('leaguesOfInterest')
      .populate('sponsoredTournaments.tournament')
      .populate('sponsorshipRequests.tournament');
    
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
    
    const balance = (advertiser.payments || 0) + (advertiser.initialBalance || 0) - totalCost; // Assuming logic: payments + initial - cost
    // Checking schema: payments is just a number. Let's assume payments = total funds added.
    // Wait, the previous logic was: totalCost - payments. That implies payments are what they OWE? 
    // Usually 'payments' in an advertiser context effectively means 'funds added' (prepaid) or 'bills paid'.
    // Given the context of "Add Funds", it sounds like a prepaid balance system.
    // So Balance = (Total Funds Added) - (Total Ad Spend).
    // Let's check Schema... 
    // Schema has 'payments': { type: Number, default: 0 }. 
    // And 'account': ref to Account.
    // If we are simulating a balance, let's assume 'payments' tracks total money put IN.
    // And 'ads' have costs.
    // So Balance = payments - totalCost.
    
    return { 
      advertiser: advertiser.toJSON(), 
      balance: (advertiser.payments || 0) - totalCost
    };
  }

  /* ===============================
     ADS & FUNDS MANAGEMENT
  =============================== */

  static async addFunds(advertiserId, amount) {
    const advertiser = await Advertiser.findById(advertiserId);
    if (!advertiser) throw new Error("Advertiser not found");

    if (amount <= 0) throw new Error("Amount must be positive");

    advertiser.payments = (advertiser.payments || 0) + Number(amount);
    await advertiser.save();

    return this.getBalance(advertiserId);
  }

  static async uploadAd(advertiserId, adData) {
    const advertiser = await Advertiser.findById(advertiserId);
    if (!advertiser) throw new Error("Advertiser not found");

    const newAd = {
      title: adData.title,
      content: adData.content,
      tournament: adData.tournamentId, // Optional
      type: adData.type || 'impression',
      fee: adData.fee || 0,
      createdAt: new Date()
    };

    advertiser.ads.push(newAd);
    await advertiser.save();

    return advertiser.ads[advertiser.ads.length - 1]; // Return the created ad
  }

  static async getAds(advertiserId) {
    const advertiser = await Advertiser.findById(advertiserId).populate('ads.tournament');
    if (!advertiser) throw new Error("Advertiser not found");
    return advertiser.ads;
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
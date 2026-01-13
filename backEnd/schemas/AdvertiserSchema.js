// backend/schemas/AdvertiserSchema.js
import mongoose from 'mongoose';

const AdvertiserSchema = new mongoose.Schema({
  // Reference to User (one-to-one relationship)
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true // Ensures one advertiser profile per user
  },
  
  companyName: {
    type: String,
    required: true
  },
  
  // Leagues advertiser is interested in for exclusive sponsorships
  leaguesOfInterest: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "League"
  }],
  
  // Tournaments currently/previously sponsored
  sponsoredTournaments: [{
    tournament: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tournament"
    },
    type: {
      type: String,
      enum: ['exclusive', 'perUnit'],
      default: 'perUnit'
    },
    amountPaid: { 
      type: Number,
      default: 0
    },
    startDate: Date,
    endDate: Date
  }],
  
  // Pending sponsorship requests
  sponsorshipRequests: [{
    tournament: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tournament"
    },
    league: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "League"
    },
    proposedAmount: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined'],
      default: 'pending'
    },
    requestedAt: {
      type: Date,
      default: Date.now
    },
    respondedAt: Date
  }],
  
  // Advertisement tracking
  ads: [{
    tournament: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tournament"
    },
    type: { 
      type: String, 
      enum: ['exclusive', 'impression', 'click'],
      default: 'impression'
    },
    fee: { 
      type: Number, 
      default: 0 
    },
    impressions: { 
      type: Number, 
      default: 0 
    },
    clicks: { 
      type: Number, 
      default: 0 
    },
    perImpressionCost: { 
      type: Number, 
      default: 0 
    },
    perClickCost: { 
      type: Number, 
      default: 0 
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Financial tracking
  account: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Account"
  },
  
  payments: { 
    type: Number, 
    default: 0 
  },
  
  // Status is now primarily managed on User model
  // This is kept for backward compatibility if needed
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  }
  
}, {
  timestamps: true
});

// Index for faster queries
AdvertiserSchema.index({ user: 1 });
AdvertiserSchema.index({ 'sponsorshipRequests.status': 1 });

// Virtual for total sponsored tournaments
AdvertiserSchema.virtual('totalSponsoredTournaments').get(function() {
  return this.sponsoredTournaments.length;
});

// Virtual for pending requests count
AdvertiserSchema.virtual('pendingRequestsCount').get(function() {
  return this.sponsorshipRequests.filter(req => req.status === 'pending').length;
});

// Method to calculate total ad costs
AdvertiserSchema.methods.calculateAdCosts = function() {
  return this.ads.reduce((sum, ad) => {
    if (ad.type === 'exclusive') {
      return sum + ad.fee;
    }
    return sum + (ad.impressions * ad.perImpressionCost) + (ad.clicks * ad.perClickCost);
  }, 0);
};

// Method to calculate balance
AdvertiserSchema.methods.calculateBalance = function() {
  const totalCost = this.calculateAdCosts();
  return totalCost - this.payments;
};

export default mongoose.model("Advertiser", AdvertiserSchema);
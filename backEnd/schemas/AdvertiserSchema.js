import mongoose from "mongoose";

const AdvertiserSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
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
    amountPaid: Number,
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
  
  account: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Account"
  },
  
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  }
}, {
  timestamps: true
});

export default mongoose.model("Advertiser", AdvertiserSchema);
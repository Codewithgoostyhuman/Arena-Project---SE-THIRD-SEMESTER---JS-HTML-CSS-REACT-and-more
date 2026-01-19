import mongoose from "mongoose";

const TournamentSchema = new mongoose.Schema({
  name: { type: String, required: true },

  league: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "League",
    required: true,
  },

  style: {
    type: String,
    enum: ["RoundRobin", "DoubleRoundRobin", "SingleElimination"],
    required: true,
  },

  maxPlayers: Number,


  applicationStartDate: Date,
  applicationEndDate: Date,
  

  playStartDate: Date,
  playEndDate: Date,

  players: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  

  applications: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application'
  }],

  matches: [{ type: mongoose.Schema.Types.ObjectId, ref: "Match" }],

  winners: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],


  exclusiveSponsor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Advertiser"
  },
  
  sponsorshipRequests: [{
    advertiser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Advertiser"
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined', 'selected'],
      default: 'pending'
    },
    requestedAt: {
      type: Date,
      default: Date.now
    },
    respondedAt: Date
  }],
  
 
  advertisements: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Advertisement"
  }],
  

  notifiedGroups: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "InterestGroup"
  }],

  status: {
    type: String,
    enum: ["planning", "seeking_sponsors", "open_for_applications", "upcoming", "ongoing", "finished"],
    default: "open_for_applications",
  },
}, {
  timestamps: true
});

export default mongoose.model("Tournament", TournamentSchema);

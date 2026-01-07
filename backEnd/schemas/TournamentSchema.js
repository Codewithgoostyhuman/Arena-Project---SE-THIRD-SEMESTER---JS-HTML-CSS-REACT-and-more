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

  // ✅ NEW: Application dates (when players can apply)
  applicationStartDate: Date,
  applicationEndDate: Date,
  
  // ✅ RENAMED: Play dates (when tournament actually runs)
  playStartDate: Date,
  playEndDate: Date,

  players: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  
  // ✅ NEW: Player applications (embedded like in League)
  applications: [{
    player: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    appliedAt: {
      type: Date,
      default: Date.now
    },
    reviewedAt: Date
  }],

  matches: [
    {
      players: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      winner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      isDraw: Boolean,
    },
  ],

  winners: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

  // ✅ NEW: Sponsorship fields
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
  
  // ✅ NEW: Advertisements displayed during tournament
  advertisements: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Advertisement"
  }],
  
  // ✅ NEW: Notified interest groups
  notifiedGroups: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "InterestGroup"
  }],

  status: {
    type: String,
    enum: ["planning", "seeking_sponsors", "open_for_applications", "upcoming", "ongoing", "finished"],
    default: "planning",
  },
}, {
  timestamps: true
});

export default mongoose.model("Tournament", TournamentSchema);

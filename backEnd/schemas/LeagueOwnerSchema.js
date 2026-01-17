import mongoose from "mongoose";

const LeagueOwnerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  // Leagues owned by this user
  leagues: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "League"
  }],

  // Tournaments directly created by this owner (if needed separately)
  tournaments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tournament"
  }],

  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active"
  }

}, {
  timestamps: true
});

export default mongoose.model("LeagueOwner", LeagueOwnerSchema);

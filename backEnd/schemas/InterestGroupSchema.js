import mongoose from "mongoose";

const InterestGroupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  
  description: String,
  
  // Members can be players, spectators, or advertisers
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],
  
  // Interests
  games: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Game"
  }],
  
  leagues: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "League"
  }],
  
  type: {
    type: String,
    enum: ['players', 'spectators', 'advertisers', 'mixed'],
    default: 'mixed'
  }
}, {
  timestamps: true
});

export default mongoose.model("InterestGroup", InterestGroupSchema);
import mongoose from "mongoose";

const LeagueSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  
  game: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Game",
    required: true
  },
  
  ratingFormula: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "RatingFormula",
    required: true
  },
  
  description: String,
  
  maxPlayers: {
    type: Number,
    default: 64
  },
  
  players: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],
  
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
  
  tournaments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tournament"
  }],
  
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  }
}, {
  timestamps: true
});

export default mongoose.model("League", LeagueSchema);
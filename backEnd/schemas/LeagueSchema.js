import mongoose from "mongoose";
import { Schema } from "mongoose";

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
    type: Schema.Types.ObjectId,
    ref: 'Application'
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
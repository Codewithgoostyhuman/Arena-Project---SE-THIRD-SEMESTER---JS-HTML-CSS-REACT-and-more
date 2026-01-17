import mongoose from "mongoose";

const GameSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    unique: true 
  },
  
  description: { 
    type: String, 
    required: true 
  },
  
  type: {
    type: String,
    enum: ["TicTacToe", "RockPaperScissors", "NumberGuessDuel"],
    required: true
  },
  
  minPlayers: { 
    type: Number, 
    required: true,
    default: 2
  },
  
  maxPlayers: { 
    type: Number, 
    required: true,
    default: 2
  },
  
  rules: {
    type: String,
    required: true
  },
  
  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active"
  }
}, {
  timestamps: true
});

export default mongoose.model("Game", GameSchema);
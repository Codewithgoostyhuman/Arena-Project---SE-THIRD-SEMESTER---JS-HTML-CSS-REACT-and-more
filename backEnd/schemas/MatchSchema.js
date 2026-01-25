  import mongoose from "mongoose";

  const matchSchema = new mongoose.Schema({
    league: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "League" 
    },
    
    tournament: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Tournament" 
    },
    
    game: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Game",
      required: true
    },
    
    // Players in this match
    players: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User" 
    }],
    
    // Tournament bracket information
    round: {
      type: Number,
      default: 1
    },
    
    matchNumber: {
      type: Number
    },
    
    // Match progression
    nextMatchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Match"
    },
    
    previousMatches: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Match"
    }],
    
    // Seeding information
    seeds: {
      player1Seed: Number,
      player2Seed: Number
    },
    
    // Score tracking
    score: {
      player1: { type: Number, default: 0 },
      player2: { type: Number, default: 0 }
    },
    
    // Winner and result
    winner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    
    loser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    
    isDraw: {
      type: Boolean,
      default: false
    },
    
    // Match format (for best of X series)
    bestOf: {
      type: Number,
      default: 1
    },
    
    // Individual games within the match
    games: {
      type: [{
        gameNumber: Number,
        gameState: mongoose.Schema.Types.Mixed,
        winner: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User"
        },
        moves: [{
          player: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
          },
          move: mongoose.Schema.Types.Mixed,
          timestamp: {
            type: Date,
            default: Date.now
          }
        }],
        completedAt: Date
      }],
      default: []  // ← ADD THIS
    },
    
    // Current game state (for live matches)
    currentGameState: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },
    
    currentTurn: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },
    
    // Match status
    status: {
      type: String,
      enum: ["pending", "ready", "live", "finished", "cancelled"],
      default: "pending"
    },
    
    // Scheduling
    scheduledTime: Date,
    startedAt: Date,
    completedAt: Date,
    
    // Special match types
    isThirdPlaceMatch: {
      type: Boolean,
      default: false
    },
    
    isFinals: {
      type: Boolean,
      default: false
    },

    // Ready state tracking
    playersReady: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }]
    
  }, {  
    timestamps: true 
  });

  // Indexes for performance
  matchSchema.index({ tournament: 1, round: 1, matchNumber: 1 });
  matchSchema.index({ status: 1 });
  matchSchema.index({ league: 1, status: 1 });

  export default mongoose.model("Match", matchSchema);
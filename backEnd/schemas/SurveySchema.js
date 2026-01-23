import mongoose from "mongoose";

const SurveySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  
  // Array of responses to different questions
  responses: [{
    question: {
      type: String,
      required: true
    },
    answer: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    }
  }],
  
  // Preferred categories for targeted ads
  interests: {
    games: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Game"
    }],
    leagues: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "League"
    }],
    general: [String] // e.g., "Strategy", "Mobile", "PC"
  },
  
  completedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for aggregate reporting
SurveySchema.index({ 'interests.general': 1 });
SurveySchema.index({ 'interests.games': 1 });

export default mongoose.model("Survey", SurveySchema);

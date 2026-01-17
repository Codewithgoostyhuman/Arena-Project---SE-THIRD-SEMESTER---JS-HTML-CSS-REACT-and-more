import mongoose from "mongoose";

const RatingFormulaSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    unique: true 
  },
  
  description: { 
    type: String, 
    required: true 
  },
  
  winnerScore: {
    type: Number,
    required: true,
    default: 3
  },
  
  loserScore: {
    type: Number,
    required: true,
    default: 0
  },
  
  drawScore: {
    type: Number,
    required: true,
    default: 1
  },
  
  isDefault: {
    type: Boolean,
    default: false
  },
  
  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active"
  }
}, {
  timestamps: true
});

export default mongoose.model("RatingFormula", RatingFormulaSchema);
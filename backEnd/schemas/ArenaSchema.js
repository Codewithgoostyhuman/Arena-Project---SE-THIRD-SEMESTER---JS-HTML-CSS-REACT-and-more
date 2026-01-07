import mongoose from "mongoose";

const ArenaSchema = new mongoose.Schema({
  // Singleton pattern - should only have one document
  isSingleton: {
    type: Boolean,
    default: true,
    unique: true
  },
  
  maxTournamentsPerLeague: {
    type: Number,
    default: 10
  },
  
  maxTournamentsGlobal: {
    type: Number,
    default: 100
  },
  
  // Flat fee for exclusive sponsorships
  exclusiveSponsorshipFee: {
    type: Number,
    default: 500
  },
  
  // Per-unit charges
  perImpressionCost: {
    type: Number,
    default: 0.10
  },
  
  perClickCost: {
    type: Number,
    default: 1.00
  },
  
  // System status
  maintenanceMode: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

export default mongoose.model("Arena", ArenaSchema);
// backend/schemas/UserSchema.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    unique: true 
  },
  
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  
  password: { 
    type: String, 
    required: true, 
    minlength: 6 
  },

  role: {
    type: String,
    enum: ["operator", "leagueOwner", "player", "advertiser"],
    default: "player",
    required: true,
  },

  status: {
    type: String,
    enum: ["active", "inactive", "pending", "rejected"],
    default: "inactive", // Requires operator approval
    required: true,
  },

  // Player-specific fields (used only if role === "player")
  stats: {
    wins: { type: Number, default: 0 },
    losses: { type: Number, default: 0 },
    draws: { type: Number, default: 0 },
    points: { type: Number, default: 0 },
  },

  // League Owner-specific fields (used only if role === "leagueOwner")
  leagues: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "League"
  }],

  tournaments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tournament"
  }],

  // Advertiser-specific field - reference to detailed advertiser profile
  advertiserProfile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Advertiser"
  }

}, {
  timestamps: true // Adds createdAt and updatedAt
});

// Password hashing middleware
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password method
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Virtual to check if user is a league owner
UserSchema.virtual('isLeagueOwner').get(function() {
  return this.role === 'leagueOwner';
});

// Virtual to check if user is a player
UserSchema.virtual('isPlayer').get(function() {
  return this.role === 'player';
});

// Virtual to check if user is an advertiser
UserSchema.virtual('isAdvertiser').get(function() {
  return this.role === 'advertiser';
});

// Virtual to check if user is an operator
UserSchema.virtual('isOperator').get(function() {
  return this.role === 'operator';
});

export default mongoose.model("User", UserSchema);
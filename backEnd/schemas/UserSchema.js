import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true }, // Add unique here too
  password: { type: String, required: true, minlength: 6 }, // Add min length

  role: {
    type: String,
    enum: ["operator", "leagueOwner", "player","advertiser"],
    default: "player", // Add default
    required: true,
  },

  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "inactive", // Add default (requires operator approval)
    required: true,
  },

  // Player stats (used only if role === player)
  stats: {
    wins: { type: Number, default: 0 },
    losses: { type: Number, default: 0 },
    draws: { type: Number, default: 0 },
    points: { type: Number, default: 0 },
  },
}, {
  timestamps: true // Optional: adds createdAt and updatedAt
});

export default mongoose.model("User", UserSchema);
import mongoose from "mongoose";

const TournamentSchema = new mongoose.Schema({
  name: { type: String, required: true },

  league: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "League",
    required: true,
  },

  style: {
    type: String,
    enum: ["RoundRobin", "DoubleRoundRobin", "SingleElimination"],
    required: true,
  },

  maxPlayers: Number,

  players: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

  matches: [
    {
      players: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      winner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      isDraw: Boolean,
    },
  ],

  winners: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

  status: {
    type: String,
    enum: ["upcoming", "ongoing", "finished"],
    default: "upcoming",
  },
});

export default mongoose.model("Tournament", TournamentSchema);

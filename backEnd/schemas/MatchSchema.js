import mongoose from "mongoose";

const matchSchema = new mongoose.Schema({
  league: { type: mongoose.Schema.Types.ObjectId, ref: "League" },
  tournament: { type: mongoose.Schema.Types.ObjectId, ref: "Tournament" },
  players: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  game: { type: mongoose.Schema.Types.ObjectId, ref: "Game" },
  score: {
  player1: { type: Number, default: 0 },
  player2: { type: Number, default: 0 }
},
  status: {
    type: String,
    enum: ["upcoming", "live", "finished"],
    default: "upcoming"
  },
  startedAt: Date
}, { timestamps: true });

export default mongoose.model("Match", matchSchema);

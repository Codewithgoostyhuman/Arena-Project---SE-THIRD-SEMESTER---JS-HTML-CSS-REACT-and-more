import mongoose from "mongoose";

const ApplicationSchema = new mongoose.Schema({
  player: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  targetType: {
    type: String,
    enum: ["league", "tournament"],
    required: true,
  },

  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },

  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },

  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Application", ApplicationSchema);

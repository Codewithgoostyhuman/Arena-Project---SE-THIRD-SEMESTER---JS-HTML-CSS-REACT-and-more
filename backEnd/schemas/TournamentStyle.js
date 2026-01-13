import mongoose from "mongoose";

const TournamentStyleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true, // Each style must have a unique name
  },

  description: {
    type: String,
    required: true,
  },

  isDefault: {
    type: Boolean,
    default: false, // Marks if this is the default tournament style
  },

  status: {
    type: String,
    enum: ["active", "inactive"], // Only "active" or "inactive" allowed
    default: "active",
  }
}, {
  timestamps: true, // Automatically create createdAt and updatedAt fields
});

export default mongoose.model("TournamentStyle", TournamentStyleSchema);

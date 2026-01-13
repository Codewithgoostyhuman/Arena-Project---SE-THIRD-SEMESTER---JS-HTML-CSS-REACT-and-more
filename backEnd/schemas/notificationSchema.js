// backend/schemas/NotificationSchema.js
import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },

  type: {
    type: String,
    enum: [
      "tournament_announced",
      "tournament_starting",
      "match_scheduled",
      "match_starting",
      "tournament_results",
      "application_approved",
      "application_rejected",
      "sponsorship_request",
      "system_announcement"
    ],
    required: true
  },

  title: {
    type: String,
    required: true
  },

  message: {
    type: String,
    required: true
  },

  link: {
    type: String // URL to relevant resource
  },

  relatedTournament: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tournament"
  },

  relatedMatch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Match"
  },

  relatedLeague: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "League"
  },

  read: {
    type: Boolean,
    default: false,
    index: true
  },

  readAt: Date

}, {
  timestamps: true
});

// Index for efficient queries
NotificationSchema.index({ user: 1, read: 1, createdAt: -1 });

// Mark as read
NotificationSchema.methods.markAsRead = function() {
  this.read = true;
  this.readAt = new Date();
  return this.save();
};

export default mongoose.model("Notification", NotificationSchema);
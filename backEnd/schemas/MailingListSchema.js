import mongoose from "mongoose";

const MailingListSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  
  description: String,
  
  // Type of mailing list
  type: {
    type: String,
    enum: ['global', 'league', 'game', 'interest_group'],
    default: 'global'
  },
  
  // Reference to associated entity if applicable
  referenceId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'type' // This is a bit tricky with mongoose refPath if the type doesn't match the model name exactly, but we can handle it in logic
  },
  
  // Subscribers (User IDs)
  subscribers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  // Count for quick access
  subscriberCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Update subscriberCount before saving
MailingListSchema.pre('save', function(next) {
  this.subscriberCount = this.subscribers.length;
  next();
});

export default mongoose.model("MailingList", MailingListSchema);

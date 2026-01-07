import mongoose from "mongoose";

const AdvertisementSchema = new mongoose.Schema({
  advertiser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Advertiser",
    required: true
  },
  
  title: {
    type: String,
    required: true
  },
  
  imageUrl: {
    type: String,
    required: true
  },
  
  targetUrl: {
    type: String,
    required: true
  },
  
  // Associated game (optional - for targeting)
  game: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Game"
  },
  
  // Metrics
  impressions: {
    type: Number,
    default: 0
  },
  
  clicks: {
    type: Number,
    default: 0
  },
  
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending'],
    default: 'pending'
  }
}, {
  timestamps: true
});

// Method to record impression
AdvertisementSchema.methods.recordImpression = function() {
  this.impressions += 1;
  return this.save();
};

// Method to record click
AdvertisementSchema.methods.recordClick = function() {
  this.clicks += 1;
  return this.save();
};

// Virtual for CTR (Click-Through Rate)
AdvertisementSchema.virtual('ctr').get(function() {
  if (this.impressions === 0) return 0;
  return ((this.clicks / this.impressions) * 100).toFixed(2);
});

export default mongoose.model("Advertisement", AdvertisementSchema);
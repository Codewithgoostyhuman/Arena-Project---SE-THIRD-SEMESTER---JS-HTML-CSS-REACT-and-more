// domains/Advertisement.js
import AdvertisementModel from "../schemas/AdvertisementSchema.js";
import fs from "fs";
import path from "path";

export default class Advertisement {
  constructor(advertiserId, title, imageUrl, targetUrl, gameId = null, status = "pending") {
    this.advertiser = advertiserId;
    this.title = title;
    this.imageUrl = imageUrl;
    this.targetUrl = targetUrl;
    this.game = gameId;
    this.status = status;
    this.impressions = 0;
    this.clicks = 0;
  }

  // Instance method to create advertisement
  async create() {
    const ad = new AdvertisementModel({
      advertiser: this.advertiser,
      title: this.title,
      imageUrl: this.imageUrl,
      targetUrl: this.targetUrl,
      game: this.game,
      status: this.status,
      impressions: this.impressions,
      clicks: this.clicks
    });
    return await ad.save();
  }

  // Static factory method to load from database
  static async findById(id) {
    const adDoc = await AdvertisementModel.findById(id)
      .populate("advertiser", "companyName email")
      .populate("game", "name");
    
    if (!adDoc) return null;
    return Advertisement.fromDocument(adDoc);
  }

  // Static factory method to load all advertisements
  static async findAll() {
    const adDocs = await AdvertisementModel.find()
      .populate("advertiser", "companyName email")
      .populate("game", "name")
      .sort({ createdAt: -1 });
    
    return adDocs.map(doc => Advertisement.fromDocument(doc));
  }

  // Static factory method to find by advertiser
  static async findByAdvertiser(advertiserId) {
    const adDocs = await AdvertisementModel.find({ advertiser: advertiserId })
      .populate("advertiser", "companyName email")
      .populate("game", "name")
      .sort({ createdAt: -1 });
    
    return adDocs.map(doc => Advertisement.fromDocument(doc));
  }

  // Static factory method to find by status
  static async findByStatus(status) {
    const adDocs = await AdvertisementModel.find({ status })
      .populate("advertiser", "companyName email")
      .populate("game", "name")
      .sort({ createdAt: -1 });
    
    return adDocs.map(doc => Advertisement.fromDocument(doc));
  }

  // Static factory method to create domain object from Mongoose document
  static fromDocument(doc) {
    const ad = new Advertisement(
      doc.advertiser,
      doc.title,
      doc.imageUrl,
      doc.targetUrl,
      doc.game,
      doc.status
    );
    ad._id = doc._id;
    ad.impressions = doc.impressions || 0;
    ad.clicks = doc.clicks || 0;
    ad.createdAt = doc.createdAt;
    ad.updatedAt = doc.updatedAt;
    ad._doc = doc; // Keep reference to original document
    return ad;
  }

  // Business logic: Approve advertisement
  approve() {
    if (this.status === "active") {
      throw new Error("Advertisement is already active");
    }
    this.status = "active";
  }

  // Business logic: Reject advertisement
  reject() {
    if (this.status === "inactive") {
      throw new Error("Advertisement is already inactive");
    }
    this.status = "inactive";
  }

  // Business logic: Pause advertisement
  pause() {
    if (this.status !== "active") {
      throw new Error("Only active advertisements can be paused");
    }
    this.status = "paused";
  }

  // Business logic: Resume advertisement
  resume() {
    if (this.status !== "paused") {
      throw new Error("Only paused advertisements can be resumed");
    }
    this.status = "active";
  }

  // Business logic: Record impression
  recordImpression() {
    if (this.status !== "active") {
      throw new Error("Cannot record impression for inactive advertisement");
    }
    this.impressions += 1;
  }

  // Business logic: Record click
  recordClick() {
    if (this.status !== "active") {
      throw new Error("Cannot record click for inactive advertisement");
    }
    this.clicks += 1;
  }

  // Business logic: Calculate click-through rate (CTR)
  calculateCTR() {
    if (this.impressions === 0) return 0;
    return (this.clicks / this.impressions) * 100;
  }

  // Business logic: Check if ad is performing well
  isPerformingWell(minCTR = 1.0) {
    return this.calculateCTR() >= minCTR;
  }

  // Business logic: Validate ad data
  validate() {
    const errors = [];

    if (!this.title || this.title.trim().length === 0) {
      errors.push("Title is required");
    }
    if (this.title && this.title.length > 100) {
      errors.push("Title must be less than 100 characters");
    }
    if (!this.imageUrl) {
      errors.push("Image URL is required");
    }
    if (!this.targetUrl) {
      errors.push("Target URL is required");
    }
    if (this.targetUrl && !this.isValidUrl(this.targetUrl)) {
      errors.push("Target URL must be a valid URL");
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Helper: Validate URL
  isValidUrl(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  // Persistence: Save changes to database
  async save() {
    if (this._doc) {
      // Update existing document
      this._doc.title = this.title;
      this._doc.imageUrl = this.imageUrl;
      this._doc.targetUrl = this.targetUrl;
      this._doc.game = this.game;
      this._doc.status = this.status;
      this._doc.impressions = this.impressions;
      this._doc.clicks = this.clicks;
      return await this._doc.save();
    } else {
      throw new Error("Cannot save domain object without document reference");
    }
  }

  // Static method: Delete advertisement with file cleanup
  static async delete(id) {
    const ad = await AdvertisementModel.findById(id);
    if (!ad) return null;

    // Delete image file if exists locally
    if (ad.imageUrl && ad.imageUrl.startsWith("/uploads/")) {
      const imagePath = path.join(process.cwd(), ad.imageUrl);
      try {
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      } catch (err) {
        console.error("Error deleting image file:", err);
        // Continue with deletion even if file cleanup fails
      }
    }

    return await AdvertisementModel.findByIdAndDelete(id);
  }

  // Convert to plain object for JSON responses
  toJSON() {
    return {
      _id: this._id,
      advertiser: this.advertiser,
      title: this.title,
      imageUrl: this.imageUrl,
      targetUrl: this.targetUrl,
      game: this.game,
      status: this.status,
      impressions: this.impressions,
      clicks: this.clicks,
      ctr: this.calculateCTR(),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  // Convert to summary object (for lists)
  toSummary() {
    return {
      _id: this._id,
      title: this.title,
      status: this.status,
      impressions: this.impressions,
      clicks: this.clicks,
      ctr: this.calculateCTR()
    };
  }
}
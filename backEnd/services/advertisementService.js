// services/advertisementService.js
import Advertisement from "../domains/Advertisement.js";

class AdvertisementService {
  // Create new advertisement
  async createAdvertisement(advertiserId, title, imageUrl, targetUrl, gameId = null) {
    const ad = new Advertisement(advertiserId, title, imageUrl, targetUrl, gameId);
    
    // Validate before creating
    const validation = ad.validate();
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(", ")}`);
    }

    const savedDoc = await ad.create();
    return Advertisement.fromDocument(savedDoc);
  }

  // Get advertisement by ID
  async getAdvertisementById(id) {
    const ad = await Advertisement.findById(id);
    if (!ad) {
      throw new Error("Advertisement not found");
    }
    return ad;
  }

  // Get all advertisements
  async getAllAdvertisements() {
    return await Advertisement.findAll();
  }

  // Get advertisements by advertiser
  async getAdvertisementsByAdvertiser(advertiserId) {
    return await Advertisement.findByAdvertiser(advertiserId);
  }

  // Get advertisements by status
  async getAdvertisementsByStatus(status) {
    const validStatuses = ["pending", "active", "inactive", "paused"];
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status. Must be one of: ${validStatuses.join(", ")}`);
    }
    return await Advertisement.findByStatus(status);
  }

  // Get active advertisements (for display)
  async getActiveAdvertisements(gameId = null) {
    const activeAds = await Advertisement.findByStatus("active");
    
    // Filter by game if specified
    if (gameId) {
      return activeAds.filter(ad => 
        ad.game && ad.game._id && ad.game._id.toString() === gameId.toString()
      );
    }
    
    return activeAds;
  }

  // Update advertisement
  async updateAdvertisement(id, updateData) {
    const ad = await Advertisement.findById(id);
    if (!ad) {
      throw new Error("Advertisement not found");
    }

    // Update allowed fields
    if (updateData.title) ad.title = updateData.title;
    if (updateData.targetUrl) ad.targetUrl = updateData.targetUrl;
    if (updateData.game !== undefined) ad.game = updateData.game;
    if (updateData.imageUrl) ad.imageUrl = updateData.imageUrl;

    // Validate after updates
    const validation = ad.validate();
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(", ")}`);
    }

    await ad.save();
    return ad;
  }

  // Approve advertisement
  async approveAdvertisement(id) {
    const ad = await Advertisement.findById(id);
    if (!ad) {
      throw new Error("Advertisement not found");
    }

    ad.approve();
    await ad.save();
    
    return ad;
  }

  // Reject advertisement
  async rejectAdvertisement(id) {
    const ad = await Advertisement.findById(id);
    if (!ad) {
      throw new Error("Advertisement not found");
    }

    ad.reject();
    await ad.save();
    
    return ad;
  }

  // Pause advertisement
  async pauseAdvertisement(id) {
    const ad = await Advertisement.findById(id);
    if (!ad) {
      throw new Error("Advertisement not found");
    }

    ad.pause();
    await ad.save();
    
    return ad;
  }

  // Resume advertisement
  async resumeAdvertisement(id) {
    const ad = await Advertisement.findById(id);
    if (!ad) {
      throw new Error("Advertisement not found");
    }

    ad.resume();
    await ad.save();
    
    return ad;
  }

  // Delete advertisement
  async deleteAdvertisement(id) {
    const result = await Advertisement.delete(id);
    if (!result) {
      throw new Error("Advertisement not found");
    }
    return result;
  }

  // Record impression
  async recordImpression(id) {
    const ad = await Advertisement.findById(id);
    if (!ad) {
      throw new Error("Advertisement not found");
    }

    ad.recordImpression();
    await ad.save();
    
    return ad;
  }

  // Record click
  async recordClick(id) {
    const ad = await Advertisement.findById(id);
    if (!ad) {
      throw new Error("Advertisement not found");
    }

    ad.recordClick();
    await ad.save();
    
    return ad;
  }

  // Get advertisement statistics
  async getAdvertisementStats(id) {
    const ad = await Advertisement.findById(id);
    if (!ad) {
      throw new Error("Advertisement not found");
    }

    return {
      id: ad._id,
      title: ad.title,
      status: ad.status,
      impressions: ad.impressions,
      clicks: ad.clicks,
      ctr: ad.calculateCTR(),
      isPerforming: ad.isPerformingWell()
    };
  }

  // Get performance report for advertiser
  async getAdvertiserPerformanceReport(advertiserId) {
    const ads = await Advertisement.findByAdvertiser(advertiserId);
    
    const totalImpressions = ads.reduce((sum, ad) => sum + ad.impressions, 0);
    const totalClicks = ads.reduce((sum, ad) => sum + ad.clicks, 0);
    const averageCTR = ads.length > 0 
      ? ads.reduce((sum, ad) => sum + ad.calculateCTR(), 0) / ads.length 
      : 0;

    return {
      totalAds: ads.length,
      activeAds: ads.filter(ad => ad.status === "active").length,
      pendingAds: ads.filter(ad => ad.status === "pending").length,
      totalImpressions,
      totalClicks,
      overallCTR: totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0,
      averageCTR: averageCTR.toFixed(2),
      topPerforming: ads
        .sort((a, b) => b.calculateCTR() - a.calculateCTR())
        .slice(0, 5)
        .map(ad => ad.toSummary())
    };
  }
}

export default new AdvertisementService();
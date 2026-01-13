// controllers/advertisementController.js
import advertisementService from "../services/advertisementService.js";

export const createAdvertisement = async (req, res) => {
  try {
    const { title, targetUrl, game } = req.body;
    const imageUrl = req.file ? `/uploads/ads/${req.file.filename}` : null;

    if (!imageUrl) {
      return res.status(400).json({ error: "Ad image is required" });
    }

    const ad = await advertisementService.createAdvertisement(
      req.user.advertiserId || req.user._id,
      title,
      imageUrl,
      targetUrl,
      game
    );
    
    res.status(201).json(ad.toJSON());
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getAdvertisement = async (req, res) => {
  try {
    const ad = await advertisementService.getAdvertisementById(req.params.id);
    res.json(ad.toJSON());
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};

export const getAllAdvertisements = async (req, res) => {
  try {
    const { status, game } = req.query;
    
    let ads;
    if (status) {
      ads = await advertisementService.getAdvertisementsByStatus(status);
    } else if (game) {
      ads = await advertisementService.getActiveAdvertisements(game);
    } else {
      ads = await advertisementService.getAllAdvertisements();
    }
    
    res.json(ads.map(ad => ad.toJSON()));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getMyAdvertisements = async (req, res) => {
  try {
    const ads = await advertisementService.getAdvertisementsByAdvertiser(
      req.user.advertiserId || req.user._id
    );
    res.json(ads.map(ad => ad.toJSON()));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateAdvertisement = async (req, res) => {
  try {
    const ad = await advertisementService.updateAdvertisement(
      req.params.id,
      req.body
    );
    res.json(ad.toJSON());
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const deleteAdvertisement = async (req, res) => {
  try {
    await advertisementService.deleteAdvertisement(req.params.id);
    res.json({ message: "Advertisement deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const approveAdvertisement = async (req, res) => {
  try {
    const ad = await advertisementService.approveAdvertisement(req.params.id);
    res.json(ad.toJSON());
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const rejectAdvertisement = async (req, res) => {
  try {
    const ad = await advertisementService.rejectAdvertisement(req.params.id);
    res.json(ad.toJSON());
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const pauseAdvertisement = async (req, res) => {
  try {
    const ad = await advertisementService.pauseAdvertisement(req.params.id);
    res.json(ad.toJSON());
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const resumeAdvertisement = async (req, res) => {
  try {
    const ad = await advertisementService.resumeAdvertisement(req.params.id);
    res.json(ad.toJSON());
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const recordImpression = async (req, res) => {
  try {
    const ad = await advertisementService.recordImpression(req.params.id);
    res.json({ 
      message: "Impression recorded", 
      impressions: ad.impressions,
      ctr: ad.calculateCTR()
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const recordClick = async (req, res) => {
  try {
    const ad = await advertisementService.recordClick(req.params.id);
    res.json({ 
      message: "Click recorded", 
      clicks: ad.clicks,
      ctr: ad.calculateCTR()
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getAdvertisementStats = async (req, res) => {
  try {
    const stats = await advertisementService.getAdvertisementStats(req.params.id);
    res.json(stats);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};

export const getPerformanceReport = async (req, res) => {
  try {
    const report = await advertisementService.getAdvertiserPerformanceReport(
      req.user.advertiserId || req.user._id
    );
    res.json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getActiveAdsForDisplay = async (req, res) => {
  try {
    const { game } = req.query;
    const ads = await advertisementService.getActiveAdvertisements(game);
    res.json(ads.map(ad => ad.toJSON()));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
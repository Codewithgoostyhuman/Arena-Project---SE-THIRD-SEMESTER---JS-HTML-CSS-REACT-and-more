// controllers/advertiserController.js
import advertiserService from "../services/advertiserService.js";

export const createAdvertiser = async (req, res) => {
  try {
    const ad = await advertiserService.createAdvertiser(
      req.user._id,
      req.body.companyName,
      req.body.accountId
    );
    res.status(201).json(ad);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getAdvertiser = async (req, res) => {
  try {
    const ad = await advertiserService.getAdvertiserById(req.params.id);
    res.json(ad);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};

export const getMyAdvertiser = async (req, res) => {
  try {
    const ad = await advertiserService.getAdvertiserByUserId(req.user._id);
    res.json(ad);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};

export const getAllAdvertisers = async (req, res) => {
  try {
    const { status } = req.query;
    const ads = status
      ? await advertiserService.getAdvertisersByStatus(status)
      : await advertiserService.getAllAdvertisers();
    res.json(ads);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateAdvertiser = async (req, res) => {
  try {
    const ad = await advertiserService.updateAdvertiser(req.params.id, req.body);
    res.json(ad);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const deleteAdvertiser = async (req, res) => {
  try {
    await advertiserService.deleteAdvertiser(req.params.id);
    res.json({ message: "Advertiser deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const addLeagueOfInterest = async (req, res) => {
  try {
    const ad = await advertiserService.addLeagueOfInterest(req.params.id, req.body.leagueId);
    res.json(ad);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const removeLeagueOfInterest = async (req, res) => {
  try {
    const ad = await advertiserService.removeLeagueOfInterest(req.params.id, req.body.leagueId);
    res.json(ad);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const addSponsorshipRequest = async (req, res) => {
  try {
    const { tournamentId, leagueId, proposedAmount, type } = req.body;
    const ad = await advertiserService.addSponsorshipRequest(
      req.params.id,
      tournamentId,
      leagueId,
      proposedAmount,
      type
    );
    res.json(ad);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const updateSponsorshipRequest = async (req, res) => {
  try {
    const { requestIndex, status } = req.body;
    const ad = await advertiserService.updateSponsorshipRequest(
      req.params.id,
      requestIndex,
      status
    );
    res.json(ad);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const addSponsoredTournament = async (req, res) => {
  try {
    const { tournamentId, sponsorshipAmount, sponsorshipType } = req.body;
    const ad = await advertiserService.addSponsoredTournament(
      req.params.id,
      tournamentId,
      sponsorshipAmount,
      sponsorshipType
    );
    res.json(ad);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const removeSponsoredTournament = async (req, res) => {
  try {
    const ad = await advertiserService.removeSponsoredTournament(
      req.params.id,
      req.body.tournamentId
    );
    res.json(ad);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const changeStatus = async (req, res) => {
  try {
    const ad = await advertiserService.changeStatus(req.params.id, req.body.status);
    res.json(ad);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getAdvertiserDashboard = async (req, res) => {
  try {
    const dashboard = await advertiserService.getAdvertiserDashboard(req.params.id);
    res.json(dashboard);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};

export const getMyDashboard = async (req, res) => {
  try {
    const ad = await advertiserService.getAdvertiserByUserId(req.user._id);
    const dashboard = await advertiserService.getAdvertiserDashboard(ad.advertiserProfile._id);
    res.json(dashboard);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};

export const getMyBalance = async (req, res) => {
  try {
    const ad = await advertiserService.getAdvertiserByUserId(req.user._id);
    const balance = await advertiserService.getBalance(ad.advertiserProfile._id);
    res.json(balance);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};

export const addFunds = async (req, res) => {
  try {
    console.log("Adding funds, body:", req.body);
    const { amount } = req.body;
    const ad = await advertiserService.getAdvertiserByUserId(req.user._id);
    const result = await advertiserService.addFunds(ad.advertiserProfile._id, amount);
    res.json(result);
  } catch (err) {
    console.error("Error adding funds:", err);
    res.status(400).json({ error: err.message });
  }
};

export const uploadAd = async (req, res) => {
  try {
    console.log("Uploading ad, body:", req.body, "file:", req.file);
    const adData = {
      ...req.body,
      imageUrl: req.file ? `/uploads/${req.file.filename}` : null
    };
    const ad = await advertiserService.getAdvertiserByUserId(req.user._id);
    const result = await advertiserService.uploadAd(ad.advertiserProfile._id, adData);
    res.status(201).json(result);
  } catch (err) {
    console.error("Error uploading ad:", err);
    res.status(400).json({ error: err.message });
  }
};

export const getMyAds = async (req, res) => {
  try {
    console.log("getMyAds: Request received for user", req.user?._id);
    if (!req.user) throw new Error("User not attached to request");

    const ad = await advertiserService.getAdvertiserByUserId(req.user._id);
    console.log("getMyAds: Advertiser found", ad?.advertiserProfile?._id);

    if (!ad?.advertiserProfile) throw new Error("Advertiser profile missing");

    let ads = [];
    try {
        ads = await advertiserService.getAds(ad.advertiserProfile._id);
    } catch (innerErr) {
        console.error("getMyAds: advertiserService.getAds FAILED:", innerErr);
        throw innerErr; // Re-throw to be caught by outer block
    }
    console.log("getMyAds: Ads fetched", ads?.length);
    
    res.json(ads);
  } catch (err) {
    console.error("getMyAds error:", err);
    res.status(500).json({ error: err.message, stack: err.stack });
  }
};

export const getAllPendingRequests = async (req, res) => {
  try {
    const requests = await advertiserService.getAllPendingRequests();
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getSponsorshipStatistics = async (req, res) => {
  try {
    const stats = await advertiserService.getSponsorshipStatistics();
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

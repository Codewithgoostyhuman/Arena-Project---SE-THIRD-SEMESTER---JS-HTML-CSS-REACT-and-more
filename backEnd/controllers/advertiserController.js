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
    const { tournamentId, leagueId, proposedAmount } = req.body;
    const ad = await advertiserService.addSponsorshipRequest(
      req.params.id,
      tournamentId,
      leagueId,
      proposedAmount
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
    const dashboard = await advertiserService.getAdvertiserDashboard(ad._id);
    res.json(dashboard);
  } catch (err) {
    res.status(404).json({ error: err.message });
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

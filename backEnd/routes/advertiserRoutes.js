import express from "express";
import * as advertiserController from "../controllers/advertiserController.js";
import { authenticate, authorizeRoles, Roles } from "../middleWare/auth.js";
import advertiserService from "../services/advertiserService.js";

const router = express.Router();

// ==============================
// MIDDLEWARE: attach advertiser ID for /me routes
// ==============================
const attachMyAdvertiserId = async (req, res, next) => {
  try {
    const advertiser = await advertiserService.getAdvertiserByUserId(req.user._id);
    req.params.id = advertiser._id;
    next();
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};

// ==============================
// ADVERTISER PROFILE ENDPOINTS
// ==============================

// Create advertiser profile
router.post(
  "/",
  authenticate,
  authorizeRoles(Roles.USER),
  advertiserController.createAdvertiser
);

// Get my advertiser profile
router.get(
  "/me",
  authenticate,
  authorizeRoles(Roles.ADVERTISER, Roles.USER),
  advertiserController.getMyAdvertiser
);

// Get my dashboard
router.get(
  "/me/dashboard",
  authenticate,
  authorizeRoles(Roles.ADVERTISER),
  advertiserController.getMyDashboard
);

// Update my advertiser info
router.put(
  "/me",
  authenticate,
  authorizeRoles(Roles.ADVERTISER),
  attachMyAdvertiserId,
  advertiserController.updateAdvertiser
);

// ==============================
// OPERATOR/ADMIN ENDPOINTS
// ==============================

// Get all advertisers
router.get(
  "/",
  authenticate,
  authorizeRoles(Roles.OPERATOR, Roles.ADMIN),
  advertiserController.getAllAdvertisers
);

// Get sponsorship statistics
router.get(
  "/statistics",
  authenticate,
  authorizeRoles(Roles.OPERATOR, Roles.ADMIN),
  advertiserController.getSponsorshipStatistics
);

// Get all pending sponsorship requests
router.get(
  "/requests/pending",
  authenticate,
  authorizeRoles(Roles.OPERATOR, Roles.ADMIN),
  advertiserController.getAllPendingRequests
);

// Get specific advertiser by ID
router.get(
  "/:id",
  authenticate,
  authorizeRoles(Roles.OPERATOR, Roles.ADMIN),
  advertiserController.getAdvertiser
);

// Get advertiser dashboard
router.get(
  "/:id/dashboard",
  authenticate,
  authorizeRoles(Roles.OPERATOR, Roles.ADMIN, Roles.ADVERTISER),
  advertiserController.getAdvertiserDashboard
);

// Update advertiser info (Operator/Admin)
router.put(
  "/:id",
  authenticate,
  authorizeRoles(Roles.OPERATOR, Roles.ADMIN),
  advertiserController.updateAdvertiser
);

// Delete advertiser
router.delete(
  "/:id",
  authenticate,
  authorizeRoles(Roles.OPERATOR, Roles.ADMIN),
  advertiserController.deleteAdvertiser
);

// Change advertiser status
router.put(
  "/:id/status",
  authenticate,
  authorizeRoles(Roles.OPERATOR, Roles.ADMIN),
  advertiserController.changeStatus
);

// ==============================
// LEAGUES OF INTEREST
// ==============================

// Add league of interest
router.post(
  "/:id/leagues/:leagueId",
  authenticate,
  authorizeRoles(Roles.ADVERTISER, Roles.OPERATOR),
  advertiserController.addLeagueOfInterest
);

// Remove league of interest
router.delete(
  "/:id/leagues/:leagueId",
  authenticate,
  authorizeRoles(Roles.ADVERTISER, Roles.OPERATOR),
  advertiserController.removeLeagueOfInterest
);

// ==============================
// SPONSORSHIP REQUESTS
// ==============================

// Add sponsorship request
router.post(
  "/:id/sponsorship",
  authenticate,
  authorizeRoles(Roles.ADVERTISER),
  advertiserController.addSponsorshipRequest
);

// Update sponsorship request status
router.put(
  "/:id/sponsorship/:index",
  authenticate,
  authorizeRoles(Roles.OPERATOR, Roles.ADMIN),
  advertiserController.updateSponsorshipRequest
);

// ==============================
// SPONSORED TOURNAMENTS
// ==============================

// Add sponsored tournament
router.post(
  "/:id/sponsored-tournament",
  authenticate,
  authorizeRoles(Roles.ADVERTISER, Roles.OPERATOR),
  advertiserController.addSponsoredTournament
);

// Remove sponsored tournament
router.delete(
  "/:id/sponsored-tournament/:tournamentId",
  authenticate,
  authorizeRoles(Roles.ADVERTISER, Roles.OPERATOR, Roles.ADMIN),
  advertiserController.removeSponsoredTournament
);

export default router;

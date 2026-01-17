import express from "express";
import { authenticate, authorizeRoles, Roles } from "../middleWare/auth.js";
import * as tournamentController from "../controllers/tournamentController.js";

const router = express.Router();
/* =======================
   PLAYER ROUTES
======================= */

// Apply to tournament
router.post(
  "/:tournamentId/apply",
  authenticate,
  authorizeRoles(Roles.PLAYER),
  tournamentController.applyToTournament
);

// Cancel tournament application (NEW)
router.delete(
  "/:tournamentId/application/:applicationId",
  authenticate,
  authorizeRoles(Roles.PLAYER),
  tournamentController.cancelTournamentApplication
);

// Leave tournament (NEW)
router.delete(
  "/:tournamentId/leave",
  authenticate,
  authorizeRoles(Roles.PLAYER),
  tournamentController.leaveTournament
);

// Get available tournaments for player
router.get(
  "/available",
  authenticate,
  authorizeRoles(Roles.PLAYER),
  tournamentController.getAvailableTournaments
);

// Get player's tournaments
router.get(
  "/my-tournaments",
  authenticate,
  authorizeRoles(Roles.PLAYER),
  tournamentController.getPlayerTournaments
);

// Get player's tournament applications (NEW)
router.get(
  "/my-applications",
  authenticate,
  authorizeRoles(Roles.PLAYER),
  tournamentController.getPlayerApplications
);

/* =======================
   LEAGUE OWNER / OPERATOR ROUTES
======================= */

// Create tournament
router.post(
  "/",
  authenticate,
  authorizeRoles(Roles.LEAGUE_OWNER, Roles.OPERATOR),
  tournamentController.createTournament
);

// Get owner's tournaments
router.get(
  "/my",
  authenticate,
  authorizeRoles(Roles.LEAGUE_OWNER, Roles.OPERATOR),
  tournamentController.getMyTournaments
);

// Update tournament
router.put(
  "/:tournamentId",
  authenticate,
  authorizeRoles(Roles.LEAGUE_OWNER, Roles.OPERATOR),
  tournamentController.updateTournament
);

// Delete tournament
router.delete(
  "/:tournamentId",
  authenticate,
  authorizeRoles(Roles.LEAGUE_OWNER, Roles.OPERATOR),
  tournamentController.deleteTournament
);

// Complete tournament
router.post(
  "/:tournamentId/complete",
  authenticate,
  authorizeRoles(Roles.LEAGUE_OWNER, Roles.OPERATOR),
  tournamentController.completeTournament
);

// Approve/Reject application
router.post(
  "/:tournamentId/application/:applicationId/:action",
  authenticate,
  authorizeRoles(Roles.LEAGUE_OWNER, Roles.OPERATOR),
  tournamentController.updateApplicationStatus
);

// Record match result
router.post(
  "/:tournamentId/match/:matchId/result",
  authenticate,
  authorizeRoles(Roles.LEAGUE_OWNER, Roles.OPERATOR),
  tournamentController.recordMatchResult
);

// Add exclusive sponsor
router.post(
  "/:tournamentId/sponsorship/exclusive",
  authenticate,
  authorizeRoles(Roles.LEAGUE_OWNER, Roles.OPERATOR),
  tournamentController.addExclusiveSponsor
);

// Add advertisement
router.post(
  "/:tournamentId/advertisement",
  authenticate,
  authorizeRoles(Roles.LEAGUE_OWNER, Roles.OPERATOR),
  tournamentController.addAdvertisement
);

// Notify groups
router.post(
  "/:tournamentId/notify-groups",
  authenticate,
  authorizeRoles(Roles.LEAGUE_OWNER, Roles.OPERATOR),
  tournamentController.notifyGroups
);

// Kickoff tournament
router.post(
  "/:tournamentId/kickoff",
  authenticate,
  authorizeRoles(Roles.LEAGUE_OWNER, Roles.OPERATOR),
  tournamentController.kickoffTournament
);

/* =======================
   SHARED/PUBLIC ROUTES
   (Accessible to authenticated users)
======================= */

// Get tournament winners
router.get(
  "/:tournamentId/winners",
  authenticate,
  tournamentController.getTournamentWinners
);

// Get tournament players
router.get(
  "/:tournamentId/players",
  authenticate,
  tournamentController.getTournamentPlayers
);

// Get tournament by ID (NEW)
router.get(
  "/:tournamentId",
  authenticate,
  tournamentController.getTournamentById
);

// Get tournament brackets (NEW)
router.get(
  "/:tournamentId/brackets",
  authenticate,
  tournamentController.getTournamentBrackets
);

// Get tournament leaderboard (NEW)
router.get(
  "/:tournamentId/leaderboard",
  authenticate,
  tournamentController.getTournamentLeaderboard
);

export default router;
// backend/routes/leagueOwnerRoutes.js
import express from "express";
import { authenticate, authorizeRoles, Roles } from "../middleware/auth.js";
import * as leagueOwnerController from "../controllers/leagueOwnerController.js";

const router = express.Router();
router.use((req, res, next) => {
  console.log('=====================');
  console.log('🔍 ROUTE FILE HIT');
  console.log('Method:', req.method);
  console.log('Path:', req.path);
  console.log('Full URL:', req.originalUrl);
  console.log('=====================');
  next();
});
/* ====================
   APPLICATION 
==================== */
// League Applications 
router.get("/league/applications", authenticate, authorizeRoles(Roles.LEAGUE_OWNER), leagueOwnerController.getLeagueApplications);
router.get("/league/:leagueId/applications", authenticate, authorizeRoles(Roles.LEAGUE_OWNER), leagueOwnerController.getLeagueApplications);
router.patch("/league/application/:applicationId/approve", authenticate, authorizeRoles(Roles.LEAGUE_OWNER), leagueOwnerController.approveLeagueApplication);
router.patch("/league/application/:applicationId/reject", authenticate, authorizeRoles(Roles.LEAGUE_OWNER), leagueOwnerController.rejectLeagueApplication);

// Tournament Applications
router.get("/tournament/applications", authenticate, authorizeRoles(Roles.LEAGUE_OWNER), leagueOwnerController.getTournamentApplications);
router.get("/tournament/:tournamentId/applications", authenticate, authorizeRoles(Roles.LEAGUE_OWNER), leagueOwnerController.getTournamentApplications);
router.patch("/tournament/application/:applicationId/approve", authenticate, authorizeRoles(Roles.LEAGUE_OWNER), leagueOwnerController.approveTournamentApplication);
router.patch("/tournament/application/:applicationId/reject", authenticate, authorizeRoles(Roles.LEAGUE_OWNER), leagueOwnerController.rejectTournamentApplication);

// Old generic handler
router.patch("/application", authenticate, authorizeRoles(Roles.LEAGUE_OWNER), leagueOwnerController.handleApplication);

/* ====================
   LEAGUE
==================== */
router.post("/league", authenticate, authorizeRoles(Roles.LEAGUE_OWNER), leagueOwnerController.createLeague);
router.put("/league/:id", authenticate, authorizeRoles(Roles.LEAGUE_OWNER), leagueOwnerController.updateLeague);
router.delete("/league/:id", authenticate, authorizeRoles(Roles.LEAGUE_OWNER), leagueOwnerController.deleteLeague);
router.patch("/league/:id/start", authenticate, authorizeRoles(Roles.LEAGUE_OWNER), leagueOwnerController.startLeague);

/* ====================
   TOURNAMENT
==================== */
router.post("/tournament", authenticate, authorizeRoles(Roles.LEAGUE_OWNER), leagueOwnerController.createTournament);
router.put("/tournament/:id", authenticate, authorizeRoles(Roles.LEAGUE_OWNER), leagueOwnerController.updateTournament);
router.patch("/tournament/:id/start", authenticate, authorizeRoles(Roles.LEAGUE_OWNER), leagueOwnerController.startTournament);
router.delete("/tournament/:id", authenticate, authorizeRoles(Roles.LEAGUE_OWNER), leagueOwnerController.deleteTournament);

/* ====================
   LEAGUE OWNER (Keep /:id routes at the END)
==================== */
router.post("/", authenticate, authorizeRoles(Roles.OPERATOR), leagueOwnerController.createLeagueOwner);
router.get("/", authenticate, authorizeRoles(Roles.OPERATOR), leagueOwnerController.getAllLeagueOwners);
router.get("/:id", authenticate, authorizeRoles(Roles.OPERATOR), leagueOwnerController.getLeagueOwnerById);
router.put("/:id", authenticate, authorizeRoles(Roles.OPERATOR), leagueOwnerController.updateLeagueOwner);
router.delete("/:id", authenticate, authorizeRoles(Roles.OPERATOR), leagueOwnerController.deleteLeagueOwner);



export default router;
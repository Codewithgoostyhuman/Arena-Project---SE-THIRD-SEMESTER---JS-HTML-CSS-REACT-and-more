// backend/routes/leagueOwnerRoutes.js
import express from "express";
import { authenticate, authorizeRoles, Roles } from "../middleWare/auth.js";
import * as leagueOwnerController from "../controllers/leagueOwnerController.js";

const router = express.Router();

/* ====================
   LEAGUE OWNER
==================== */
router.post(
  "/",
  authenticate,
  authorizeRoles(Roles.OPERATOR),
  leagueOwnerController.createLeagueOwner
);
router.get(
  "/",
  authenticate,
  authorizeRoles(Roles.OPERATOR),
  leagueOwnerController.getAllLeagueOwners
);
router.get(
  "/:id",
  authenticate,
  authorizeRoles(Roles.OPERATOR),
  leagueOwnerController.getLeagueOwnerById
);
router.put(
  "/:id",
  authenticate,
  authorizeRoles(Roles.OPERATOR),
  leagueOwnerController.updateLeagueOwner
);
router.delete(
  "/:id",
  authenticate,
  authorizeRoles(Roles.OPERATOR),
  leagueOwnerController.deleteLeagueOwner
);

/* ====================
   LEAGUE
==================== */
router.post(
  "/league",
  authenticate,
  authorizeRoles(Roles.LEAGUE_OWNER),
  leagueOwnerController.createLeague
);
router.put(
  "/league/:id",
  authenticate,
  authorizeRoles(Roles.LEAGUE_OWNER),
  leagueOwnerController.updateLeague
);
router.delete(
  "/league/:id",
  authenticate,
  authorizeRoles(Roles.LEAGUE_OWNER),
  leagueOwnerController.deleteLeague
);
router.patch(
  "/league/:id/start",
  authenticate,
  authorizeRoles(Roles.LEAGUE_OWNER),
  leagueOwnerController.startLeague
);

/* ====================
   TOURNAMENT
==================== */
router.post(
  "/tournament",
  authenticate,
  authorizeRoles(Roles.LEAGUE_OWNER),
  leagueOwnerController.createTournament
);
router.put(
  "/tournament/:id",
  authenticate,
  authorizeRoles(Roles.LEAGUE_OWNER),
  leagueOwnerController.updateTournament
);
router.patch(
  "/tournament/:id/start",
  authenticate,
  authorizeRoles(Roles.LEAGUE_OWNER),
  leagueOwnerController.startTournament
); // Delete Tournament
router.delete(
  "/tournament/:id",
  authenticate,
  authorizeRoles(Roles.LEAGUE_OWNER),
  leagueOwnerController.deleteTournament
);

/* ====================
   APPLICATION
==================== */
router.patch(
  "/application",
  authenticate,
  authorizeRoles(Roles.LEAGUE_OWNER),
  leagueOwnerController.handleApplication
);

export default router;

import express from "express";
import { authenticate, authorizeRoles, Roles } from "../middleWare/auth.js";
import * as tournamentController from "../controllers/tournamentController.js";

const router = express.Router();


/* =======================
   PLAYER ROUTES
======================= */
router.post(
  "/:tournamentId/apply",
  authenticate,
  authorizeRoles(Roles.PLAYER),
  tournamentController.applyToTournament
);

router.get(
  "/available",
  authenticate,
  authorizeRoles(Roles.PLAYER),
  tournamentController.getAvailableTournaments
);

router.get(
  "/my-tournaments",
  authenticate,
  authorizeRoles(Roles.PLAYER),
  tournamentController.getPlayerTournaments
);

/* =======================
   LEAGUE OWNER / OPERATOR ROUTES
======================= */
router.post(
  "/",
  authenticate,
  authorizeRoles(Roles.LEAGUE_OWNER, Roles.OPERATOR),
  tournamentController.createTournament
);
router.get('/my',authenticate,authorizeRoles(Roles.LEAGUE_OWNER,Roles.OPERATOR),tournamentController.getMyTournaments)
router.put(
  "/:tournamentId",
  authenticate,
  authorizeRoles(Roles.LEAGUE_OWNER, Roles.OPERATOR),
  tournamentController.updateTournament
);

router.delete(
  "/:tournamentId",
  authenticate,
  authorizeRoles(Roles.LEAGUE_OWNER, Roles.OPERATOR),
  tournamentController.deleteTournament
);

router.post(
  "/:tournamentId/complete",
  authenticate,
  authorizeRoles(Roles.LEAGUE_OWNER, Roles.OPERATOR),
  tournamentController.completeTournament
);

router.post(
  "/:tournamentId/application/:applicationId/:action",
  authenticate,
  authorizeRoles(Roles.LEAGUE_OWNER, Roles.OPERATOR),
  tournamentController.updateApplicationStatus
);

router.post(
  "/:tournamentId/match/:matchId/result",
  authenticate,
  authorizeRoles(Roles.LEAGUE_OWNER, Roles.OPERATOR),
  tournamentController.recordMatchResult
);

router.post(
  "/:tournamentId/sponsorship/exclusive",
  authenticate,
  authorizeRoles(Roles.LEAGUE_OWNER, Roles.OPERATOR),
  tournamentController.addExclusiveSponsor
);

router.post(
  "/:tournamentId/advertisement",
  authenticate,
  authorizeRoles(Roles.LEAGUE_OWNER, Roles.OPERATOR),
  tournamentController.addAdvertisement
);

router.post(
  "/:tournamentId/notify-groups",
  authenticate,
  authorizeRoles(Roles.LEAGUE_OWNER, Roles.OPERATOR),
  tournamentController.notifyGroups
);

router.get(
  "/:tournamentId/winners",
  authenticate,
  tournamentController.getTournamentWinners
);

router.get(
  "/:tournamentId/players",
  authenticate,
  tournamentController.getTournamentPlayers
);
router.post(
  "/:tournamentId/kickoff",
  authenticate,
  authorizeRoles(Roles.LEAGUE_OWNER, Roles.OPERATOR),
  tournamentController.kickoffTournament
);


export default router;

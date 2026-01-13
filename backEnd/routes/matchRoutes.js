import express from "express";
import * as matchController from "../controllers/matchController.js";
import { authenticate, authorizeRoles, Roles } from "../middleWare/auth.js";

const router = express.Router();

// ==============================
// PUBLIC / PLAYER ACCESS
// ==============================

// Players can view matches
router.get(
  "/",
  authenticate,
  authorizeRoles(Roles.PLAYER, Roles.LEAGUE_OWNER, Roles.OPERATOR, Roles.ADMIN),
  matchController.getAllMatches
);

router.get(
  "/:id",
  authenticate,
  authorizeRoles(Roles.PLAYER, Roles.LEAGUE_OWNER, Roles.OPERATOR, Roles.ADMIN),
  matchController.getMatch
);

router.get(
  "/league/:leagueId",
  authenticate,
  authorizeRoles(Roles.PLAYER, Roles.LEAGUE_OWNER, Roles.OPERATOR, Roles.ADMIN),
  matchController.getMatchesByLeague
);

router.get(
  "/tournament/:tournamentId",
  authenticate,
  authorizeRoles(Roles.PLAYER, Roles.LEAGUE_OWNER, Roles.OPERATOR, Roles.ADMIN),
  matchController.getMatchesByTournament
);

router.get(
  "/game/:gameId",
  authenticate,
  authorizeRoles(Roles.PLAYER, Roles.LEAGUE_OWNER, Roles.OPERATOR, Roles.ADMIN),
  matchController.getMatchesByGame
);

// League owners can manage matches
router.post(
  "/",
  authenticate,
  authorizeRoles(Roles.LEAGUE_OWNER, Roles.ADMIN),
  matchController.createMatch
);

router.put(
  "/:id",
  authenticate,
  authorizeRoles(Roles.LEAGUE_OWNER, Roles.ADMIN),
  matchController.updateMatch
);

router.delete(
  "/:id",
  authenticate,
  authorizeRoles(Roles.LEAGUE_OWNER, Roles.ADMIN),
  matchController.deleteMatch
);

router.patch(
  "/start/:id",
  authenticate,
  authorizeRoles(Roles.LEAGUE_OWNER, Roles.ADMIN),
  matchController.startMatch
);

router.patch(
  "/finish/:id",
  authenticate,
  authorizeRoles(Roles.LEAGUE_OWNER, Roles.ADMIN),
  matchController.finishMatch
);

export default router;

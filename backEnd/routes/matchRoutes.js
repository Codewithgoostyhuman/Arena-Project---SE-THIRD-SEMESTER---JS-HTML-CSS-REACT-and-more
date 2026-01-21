import express from "express";
import {
  getAllMatches,
  getMatchById,
  getMatchesByLeague,
  getMatchesByTournament,
  getMatchesByGame,
  getMyMatches,
  getMatchState,
  createMatch,
  updateMatch,
  deleteMatch,
  startMatch,
  finishMatch,
  makeMove,
  spectateMatch,
  getMatchAds
} from "../controllers/matchController.js";

import { authenticate, authorizeRoles, Roles } from "../middleware/auth.js";

const router = express.Router();

// ==============================
// PUBLIC / PLAYER ACCESS
// ==============================

router.get(
  "/",
  authenticate,
  authorizeRoles(
    Roles.PLAYER,
    Roles.LEAGUE_OWNER,
    Roles.OPERATOR,
    Roles.ADMIN
  ),
  getAllMatches
);

router.get(
  "/league/:leagueId",
  authenticate,
  authorizeRoles(
    Roles.PLAYER,
    Roles.LEAGUE_OWNER,
    Roles.OPERATOR,
    Roles.ADMIN
  ),
  getMatchesByLeague
);

router.get(
  "/tournament/:tournamentId",
  authenticate,
  authorizeRoles(
    Roles.PLAYER,
    Roles.LEAGUE_OWNER,
    Roles.OPERATOR,
    Roles.ADMIN
  ),
  getMatchesByTournament
);

router.get(
  "/game/:gameId",
  authenticate,
  authorizeRoles(
    Roles.PLAYER,
    Roles.LEAGUE_OWNER,
    Roles.OPERATOR,
    Roles.ADMIN
  ),
  getMatchesByGame
);

router.get(
  "/my-matches",
  authenticate,
  getMyMatches
);

router.get(
  "/:id/state",
  getMatchState
);

router.get(
  "/:id",
  authenticate,
  authorizeRoles(
    Roles.PLAYER,
    Roles.LEAGUE_OWNER,
    Roles.OPERATOR,
    Roles.ADMIN
  ),
  getMatchById
);

// ==============================
// LEAGUE OWNER / ADMIN ACCESS
// ==============================

router.post(
  "/",
  authenticate,
  authorizeRoles(Roles.LEAGUE_OWNER, Roles.ADMIN),
  createMatch
);

router.put(
  "/:id",
  authenticate,
  authorizeRoles(Roles.LEAGUE_OWNER, Roles.ADMIN),
  updateMatch
);

router.delete(
  "/:id",
  authenticate,
  authorizeRoles(Roles.LEAGUE_OWNER, Roles.ADMIN),
  deleteMatch
);

router.patch(
  "/:id/start",
  authenticate,
  // authorizeRoles(Roles.LEAGUE_OWNER, Roles.ADMIN),
  startMatch
);

router.patch(
  "/:id/finish",
  authenticate,
  authorizeRoles(Roles.LEAGUE_OWNER, Roles.ADMIN),
  finishMatch
);

// ==============================
// MATCH GAMEPLAY
// ==============================

router.get(
  "/:id/ads",
  // authenticate, // Ads might be public? Let's leave auth optional or required based on policy. 
  // For now, likely viewing match implies logged in based on other routes, but public spectating might exist.
  // If public spectating exists, remove auth. Let's keep it open for now or require minimal auth.
  // Actually, 'authenticate' is on other getMatch routes. Let's assume user is logged in.
  authenticate,
  getMatchAds
);

router.post(
  "/:id/move",
  authenticate,
  makeMove
);

router.post(
  "/:id/spectate",
  authenticate,
  spectateMatch
);

export default router;

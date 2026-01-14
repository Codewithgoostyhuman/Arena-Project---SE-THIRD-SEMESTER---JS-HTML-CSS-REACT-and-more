// backend/routes/playerRoutes.js - Complete version
import express from "express";
import * as playerController from "../controllers/playerController.js";
import * as playerMatchController from "../controllers/playerMatchController.js";
import { authenticate, authorizeRoles, Roles } from "../middleware/auth.js";

const router = express.Router();

// ==========================================
// LEAGUE OPERATIONS
// ==========================================

/**
 * @route   POST /api/players/league/:leagueId/apply
 * @desc    Apply to league
 * @access  Private (Player only)
 */
router.post(
  "/league/:leagueId/apply",
  authenticate,
  authorizeRoles(Roles.PLAYER),
  playerController.applyToLeague
);

/**
 * @route   GET /api/players/my-leagues
 * @desc    Get player's leagues
 * @access  Private (Player only)
 */
router.get(
  "/my-leagues",
  authenticate,
  authorizeRoles(Roles.PLAYER),
  playerController.getMyLeagues
);

/**
 * @route   POST /api/players/league/:leagueId/leave
 * @desc    Leave league
 * @access  Private (Player only)
 */
router.post(
  "/league/:leagueId/leave",
  authenticate,
  authorizeRoles(Roles.PLAYER),
  playerController.leaveLeague
);

// ==========================================
// APPLICATION OPERATIONS
// ==========================================

/**
 * @route   GET /api/players/my-applications
 * @desc    Get player's applications
 * @access  Private (Player only)
 */
router.get(
  "/my-applications",
  authenticate,
  authorizeRoles(Roles.PLAYER),
  playerController.getMyApplications
);

/**
 * @route   DELETE /api/players/league/:leagueId/application/:applicationId
 * @desc    Cancel application
 * @access  Private (Player only)
 */
router.delete(
  "/league/:leagueId/application/:applicationId",
  authenticate,
  authorizeRoles(Roles.PLAYER),
  playerController.cancelApplication
);

// ==========================================
// TOURNAMENT OPERATIONS
// ==========================================

/**
 * @route   GET /api/players/my-tournaments
 * @desc    Get player's tournaments
 * @access  Private (Player only)
 */
router.get(
  "/my-tournaments",
  authenticate,
  authorizeRoles(Roles.PLAYER),
  playerController.getMyTournaments
);

/**
 * @route   GET /api/players/active-tournaments
 * @desc    Get player's active tournaments
 * @access  Private (Player only)
 */
router.get(
  "/active-tournaments",
  authenticate,
  authorizeRoles(Roles.PLAYER),
  playerController.getActiveTournaments
);

/**
 * @route   GET /api/players/available-tournaments
 * @desc    Get available tournaments
 * @access  Private (Player only)
 */
router.get(
  "/available-tournaments",
  authenticate,
  authorizeRoles(Roles.PLAYER),
  playerController.getAvailableTournaments
);

/**
 * @route   POST /api/players/tournament/:tournamentId/apply
 * @desc    Apply to tournament
 * @access  Private (Player only)
 */
router.post(
  "/tournament/:tournamentId/apply",
  authenticate,
  authorizeRoles(Roles.PLAYER),
  playerController.applyToTournament
);

/**
 * @route   POST /api/players/tournament/:tournamentId/drop-out
 * @desc    Drop out of tournament (before it starts)
 * @access  Private (Player only)
 */
router.post(
  "/tournament/:tournamentId/drop-out",
  authenticate,
  authorizeRoles(Roles.PLAYER),
  playerController.dropOutOfTournament
);

/**
 * @route   POST /api/players/tournament/:tournamentId/forfeit
 * @desc    Forfeit tournament (during tournament)
 * @access  Private (Player only)
 */
router.post(
  "/tournament/:tournamentId/forfeit",
  authenticate,
  authorizeRoles(Roles.PLAYER),
  playerController.forfeitTournament
);

/**
 * @route   GET /api/players/tournament/:tournamentId/can-drop-out
 * @desc    Check if player can drop out
 * @access  Private (Player only)
 */
router.get(
  "/tournament/:tournamentId/can-drop-out",
  authenticate,
  authorizeRoles(Roles.PLAYER),
  playerController.canDropOut
);

// ==========================================
// MATCH OPERATIONS
// ==========================================

/**
 * @route   GET /api/players/my-matches
 * @desc    Get player's matches
 * @access  Private (Player only)
 */
router.get(
  "/my-matches",
  authenticate,
  authorizeRoles(Roles.PLAYER),
  playerMatchController.getMyMatches
);

/**
 * @route   GET /api/players/my-matches/upcoming
 * @desc    Get upcoming matches
 * @access  Private (Player only)
 */
router.get(
  "/my-matches/upcoming",
  authenticate,
  authorizeRoles(Roles.PLAYER),
  playerMatchController.getUpcomingMatches
);

/**
 * @route   GET /api/players/my-matches/live
 * @desc    Get live matches
 * @access  Private (Player only)
 */
router.get(
  "/my-matches/live",
  authenticate,
  authorizeRoles(Roles.PLAYER),
  playerMatchController.getLiveMatches
);

/**
 * @route   GET /api/players/match-schedule
 * @desc    Get match schedule
 * @access  Private (Player only)
 */
router.get(
  "/match-schedule",
  authenticate,
  authorizeRoles(Roles.PLAYER),
  playerController.getMatchSchedule
);

/**
 * @route   POST /api/players/matches/:matchId/join
 * @desc    Join/start a match
 * @access  Private (Player only)
 */
router.post(
  "/matches/:matchId/join",
  authenticate,
  authorizeRoles(Roles.PLAYER),
  playerMatchController.joinMatch
);

/**
 * @route   POST /api/players/matches/:matchId/move
 * @desc    Make a move in a match
 * @access  Private (Player only)
 */
router.post(
  "/matches/:matchId/move",
  authenticate,
  authorizeRoles(Roles.PLAYER),
  playerMatchController.makeMove
);

/**
 * @route   GET /api/players/matches/:matchId/state
 * @desc    Get current match state
 * @access  Private (Player only)
 */
router.get(
  "/matches/:matchId/state",
  authenticate,
  authorizeRoles(Roles.PLAYER),
  playerMatchController.getMatchState
);

/**
 * @route   POST /api/players/matches/:matchId/forfeit
 * @desc    Forfeit a match
 * @access  Private (Player only)
 */
router.post(
  "/matches/:matchId/forfeit",
  authenticate,
  authorizeRoles(Roles.PLAYER),
  playerMatchController.forfeitMatch
);

/**
 * @route   GET /api/players/match-history
 * @desc    Get match history
 * @access  Private (Player only)
 */
router.get(
  "/match-history",
  authenticate,
  authorizeRoles(Roles.PLAYER),
  playerMatchController.getMatchHistory
);

// ==========================================
// STATISTICS
// ==========================================

/**
 * @route   GET /api/players/stats
 * @desc    Get player statistics
 * @access  Private (Player only)
 */
router.get(
  "/stats",
  authenticate,
  authorizeRoles(Roles.PLAYER),
  playerController.getStats
);

export default router;
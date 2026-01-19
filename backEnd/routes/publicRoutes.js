// backend/routes/publicRoutes.js
import express from "express";
import * as publicController from "../controllers/publicController.js";


const router = express.Router();

// ==========================================
// PUBLIC TOURNAMENT ENDPOINTS (No Auth)
// ==========================================

/**
 * @route   GET /api/public/tournaments
 * @desc    Browse all tournaments
 * @access  Public
 */
router.get("/tournaments", publicController.getAllTournaments);

/**
 * @route   GET /api/public/tournaments/:id
 * @desc    Get tournament details
 * @access  Public
 */
router.get("/tournaments/:id", publicController.getTournamentDetails);

/**
 * @route   GET /api/public/tournaments/live
 * @desc    Get live/ongoing tournaments
 * @access  Public
 */
router.get("/tournaments/live", publicController.getLiveTournaments);

/**
 * @route   GET /api/public/tournaments/upcoming
 * @desc    Get upcoming tournaments
 * @access  Public
 */
router.get("/tournaments/upcoming", publicController.getUpcomingTournaments);

/**
 * @route   GET /api/public/tournaments/:id/leaderboard
 * @desc    Get tournament leaderboard
 * @access  Public
 */
router.get("/tournaments/:id/leaderboard", publicController.getTournamentLeaderboard);

// ==========================================
// PUBLIC MATCH ENDPOINTS (No Auth)
// ==========================================

/**
 * @route   GET /api/public/matches/live
 * @desc    Get all live matches
 * @access  Public
 */
router.get("/matches/live", publicController.getLiveMatches);

/**
 * @route   GET /api/public/matches/:id
 * @desc    Get match details
 * @access  Public
 */
router.get("/matches/:id", publicController.getMatchDetails);

/**
 * @route   GET /api/public/matches/:id/state
 * @desc    Get current match state (for live viewing)
 * @access  Public
 */
router.get("/matches/:id/state", publicController.getMatchState);

/**
 * @route   GET /api/public/matches/:id/replay
 * @desc    Get match replay data
 * @access  Public
 */
router.get("/matches/:id/replay", publicController.getMatchReplay);

// ==========================================
// PUBLIC PLAYER ENDPOINTS (No Auth)
// ==========================================

/**
 * @route   GET /api/public/players/:id
 * @desc    Get player public profile
 * @access  Public
 */
router.get("/players/:id", publicController.getPlayerProfile);

/**
 * @route   GET /api/public/players/:id/stats
 * @desc    Get player statistics
 * @access  Public
 */
router.get("/players/:id/stats", publicController.getPlayerStats);

/**
 * @route   GET /api/public/players/:id/matches
 * @desc    Get player's match history
 * @access  Public
 */
router.get("/players/:id/matches", publicController.getPlayerMatches);

// ==========================================
// PUBLIC LEAGUE ENDPOINTS (No Auth)
// ==========================================

/**
 * @route   GET /api/public/leagues
 * @desc    Browse all leagues
 * @access  Public
 */
router.get("/leagues", publicController.getAllLeagues);

/**
 * @route   GET /api/public/leagues/:id
 * @desc    Get league details
 * @access  Public
 */
router.get("/leagues/:id", publicController.getLeagueDetails);

/**
 * @route   GET /api/public/leagues/:id/leaderboard
 * @desc    Get league leaderboard
 * @access  Public
 */
router.get("/leagues/:id/leaderboard", publicController.getLeagueLeaderboard);

/**
 * @route   GET /api/public/leagues/:id/tournaments
 * @desc    Get league tournaments
 * @access  Public
 */
router.get("/leagues/:id/tournaments", publicController.getLeagueTournaments);

// ==========================================
// PUBLIC GAME ENDPOINTS (No Auth)
// ==========================================

/**
 * @route   GET /api/public/games
 * @desc    Get all games
 * @access  Public
 */
router.get("/games", publicController.getAllGames);

/**
 * @route   GET /api/public/games/:id
 * @desc    Get game details
 * @access  Public
 */
router.get("/games/:id", publicController.getGameDetails);

// ==========================================
// PUBLIC SEARCH & FILTER (No Auth)
// ==========================================

/**
 * @route   GET /api/public/search
 * @desc    Search tournaments, players, leagues
 * @access  Public
 */
router.get("/search", publicController.search);

export default router;
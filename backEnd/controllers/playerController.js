// backend/controllers/playerController.js - Complete version
import PlayerService from "../services/playerService.js";

// ==================== LEAGUE OPERATIONS ====================

/**
 * Apply to league
 * POST /api/players/league/:leagueId/apply
 */
export const applyToLeague = async (req, res) => {
  try {
    await PlayerService.applyToLeague(req.user._id, req.params.leagueId);
    res.json({ message: "Application submitted successfully" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * Get player's leagues
 * GET /api/players/my-leagues
 */
export const getMyLeagues = async (req, res) => {
  try {
    const leagues = await PlayerService.getMyLeagues(req.user._id);
    res.json(leagues);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * Leave league
 * POST /api/players/league/:leagueId/leave
 */
export const leaveLeague = async (req, res) => {
  try {
    await PlayerService.leaveLeague(req.user._id, req.params.leagueId);
    res.json({ message: "Successfully left the league" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ==================== APPLICATION OPERATIONS ====================

/**
 * Get player's applications
 * GET /api/players/my-applications
 */
export const getMyApplications = async (req, res) => {
  try {
    const applications = await PlayerService.getMyApplications(req.user._id);
    res.json(applications);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * Cancel application
 * DELETE /api/players/league/:leagueId/application/:applicationId
 */
export const cancelApplication = async (req, res) => {
  try {
    await PlayerService.cancelApplication(
      req.user._id,
      req.params.leagueId,
      req.params.applicationId
    );
    res.json({ message: "Application cancelled successfully" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ==================== TOURNAMENT OPERATIONS ====================

/**
 * Get player's tournaments
 * GET /api/players/my-tournaments
 */
export const getMyTournaments = async (req, res) => {
  try {
    const tournaments = await PlayerService.getMyTournaments(req.user._id);
    res.json(tournaments);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * Get active tournaments
 * GET /api/players/active-tournaments
 */
export const getActiveTournaments = async (req, res) => {
  try {
    const tournaments = await PlayerService.getActiveTournaments(req.user._id);
    res.json(tournaments);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * Apply to tournament
 * POST /api/players/tournament/:tournamentId/apply
 */
export const applyToTournament = async (req, res) => {
  try {
    await PlayerService.applyToTournament(req.user._id, req.params.tournamentId);
    res.json({ message: "Successfully joined tournament" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * Get available tournaments
 * GET /api/players/available-tournaments
 */
export const getAvailableTournaments = async (req, res) => {
  try {
    const tournaments = await PlayerService.getAvailableTournaments(req.user._id);
    res.json(tournaments);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * DROP OUT of tournament (before it starts)
 * POST /api/players/tournament/:tournamentId/drop-out
 */
export const dropOutOfTournament = async (req, res) => {
  try {
    const result = await PlayerService.dropOutOfTournament(
      req.user._id,
      req.params.tournamentId
    );
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * FORFEIT tournament (during tournament)
 * POST /api/players/tournament/:tournamentId/forfeit
 */
export const forfeitTournament = async (req, res) => {
  try {
    const result = await PlayerService.forfeitTournament(
      req.user._id,
      req.params.tournamentId
    );
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * Check if can drop out
 * GET /api/players/tournament/:tournamentId/can-drop-out
 */
export const canDropOut = async (req, res) => {
  try {
    const result = await PlayerService.canDropOut(
      req.user._id,
      req.params.tournamentId
    );
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ==================== MATCH OPERATIONS ====================

/**
 * Get player's match schedule
 * GET /api/players/match-schedule
 */
export const getMatchSchedule = async (req, res) => {
  try {
    const schedule = await PlayerService.getMatchSchedule(req.user._id);
    res.json(schedule);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ==================== STATISTICS ====================

/**
 * Get player statistics
 * GET /api/players/stats
 */
export const getStats = async (req, res) => {
  try {
    const stats = await PlayerService.getStats(req.user._id);
    res.json(stats);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
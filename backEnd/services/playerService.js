// backend/services/playerService.js
import Player from "../domains/Player.js";

export default class PlayerService {
  /**
   * Apply to league
   */
  static async applyToLeague(playerId, leagueId) {
    return await Player.applyToLeague(playerId, leagueId);
  }

  /**
   * Get player's leagues
   */
  static async getMyLeagues(playerId) {
    return await Player.getMyLeagues(playerId);
  }

  /**
   * Get player's applications
   */
  static async getMyApplications(playerId) {
    return await Player.getMyApplications(playerId);
  }

  /**
   * Get player's tournaments
   */
  static async getMyTournaments(playerId) {
    return await Player.getMyTournaments(playerId);
  }

  /**
   * Apply to tournament
   */
  static async applyToTournament(playerId, tournamentId) {
    return await Player.applyToTournament(playerId, tournamentId);
  }

  /**
   * Get available tournaments for player
   */
  static async getAvailableTournaments(playerId) {
    return await Player.getAvailableTournaments(playerId);
  }

  /**
   * Get player stats
   */
  static async getStats(playerId) {
    return await Player.getStats(playerId);
  }

  /**
   * Leave league
   */
  static async leaveLeague(playerId, leagueId) {
    return await Player.leaveLeague(playerId, leagueId);
  }

  /**
   * Cancel application
   */
  static async cancelApplication(playerId, leagueId, applicationId) {
    return await Player.cancelApplication(playerId, leagueId, applicationId);
  }

  /**
   * Record match result (internal use)
   */
  static async recordMatchResult(playerId, matchResult, points = 0) {
    return await Player.recordMatchResult(playerId, matchResult, points);
  }
  /**
   * Drop out of tournament (before it starts)
   */
  static async dropOutOfTournament(playerId, tournamentId) {
    return await Player.dropOutOfTournament(playerId, tournamentId);
  }

  /**
   * Forfeit tournament (during tournament)
   */
  static async forfeitTournament(playerId, tournamentId) {
    return await Player.forfeitTournament(playerId, tournamentId);
  }

  /**
   * Check if player can drop out
   */
  static async canDropOut(playerId, tournamentId) {
    return await Player.canDropOut(playerId, tournamentId);
  }

  /**
   * Get player's active tournaments
   */
  static async getActiveTournaments(playerId) {
    return await Player.getActiveTournaments(playerId);
  }

  /**
   * Get player's match schedule
   */
  static async getMatchSchedule(playerId) {
    return await Player.getMatchSchedule(playerId);
  }

  /**
   * Apply to league
   */
  static async applyToLeague(playerId, leagueId) {
    return await Player.applyToLeague(playerId, leagueId);
  }

  /**
   * Get player's leagues
   */
  static async getMyLeagues(playerId) {
    return await Player.getMyLeagues(playerId);
  }

  /**
   * Get player's applications
   */
  static async getMyApplications(playerId) {
    return await Player.getMyApplications(playerId);
  }

  /**
   * Get player's tournaments
   */
  static async getMyTournaments(playerId) {
    return await Player.getMyTournaments(playerId);
  }

  /**
   * Apply to tournament
   */
  static async applyToTournament(playerId, tournamentId) {
    return await Player.applyToTournament(playerId, tournamentId);
  }

  /**
   * Get available tournaments for player
   */
  static async getAvailableTournaments(playerId) {
    return await Player.getAvailableTournaments(playerId);
  }

  /**
   * Get player stats
   */
  static async getStats(playerId) {
    return await Player.getStats(playerId);
  }

  /**
   * Leave league
   */
  static async leaveLeague(playerId, leagueId) {
    return await Player.leaveLeague(playerId, leagueId);
  }

  /**
   * Cancel application
   */
  static async cancelApplication(playerId, leagueId, applicationId) {
    return await Player.cancelApplication(playerId, leagueId, applicationId);
  }

  /**
   * Record match result (internal use)
   */
  static async recordMatchResult(playerId, matchResult, points = 0) {
    return await Player.recordMatchResult(playerId, matchResult, points);
  }
}
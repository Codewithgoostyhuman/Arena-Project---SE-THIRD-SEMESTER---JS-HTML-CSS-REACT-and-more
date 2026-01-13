// backend/services/operatorService.js
import Operator from "../domains/Operator.js";

export default class OperatorService {
  // ==================== USER MANAGEMENT ====================

  /**
   * Get all users with optional filters
   */
  static async getAllUsers(role = null, status = null) {
    return await Operator.getAllUsers(role, status);
  }

  /**
   * Get user by ID
   */
  static async getUserById(id) {
    return await Operator.getUserById(id);
  }

  /**
   * Update user
   */
  static async updateUser(id, data) {
    return await Operator.updateUser(id, data);
  }

  /**
   * Delete user
   */
  static async deleteUser(id) {
    return await Operator.deleteUser(id);
  }

  /**
   * Activate user by ID
   */
  static async activateUserById(id) {
    return await Operator.activateUserById(id);
  }

  /**
   * Deactivate user by ID
   */
  static async deactivateUserById(id) {
    return await Operator.deactivateUserById(id);
  }

  /**
   * Activate user by name
   */
  static async activateUserByName(name) {
    return await Operator.activateUserByName(name);
  }

  /**
   * Change user role
   */
  static async changeUserRole(id, newRole) {
    return await Operator.changeUserRole(id, newRole);
  }

  /**
   * Get pending users (awaiting approval)
   */
  static async getPendingUsers() {
    return await Operator.getAllUsers(null, "pending");
  }

  /**
   * Approve user registration
   */
  static async approveUser(id) {
    return await Operator.activateUserById(id);
  }

  /**
   * Reject user registration
   */
  static async rejectUser(id) {
    const User = (await import("../schemas/UserSchema.js")).default;
    const user = await User.findByIdAndUpdate(
      id,
      { status: "rejected" },
      { new: true }
    ).select("-password");

    if (!user) throw new Error("User not found");
    return user;
  }

  /**
   * Bulk approve users
   */
  static async bulkApproveUsers(userIds) {
    const User = (await import("../schemas/UserSchema.js")).default;
    const result = await User.updateMany(
      { _id: { $in: userIds }, status: "pending" },
      { status: "active" }
    );

    return {
      message: `${result.modifiedCount} users approved`,
      count: result.modifiedCount
    };
  }

  // ==================== GAME MANAGEMENT ====================

  static async createGame(data) {
    return await OperatorDomain.createGame(data);
  }

  static async updateGame(id, data) {
    return await OperatorDomain.updateGame(id, data);
  }

  static async deleteGame(id) {
    return await OperatorDomain.deleteGame(id);
  }

  static async getGameById(id) {
    return await OperatorDomain.getGameById(id);
  }

  static async getAllGames() {
    return await OperatorDomain.getAllGames();
  }

  // ==================== RATING FORMULA MANAGEMENT ====================

  static async createRatingFormula(data) {
    return await OperatorDomain.createRatingFormula(data);
  }

  static async updateRatingFormula(id, data) {
    return await OperatorDomain.updateRatingFormula(id, data);
  }

  static async deleteRatingFormula(id) {
    return await OperatorDomain.deleteRatingFormula(id);
  }

  static async getRatingFormulaById(id) {
    return await OperatorDomain.getRatingFormulaById(id);
  }

  static async getAllRatingFormulas() {
    return await OperatorDomain.getAllRatingFormulas();
  }

  // ==================== ADVERTISER MANAGEMENT ====================

  static async approveAdvertiser(id) {
    return await OperatorDomain.approveAdvertiser(id);
  }

  static async rejectAdvertiser(id) {
    return await OperatorDomain.rejectAdvertiser(id);
  }

  static async getPendingAdvertisers() {
    return await OperatorDomain.getPendingAdvertisers();
  }

  // ==================== STATISTICS ====================

  static async getSystemStatistics() {
    return await OperatorDomain.getSystemStatistics();
  }

  /**
   * Get detailed dashboard statistics
   */
  static async getDashboardStats() {
    const stats = await OperatorDomain.getSystemStatistics();

    // Add additional stats
    const Game = (await import("../schemas/GameSchema.js")).default;
    const League = (await import("../schemas/LeagueSchema.js")).default;
    const Tournament = (await import("../schemas/TournamentSchema.js")).default;
    const Match = (await import("../schemas/MatchSchema.js")).default;

    const gameCount = await Game.countDocuments();
    const leagueCount = await League.countDocuments();
    const tournamentCount = await Tournament.countDocuments();
    const matchCount = await Match.countDocuments();

    const activeTournaments = await Tournament.countDocuments({ 
      status: { $in: ["ongoing", "upcoming", "open_for_applications"] }
    });

    const livMatches = await Match.countDocuments({ status: "live" });

    return {
      ...stats,
      games: {
        total: gameCount,
        active: await Game.countDocuments({ status: "active" })
      },
      leagues: {
        total: leagueCount,
        active: await League.countDocuments({ status: "active" })
      },
      tournaments: {
        total: tournamentCount,
        active: activeTournaments,
        finished: await Tournament.countDocuments({ status: "finished" })
      },
      matches: {
        total: matchCount,
        live: liveMatches,
        finished: await Match.countDocuments({ status: "finished" })
      }
    };
  }
}
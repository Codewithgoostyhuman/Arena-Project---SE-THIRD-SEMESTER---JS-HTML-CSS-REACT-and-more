import GameDomain from "../domains/Game.js";
import Game from "../schemas/GameSchema.js";

export default class GameService {
  /**
   * Create a new game
   * @param {Object} gameData - Game information
   * @returns {Object} - Created game
   */
  static async createGame(gameData) {
    const { name, type, description, minPlayers, maxPlayers, rules } = gameData;

    // Validate player count
    if (minPlayers && maxPlayers && minPlayers > maxPlayers) {
      throw new Error("Minimum players cannot be greater than maximum players");
    }

    if (minPlayers && minPlayers < 1) {
      throw new Error("Minimum players must be at least 1");
    }

    if (maxPlayers && maxPlayers < 1) {
      throw new Error("Maximum players must be at least 1");
    }

    // Create game using domain
    const game = new GameDomain(name, type, description);
    game.minPlayers = minPlayers || 2;
    game.maxPlayers = maxPlayers || 2;
    game.rules = rules || "";

    return await game.create();
  }

  /**
   * Get all games
   * @returns {Array} - List of all games
   */
  static async getAllGames() {
    return await GameDomain.getAll();
  }

  /**
   * Get game by ID
   * @param {string} id - Game ID
   * @returns {Object} - Game object
   */
  static async getGameById(id) {
    return await GameDomain.getById(id);
  }

  /**
   * Update game
   * @param {string} id - Game ID
   * @param {Object} data - Update data
   * @returns {Object} - Updated game
   */
  static async updateGame(id, data) {
    // Validate player count if provided
    if (data.minPlayers && data.maxPlayers && data.minPlayers > data.maxPlayers) {
      throw new Error("Minimum players cannot be greater than maximum players");
    }

    return await GameDomain.update(id, data);
  }

  /**
   * Delete game
   * @param {string} id - Game ID
   * @returns {Object} - Deleted game
   */
  static async deleteGame(id) {
    return await GameDomain.delete(id);
  }

  /**
   * Activate/Deactivate game
   * @param {string} id - Game ID
   * @param {string} status - 'active' or 'inactive'
   * @returns {Object} - Updated game
   */
  static async setGameStatus(id, status) {
    if (!["active", "inactive"].includes(status)) {
      throw new Error("Status must be 'active' or 'inactive'");
    }

    return await GameDomain.update(id, { status });
  }

  /**
   * Get active games only
   * @returns {Array} - List of active games
   */
  static async getActiveGames() {
    const allGames = await GameDomain.getAll();
    return allGames.filter(game => game.status === "active");
  }
}
// backend/services/ratingFormulaService.js
import RatingFormula from "../schemas/RatingFormulaSchema.js";

class RatingFormulaService {
  /**
   * Create a new rating formula
   */
  async createFormula(data) {
    const { name, description, winnerScore, loserScore, drawScore, isDefault } = data;

    // Validate scores are not negative
    if (winnerScore < 0 || loserScore < 0 || drawScore < 0) {
      throw new Error("Scores cannot be negative");
    }

    // If setting as default, unset other defaults first
    if (isDefault) {
      await this.unsetAllDefaults();
    }

    const formula = new RatingFormula({
      name,
      description,
      winnerScore,
      loserScore,
      drawScore,
      isDefault: isDefault || false,
      status: "active"
    });

    await formula.save();
    return formula;
  }

  /**
   * Get formula by ID
   */
  async getById(id) {
    const formula = await RatingFormula.findById(id);
    if (!formula) throw new Error("Rating formula not found");
    return formula;
  }

  /**
   * Get all formulas
   */
  async getAll() {
    return await RatingFormula.find().sort({ createdAt: -1 });
  }

  /**
   * Update formula
   */
  async update(id, data) {
    // Validate scores if provided
    if (data.winnerScore !== undefined && data.winnerScore < 0) {
      throw new Error("Winner score cannot be negative");
    }
    if (data.loserScore !== undefined && data.loserScore < 0) {
      throw new Error("Loser score cannot be negative");
    }
    if (data.drawScore !== undefined && data.drawScore < 0) {
      throw new Error("Draw score cannot be negative");
    }

    // If setting as default, unset other defaults first
    if (data.isDefault === true) {
      await this.unsetAllDefaults();
    }

    const formula = await RatingFormula.findByIdAndUpdate(id, data, { 
      new: true,
      runValidators: true 
    });

    if (!formula) throw new Error("Rating formula not found");
    return formula;
  }

  /**
   * Delete formula
   */
  async delete(id) {
    const formula = await RatingFormula.findByIdAndDelete(id);
    if (!formula) throw new Error("Rating formula not found");
    return formula;
  }

  /**
   * Get default formula
   */
  async getDefault() {
    const formula = await RatingFormula.findOne({ isDefault: true, status: "active" });
    if (!formula) {
      // If no default exists, return a standard formula
      return {
        name: "Standard",
        winnerScore: 3,
        loserScore: 0,
        drawScore: 1
      };
    }
    return formula;
  }

  /**
   * Unset all defaults (helper method)
   */
  async unsetAllDefaults() {
    await RatingFormula.updateMany(
      { isDefault: true },
      { isDefault: false }
    );
  }

  /**
   * Apply rating formula to match result
   * @param {string} formulaId - Rating formula ID
   * @param {string} result - "win", "loss", or "draw"
   * @returns {number} - Points to award
   */
  async applyFormula(formulaId, result) {
    const formula = await this.getById(formulaId);

    switch (result.toLowerCase()) {
      case "win":
        return formula.winnerScore;
      case "loss":
        return formula.loserScore;
      case "draw":
        return formula.drawScore;
      default:
        throw new Error("Invalid result type");
    }
  }

  /**
   * Calculate points for all players in a match
   * @param {string} formulaId - Rating formula ID
   * @param {Object} matchResult - { winner: playerId, loser: playerId, isDraw: boolean }
   * @returns {Object} - Points for each player
   */
  async calculateMatchPoints(formulaId, matchResult) {
    const formula = await this.getById(formulaId);
    const points = {};

    if (matchResult.isDraw) {
      // Both players get draw score
      matchResult.players.forEach(playerId => {
        points[playerId] = formula.drawScore;
      });
    } else {
      // Winner gets winner score, loser gets loser score
      points[matchResult.winner] = formula.winnerScore;
      points[matchResult.loser] = formula.loserScore;
    }

    return points;
  }

  /**
   * Get active formulas only
   */
  async getActiveFormulas() {
    return await RatingFormula.find({ status: "active" }).sort({ createdAt: -1 });
  }

  /**
   * Set formula as default
   */
  async setAsDefault(id) {
    // Unset all defaults first
    await this.unsetAllDefaults();

    // Set this formula as default
    const formula = await RatingFormula.findByIdAndUpdate(
      id,
      { isDefault: true },
      { new: true }
    );

    if (!formula) throw new Error("Rating formula not found");
    return formula;
  }
}

export default new RatingFormulaService();
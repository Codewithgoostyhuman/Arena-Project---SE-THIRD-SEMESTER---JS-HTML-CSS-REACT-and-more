// backend/services/tournamentStyleService.js
import TournamentStyleDomain from "../domains/TournamentStyle.js";

class TournamentStyleService {
  /**
   * Create a new tournament style
   */
  async createStyle(data) {
    const { name, description, isDefault, status } = data;

    // If this is set as default, unset other defaults first
    if (isDefault) {
      await this.unsetAllDefaults();
    }

    const styleDomain = new TournamentStyleDomain(name, description, isDefault, status);
    return await styleDomain.create();
  }

  /**
   * Get tournament style by ID
   */
  async getStyleById(id) {
    const style = await TournamentStyleDomain.getById(id);
    if (!style) throw new Error("Tournament style not found");
    return style;
  }

  /**
   * Get all tournament styles
   */
  async getAllStyles() {
    return await TournamentStyleDomain.getAll();
  }

  /**
   * Get default tournament style
   */
  async getDefaultStyle() {
    const style = await TournamentStyleDomain.getDefault();
    if (!style) throw new Error("Default tournament style not found");
    return style;
  }

  /**
   * Update tournament style
   */
  async updateStyle(id, data) {
    // If setting as default, unset other defaults first
    if (data.isDefault === true) {
      await this.unsetAllDefaults();
    }

    const style = await TournamentStyleDomain.update(id, data);
    if (!style) throw new Error("Tournament style not found");
    return style;
  }

  /**
   * Delete tournament style
   */
  async deleteStyle(id) {
    const style = await TournamentStyleDomain.delete(id);
    if (!style) throw new Error("Tournament style not found");
    return style;
  }

  /**
   * Unset all defaults (helper method)
   */
  async unsetAllDefaults() {
    const TournamentStyle = (await import("../schemas/TournamentStyle.js")).default;
    await TournamentStyle.updateMany(
      { isDefault: true },
      { isDefault: false }
    );
  }

  /**
   * Generate match schedule based on tournament style
   * @param {string} styleName - Style name (RoundRobin, SingleElimination, etc.)
   * @param {Array} players - Array of player IDs
   * @returns {Array} - Array of match objects
   */
  async generateMatches(styleName, players) {
    if (!players || players.length < 2) {
      throw new Error("At least 2 players are required");
    }

    switch (styleName) {
      case "RoundRobin":
        return this.generateRoundRobinMatches(players);
      
      case "DoubleRoundRobin":
        return this.generateDoubleRoundRobinMatches(players);
      
      case "SingleElimination":
        return this.generateSingleEliminationMatches(players);
      
      default:
        throw new Error(`Unknown tournament style: ${styleName}`);
    }
  }

  /**
   * Generate Round Robin matches (everyone plays everyone once)
   */
  generateRoundRobinMatches(players) {
    const matches = [];
    let matchNumber = 1;

    for (let i = 0; i < players.length; i++) {
      for (let j = i + 1; j < players.length; j++) {
        matches.push({
          matchNumber,
          round: Math.ceil(matchNumber / (players.length / 2)),
          players: [players[i], players[j]],
          status: "upcoming"
        });
        matchNumber++;
      }
    }

    return matches;
  }

  /**
   * Generate Double Round Robin matches (everyone plays everyone twice)
   */
  generateDoubleRoundRobinMatches(players) {
    const firstRound = this.generateRoundRobinMatches(players);
    const secondRound = this.generateRoundRobinMatches(players);

    // Adjust match numbers for second round
    const totalFirstRound = firstRound.length;
    const adjustedSecondRound = secondRound.map((match, index) => ({
      ...match,
      matchNumber: totalFirstRound + index + 1,
      round: match.round + Math.max(...firstRound.map(m => m.round))
    }));

    return [...firstRound, ...adjustedSecondRound];
  }

  /**
   * Generate Single Elimination (knockout) matches
   */
  generateSingleEliminationMatches(players) {
    const matches = [];
    const numPlayers = players.length;

    // Calculate number of rounds needed
    const numRounds = Math.ceil(Math.log2(numPlayers));

    // For single elimination, we need power of 2 players
    // If not, some players get byes in first round
    const firstRoundPlayers = Math.pow(2, numRounds);
    const byes = firstRoundPlayers - numPlayers;

    let currentRoundPlayers = [...players];
    let matchNumber = 1;
    let round = 1;

    // Generate first round (may have byes)
    const firstRoundMatches = Math.floor((numPlayers - byes) / 2);
    
    for (let i = 0; i < firstRoundMatches; i++) {
      matches.push({
        matchNumber: matchNumber++,
        round: round,
        players: [currentRoundPlayers[i * 2], currentRoundPlayers[i * 2 + 1]],
        status: "upcoming"
      });
    }

    // Players with byes advance automatically
    const advancingPlayers = firstRoundMatches + byes;

    // Generate subsequent rounds (placeholders - will be filled as tournament progresses)
    round++;
    let remainingPlayers = advancingPlayers;

    while (remainingPlayers > 1) {
      const matchesInRound = Math.floor(remainingPlayers / 2);
      
      for (let i = 0; i < matchesInRound; i++) {
        matches.push({
          matchNumber: matchNumber++,
          round: round,
          players: [], // Will be filled with winners from previous round
          status: "upcoming",
          dependsOn: [] // Track which matches feed into this one
        });
      }

      remainingPlayers = matchesInRound;
      round++;
    }

    return matches;
  }

  /**
   * Validate if players count is suitable for the style
   */
  validatePlayerCount(styleName, playerCount) {
    switch (styleName) {
      case "RoundRobin":
      case "DoubleRoundRobin":
        return playerCount >= 2;
      
      case "SingleElimination":
        // Works with any number >= 2, but power of 2 is ideal
        return playerCount >= 2;
      
      default:
        return false;
    }
  }
}

export default new TournamentStyleService();
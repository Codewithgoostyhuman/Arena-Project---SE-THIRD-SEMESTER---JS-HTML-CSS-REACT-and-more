import MatchModel from "../schemas/MatchSchema.js";

export default class Match {
  constructor() {}

  async createMatch(data) {
    try {
      const newMatch = new MatchModel(data);
      return await newMatch.save();
    } catch (err) {
      throw new Error(`Error creating match: ${err.message}`);
    }
  }

  async updateMatch(id, data) {
    try {
      const updatedMatch = await MatchModel.findByIdAndUpdate(id, data, { new: true });
      if (!updatedMatch) throw new Error("Match not found");
      return updatedMatch;
    } catch (err) {
      throw new Error(`Error updating match: ${err.message}`);
    }
  }

  async deleteMatch(id) {
    try {
      const deletedMatch = await MatchModel.findByIdAndDelete(id);
      if (!deletedMatch) throw new Error("Match not found");
      return deletedMatch;
    } catch (err) {
      throw new Error(`Error deleting match: ${err.message}`);
    }
  }

  async getMatchById(id) {
    try {
      const match = await MatchModel.findById(id)
        .populate("league")
        .populate("tournament")
        .populate("players")
        .populate("game");
      if (!match) throw new Error("Match not found");
      return match;
    } catch (err) {
      throw new Error(`Error fetching match: ${err.message}`);
    }
  }

  async getAllMatches() {
    try {
      return await MatchModel.find()
        .populate("league")
        .populate("tournament")
        .populate("players")
        .populate("game");
    } catch (err) {
      throw new Error(`Error fetching matches: ${err.message}`);
    }
  }

  async getMatchesByLeague(leagueId) {
    return await MatchModel.find({ league: leagueId })
      .populate("tournament")
      .populate("players")
      .populate("game");
  }

  async getMatchesByTournament(tournamentId) {
    return await MatchModel.find({ tournament: tournamentId })
      .populate("league")
      .populate("players")
      .populate("game");
  }

  async getMatchesByGame(gameId) {
    return await MatchModel.find({ game: gameId })
      .populate("league")
      .populate("tournament")
      .populate("players");
  }

  async startMatch(id) {
    return await this.updateMatch(id, { status: "live", startedAt: new Date() });
  }

  async finishMatch(id, score) {
    return await this.updateMatch(id, { status: "finished", score });
  }

  async exists(id) {
    try {
      const match = await MatchModel.findById(id);
      return !!match;
    } catch {
      return false;
    }
  }
}

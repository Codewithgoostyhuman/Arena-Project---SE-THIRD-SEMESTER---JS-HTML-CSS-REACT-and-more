// backend/domains/Spectator.js
import TournamentModel from "../schemas/TournamentSchema.js";

export default class Spectator {
  // Get live matches in a tournament
  static async getLiveMatches(tournamentId) {
    const tournament = await TournamentModel.findById(tournamentId).populate("matches players");
    if (!tournament) throw new Error("Tournament not found");

    return tournament.matches.filter(m => m.status === "ongoing");
  }

  // Get completed matches & stats
  static async getTournamentStats(tournamentId) {
    const tournament = await TournamentModel.findById(tournamentId)
      .populate("matches players winner");
    if (!tournament) throw new Error("Tournament not found");

    const stats = tournament.players.map(p => {
      const wins = tournament.matches.filter(m => m.winner?.toString() === p._id.toString()).length;
      return { player: p, wins };
    });

    return { tournament, stats };
  }
}

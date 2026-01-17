import * as matchService from "../services/matchService.js";
import League from "../schemas/LeagueSchema.js";

// Utility to check if the user owns the league or is admin
const verifyLeagueOwnership = async (userId, matchId) => {
  const match = await matchService.getMatchById(matchId);
  if (!match) throw new Error("Match not found");

  const league = await League.findById(match.league);
  if (!league) throw new Error("League not found");

  // Only owner or admin can manage
  if (league.owner.toString() !== userId.toString()) {
    throw new Error("You are not the owner of this league");
  }
  return true;
};

// ==============================
// PUBLIC / PLAYER ACCESS
// ==============================

export const getAllMatches = async (req, res) => {
  try {
    const matches = await matchService.getAllMatches();
    res.json(matches);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getMatch = async (req, res) => {
  try {
    const match = await matchService.getMatchById(req.params.id);
    res.json(match);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};

export const getMatchesByLeague = async (req, res) => {
  try {
    const matches = await matchService.getMatchesByLeague(req.params.leagueId);
    res.json(matches);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};

export const getMatchesByTournament = async (req, res) => {
  try {
    const matches = await matchService.getMatchesByTournament(req.params.tournamentId);
    res.json(matches);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};

export const getMatchesByGame = async (req, res) => {
  try {
    const matches = await matchService.getMatchesByGame(req.params.gameId);
    res.json(matches);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};

// ==============================
// LEAGUE OWNER / ADMIN ACCESS
// ==============================

export const createMatch = async (req, res) => {
  try {
    const league = await League.findById(req.body.league);
    if (!league) throw new Error("League not found");

    // Only owner or admin can create
    if (league.owner.toString() !== req.user._id.toString()) {
      throw new Error("You are not the owner of this league");
    }

    const match = await matchService.createMatch(req.body);
    res.status(201).json(match);
  } catch (err) {
    res.status(403).json({ error: err.message });
  }
};

export const updateMatch = async (req, res) => {
  try {
    await verifyLeagueOwnership(req.user._id, req.params.id);
    const match = await matchService.updateMatch(req.params.id, req.body);
    res.json(match);
  } catch (err) {
    res.status(403).json({ error: err.message });
  }
};

export const deleteMatch = async (req, res) => {
  try {
    await verifyLeagueOwnership(req.user._id, req.params.id);
    const match = await matchService.deleteMatch(req.params.id);
    res.json({ message: "Match deleted", match });
  } catch (err) {
    res.status(403).json({ error: err.message });
  }
};

export const startMatch = async (req, res) => {
  try {
    await verifyLeagueOwnership(req.user._id, req.params.id);
    const match = await matchService.startMatch(req.params.id);
    res.json(match);
  } catch (err) {
    res.status(403).json({ error: err.message });
  }
};

export const finishMatch = async (req, res) => {
  try {
    await verifyLeagueOwnership(req.user._id, req.params.id);
    const match = await matchService.finishMatch(req.params.id, req.body.score);
    res.json(match);
  } catch (err) {
    res.status(403).json({ error: err.message });
  }
};

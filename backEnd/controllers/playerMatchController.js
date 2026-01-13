// backend/controllers/playerMatchController.js
import matchService from "../services/matchService.js";

/**
 * Get player's assigned matches
 * GET /api/players/my-matches
 */
export const getMyMatches = async (req, res) => {
  try {
    const matches = await matchService.getPlayerMatches(req.user._id);
    res.json(matches);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * Get upcoming matches for player
 * GET /api/players/my-matches/upcoming
 */
export const getUpcomingMatches = async (req, res) => {
  try {
    const allMatches = await matchService.getPlayerMatches(req.user._id);
    const upcoming = allMatches.filter(m => m.status === "upcoming");
    res.json(upcoming);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * Get live matches for player
 * GET /api/players/my-matches/live
 */
export const getLiveMatches = async (req, res) => {
  try {
    const allMatches = await matchService.getPlayerMatches(req.user._id);
    const live = allMatches.filter(m => m.status === "live");
    res.json(live);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * Join a match (mark player as ready)
 * POST /api/players/matches/:matchId/join
 */
export const joinMatch = async (req, res) => {
  try {
    const match = await matchService.getMatchById(req.params.matchId);

    // Verify player is part of this match
    const isPlayer = match.players.some(
      p => p._id.toString() === req.user._id.toString()
    );

    if (!isPlayer) {
      return res.status(403).json({ message: "You are not part of this match" });
    }

    if (match.status !== "upcoming" && match.status !== "live") {
      return res.status(400).json({ message: "Match has already finished" });
    }

    // If match is upcoming, start it when player joins
    if (match.status === "upcoming") {
      const result = await matchService.startMatch(req.params.matchId);
      return res.json({
        message: "Match started",
        match: result.match,
        gameState: result.gameState
      });
    }

    // If already live, just return current state
    const state = await matchService.getMatchState(req.params.matchId);
    res.json({
      message: "Match already in progress",
      ...state
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * Make a move in a match
 * POST /api/players/matches/:matchId/move
 */
export const makeMove = async (req, res) => {
  try {
    const { move } = req.body;

    if (move === undefined) {
      return res.status(400).json({ message: "Move is required" });
    }

    const result = await matchService.makeMove(
      req.params.matchId,
      req.user._id,
      move
    );

    res.json({
      message: result.isFinished ? "Match finished" : "Move made successfully",
      match: result.match,
      gameState: result.gameState,
      isFinished: result.isFinished
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * Get current match state
 * GET /api/players/matches/:matchId/state
 */
export const getMatchState = async (req, res) => {
  try {
    const state = await matchService.getMatchState(req.params.matchId);
    res.json(state);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

/**
 * Forfeit a match
 * POST /api/players/matches/:matchId/forfeit
 */
export const forfeitMatch = async (req, res) => {
  try {
    const match = await matchService.getMatchById(req.params.matchId);

    // Verify player is part of this match
    const isPlayer = match.players.some(
      p => p._id.toString() === req.user._id.toString()
    );

    if (!isPlayer) {
      return res.status(403).json({ message: "You are not part of this match" });
    }

    const result = await matchService.forfeitMatch(
      req.params.matchId,
      req.user._id
    );

    res.json({
      message: "Match forfeited. You lose.",
      match: result
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * Get match history for player
 * GET /api/players/match-history
 */
export const getMatchHistory = async (req, res) => {
  try {
    const allMatches = await matchService.getPlayerMatches(req.user._id);
    const finished = allMatches.filter(m => m.status === "finished");
    
    // Add win/loss information
    const history = finished.map(match => {
      const isWinner = match.winner && 
        match.winner.toString() === req.user._id.toString();
      const isDraw = match.isDraw;
      
      return {
        ...match.toObject(),
        result: isDraw ? "draw" : (isWinner ? "win" : "loss")
      };
    });

    res.json(history);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
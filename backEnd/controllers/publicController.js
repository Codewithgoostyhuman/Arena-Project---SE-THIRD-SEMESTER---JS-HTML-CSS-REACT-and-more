// backend/controllers/publicController.js
import Tournament from "../schemas/TournamentSchema.js";
import Match from "../schemas/MatchSchema.js";
import User from "../schemas/UserSchema.js";
import League from "../schemas/LeagueSchema.js";
import Game from "../schemas/GameSchema.js";
import matchService from "../services/matchService.js";

// ==========================================
// TOURNAMENT ENDPOINTS
// ==========================================

/**
 * Get all tournaments (with pagination and filters)
 * GET /api/public/tournaments?page=1&limit=20&status=ongoing
 */
export const getAllTournaments = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, game } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (status) query.status = status;
    if (game) {
      const league = await League.findOne({ game });
      if (league) query.league = league._id;
    }

    const tournaments = await Tournament.find(query)
      .populate("league", "name game")
      .populate({ path: "league", populate: { path: "game", select: "name type" } })
      .populate("players", "name")
      .populate("winners", "name")
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Tournament.countDocuments(query);

    res.json({
      tournaments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Get tournament details
 * GET /api/public/tournaments/:id
 */
export const getTournamentDetails = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id)
      .populate("league", "name game ratingFormula")
      .populate({ path: "league", populate: { path: "game", select: "name type description rules" } })
      .populate("players", "name stats")
      .populate("winners", "name stats")
      .populate("matches")
      .populate("exclusiveSponsor", "companyName");

    if (!tournament) {
      return res.status(404).json({ message: "Tournament not found" });
    }

    res.json(tournament);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Get live tournaments
 * GET /api/public/tournaments/live
 */
export const getLiveTournaments = async (req, res) => {
  try {
    const tournaments = await Tournament.find({ status: "ongoing" })
      .populate("league", "name game")
      .populate({ path: "league", populate: { path: "game", select: "name type" } })
      .populate("players", "name")
      .sort({ playStartDate: -1 });

    res.json(tournaments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Get upcoming tournaments
 * GET /api/public/tournaments/upcoming
 */
export const getUpcomingTournaments = async (req, res) => {
  try {
    const tournaments = await Tournament.find({ 
      status: { $in: ["open_for_applications", "upcoming"] }
    })
      .populate("league", "name game")
      .populate({ path: "league", populate: { path: "game", select: "name type" } })
      .sort({ applicationStartDate: 1 });

    res.json(tournaments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Get tournament leaderboard
 * GET /api/public/tournaments/:id/leaderboard
 */
export const getTournamentLeaderboard = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id)
      .populate("players", "name stats")
      .populate("matches");

    if (!tournament) {
      return res.status(404).json({ message: "Tournament not found" });
    }

    // Calculate standings
    const standings = tournament.players.map(player => {
      const playerMatches = tournament.matches.filter(m => 
        m.players.some(p => p.toString() === player._id.toString())
      );

      const wins = playerMatches.filter(m => 
        m.winner && m.winner.toString() === player._id.toString()
      ).length;

      const losses = playerMatches.filter(m => 
        m.winner && m.winner.toString() !== player._id.toString() && !m.isDraw
      ).length;

      const draws = playerMatches.filter(m => m.isDraw).length;

      return {
        player: {
          _id: player._id,
          name: player.name
        },
        wins,
        losses,
        draws,
        matches: playerMatches.length,
        points: wins * 3 + draws
      };
    });

    // Sort by points (descending)
    standings.sort((a, b) => b.points - a.points);

    res.json({
      tournament: {
        _id: tournament._id,
        name: tournament.name
      },
      standings
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ==========================================
// MATCH ENDPOINTS
// ==========================================

/**
 * Get all live matches
 * GET /api/public/matches/live
 */
export const getLiveMatches = async (req, res) => {
  try {
    const matches = await Match.find({ status: "live" })
      .populate("players", "name")
      .populate("winner", "name")
      .populate("currentTurn", "name")
      .populate("tournament", "name")
      .populate("league", "name")
      .populate("game", "name type")
      .sort({ startedAt: -1 });

    res.json(matches);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Get match details
 * GET /api/public/matches/:id
 */
export const getMatchDetails = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id)
      .populate("players", "name stats")
      .populate("winner", "name")
      .populate("currentTurn", "name")
      .populate("tournament", "name style")
      .populate("league", "name")
      .populate("game", "name type description rules");

    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }

    res.json(match);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Get current match state (for live viewing)
 * GET /api/public/matches/:id/state
 */
export const getMatchState = async (req, res) => {
  try {
    const state = await matchService.getMatchState(req.params.id);
    res.json(state);
  } catch (err) {
    console.error('CRITICAL Error in public getMatchState:', err);
    res.status(500).json({ 
      message: 'Error getting match state', 
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};

/**
 * Get match replay data
 * GET /api/public/matches/:id/replay
 */
export const getMatchReplay = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id)
      .populate("players", "name")
      .populate("game", "name type");

    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }

    if (match.status !== "finished") {
      return res.status(400).json({ message: "Match not finished yet" });
    }

    // Return move history for replay
    res.json({
      match: {
        _id: match._id,
        players: match.players,
        game: match.game,
        winner: match.winner,
        isDraw: match.isDraw
      },
      moves: match.moves || [],
      gameState: match.gameState
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ==========================================
// PLAYER ENDPOINTS
// ==========================================

/**
 * Get player public profile
 * GET /api/public/players/:id
 */
export const getPlayerProfile = async (req, res) => {
  try {
    const player = await User.findOne({ 
      _id: req.params.id, 
      role: "player" 
    }).select("-password");

    if (!player) {
      return res.status(404).json({ message: "Player not found" });
    }

    res.json({
      _id: player._id,
      name: player.name,
      stats: player.stats,
      createdAt: player.createdAt
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Get player statistics
 * GET /api/public/players/:id/stats
 */
export const getPlayerStats = async (req, res) => {
  try {
    const player = await User.findOne({ 
      _id: req.params.id, 
      role: "player" 
    });

    if (!player) {
      return res.status(404).json({ message: "Player not found" });
    }

    const totalMatches = await Match.countDocuments({
      players: player._id,
      status: "finished"
    });

    const winRate = player.stats.wins + player.stats.losses > 0
      ? ((player.stats.wins / (player.stats.wins + player.stats.losses)) * 100).toFixed(1)
      : 0;

    res.json({
      player: {
        _id: player._id,
        name: player.name
      },
      stats: {
        ...player.stats,
        totalMatches,
        winRate: `${winRate}%`
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Get player's match history
 * GET /api/public/players/:id/matches?page=1&limit=20
 */
export const getPlayerMatches = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const matches = await Match.find({
      players: req.params.id,
      status: "finished"
    })
      .populate("players", "name")
      .populate("tournament", "name")
      .populate("game", "name")
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Match.countDocuments({
      players: req.params.id,
      status: "finished"
    });

    res.json({
      matches,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ==========================================
// LEAGUE ENDPOINTS
// ==========================================

/**
 * Get all leagues
 * GET /api/public/leagues
 */
export const getAllLeagues = async (req, res) => {
  try {
    const leagues = await League.find({ status: "active" })
      .populate("owner", "name")
      .populate("game", "name type")
      .populate("ratingFormula", "name")
      .sort({ createdAt: -1 });

    res.json(leagues);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Get league details
 * GET /api/public/leagues/:id
 */
export const getLeagueDetails = async (req, res) => {
  try {
    const league = await League.findById(req.params.id)
      .populate("owner", "name")
      .populate("game", "name type description rules")
      .populate("ratingFormula", "name winnerScore loserScore drawScore")
      .populate("players", "name stats")
      .populate("tournaments");

    if (!league) {
      return res.status(404).json({ message: "League not found" });
    }

    res.json(league);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Get league leaderboard
 * GET /api/public/leagues/:id/leaderboard
 */
export const getLeagueLeaderboard = async (req, res) => {
  try {
    const league = await League.findById(req.params.id)
      .populate("players", "name stats");

    if (!league) {
      return res.status(404).json({ message: "League not found" });
    }

    const leaderboard = league.players
      .map(player => ({
        player: {
          _id: player._id,
          name: player.name
        },
        stats: player.stats
      }))
      .sort((a, b) => b.stats.points - a.stats.points);

    res.json({
      league: {
        _id: league._id,
        name: league.name
      },
      leaderboard
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Get league tournaments
 * GET /api/public/leagues/:id/tournaments
 */
export const getLeagueTournaments = async (req, res) => {
  try {
    const tournaments = await Tournament.find({ league: req.params.id })
      .populate("players", "name")
      .populate("winners", "name")
      .sort({ createdAt: -1 });

    res.json(tournaments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ==========================================
// GAME ENDPOINTS
// ==========================================

/**
 * Get all games
 * GET /api/public/games
 */
export const getAllGames = async (req, res) => {
  try {
    const games = await Game.find({ status: "active" })
      .sort({ name: 1 });

    res.json(games);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Get game details
 * GET /api/public/games/:id
 */
export const getGameDetails = async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);

    if (!game) {
      return res.status(404).json({ message: "Game not found" });
    }

    res.json(game);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ==========================================
// SEARCH
// ==========================================

/**
 * Search across tournaments, players, leagues
 * GET /api/public/search?q=tictactoe&type=all
 */
export const search = async (req, res) => {
  try {
    const { q, type = "all" } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({ message: "Search query must be at least 2 characters" });
    }

    const searchRegex = new RegExp(q, "i");
    const results = {};

    if (type === "all" || type === "tournaments") {
      results.tournaments = await Tournament.find({ 
        name: searchRegex 
      })
        .populate("league", "name")
        .limit(10);
    }

    if (type === "all" || type === "players") {
      results.players = await User.find({ 
        role: "player",
        name: searchRegex 
      })
        .select("name stats")
        .limit(10);
    }

    if (type === "all" || type === "leagues") {
      results.leagues = await League.find({ 
        name: searchRegex 
      })
        .populate("game", "name")
        .limit(10);
    }

    res.json(results);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
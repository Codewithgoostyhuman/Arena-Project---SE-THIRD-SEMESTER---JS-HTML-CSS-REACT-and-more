import League from "../schemas/LeagueSchema.js";
import Match from '../schemas/MatchSchema.js';
import matchGameService from "../services/matchService.js";

// Utility to check if the user owns the league or is admin
const verifyLeagueOwnership = async (userId, matchId) => {
  // Use Match model directly
  const match = await Match.findById(matchId);
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
    const { status, tournament, league } = req.query;
    const query = {};
    
    if (status) query.status = status;
    if (tournament) query.tournament = tournament;
    if (league) query.league = league;
    
    const matches = await Match.find(query)
      .populate('players', 'name')
      .populate('winner', 'name')
      .populate('game', 'name type')
      .populate('tournament', 'name')
      .populate('league', 'name')
      .populate('currentTurn', 'name') // ✅ Added: populate current turn player
      .sort({ createdAt: -1 })
      .limit(50);
    
    res.json({ matches });
    
  } catch (error) {
    console.error('Error getting matches:', error);
    res.status(500).json({ message: 'Error getting matches', error: error.message });
  }
};

export const getMatchesByLeague = async (req, res) => {
  try {
    const matches = await Match.find({ league: req.params.leagueId })
      .populate("tournament")
      .populate("players")
      .populate("game")
      .populate("currentTurn", "name"); // ✅ Added
    res.json(matches);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};

export const getMatchesByTournament = async (req, res) => {
  try {
    const matches = await Match.find({ tournament: req.params.tournamentId })
      .populate("league")
      .populate("players")
      .populate("game")
      .populate("currentTurn", "name"); // ✅ Added
    res.json(matches);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};

export const getMatchesByGame = async (req, res) => {
  try {
    const matches = await Match.find({ game: req.params.gameId })
      .populate("league")
      .populate("tournament")
      .populate("players")
      .populate("currentTurn", "name"); // ✅ Added
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

    const newMatch = new Match(req.body);
    const match = await newMatch.save();
    res.status(201).json(match);
  } catch (err) {
    res.status(403).json({ error: err.message });
  }
};

export const updateMatch = async (req, res) => {
  try {
    await verifyLeagueOwnership(req.user._id, req.params.id);
    const match = await Match.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!match) throw new Error("Match not found");
    res.json(match);
  } catch (err) {
    res.status(403).json({ error: err.message });
  }
};

export const deleteMatch = async (req, res) => {
  try {
    await verifyLeagueOwnership(req.user._id, req.params.id);
    const match = await Match.findByIdAndDelete(req.params.id);
    if (!match) throw new Error("Match not found");
    res.json({ message: "Match deleted", match });
  } catch (err) {
    res.status(403).json({ error: err.message });
  }
};

export const finishMatch = async (req, res) => {
  try {
    await verifyLeagueOwnership(req.user._id, req.params.id);
    const match = await Match.findByIdAndUpdate(
      req.params.id, 
      { status: "finished", score: req.body.score },
      { new: true }
    );
    if (!match) throw new Error("Match not found");
    res.json(match);
  } catch (err) {
    res.status(403).json({ error: err.message });
  }
};

/**
 * Start a match
 * POST /api/matches/:id/start
 */
export const startMatch = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    
    const match = await Match.findById(id)
      .populate('players')
      .populate('game');
    
    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }
    
    // Verify user is a player in this match
    const isPlayer = match.players.some(p => p._id.toString() === userId.toString());
    
    if (!isPlayer) {
      return res.status(403).json({ message: 'You are not a player in this match' });
    }
    
    const startedMatch = await matchGameService.startMatch(id);
    
    // ✅ Populate currentTurn before sending response
    await startedMatch.populate('currentTurn', 'name');
    
    res.json({
      message: 'Match started',
      match: startedMatch
    });
    
  } catch (error) {
    console.error('Error starting match:', error);
    res.status(500).json({ message: 'Error starting match', error: error.message });
  }
};

/**
 * Make a move in a match
 * POST /api/matches/:id/move
 */
export const makeMove = async (req, res) => {
  try {
    const { id } = req.params;
    const { move } = req.body;
    const userId = req.user._id;
    
    if (move === undefined || move === null) {
      return res.status(400).json({ message: 'Move is required' });
    }
    
    const result = await matchGameService.processMove(id, userId, move);
    
    // ✅ Populate currentTurn before notifying
    await result.match.populate('currentTurn', 'name');
    
    // Socket notification is handled in socketHandler.js
    if (req.io) {
      req.io.notifyMatch(id, 'move-processed', {
        playerId: userId,
        move,
        gameState: result.match.currentGameState,
        currentTurn: result.match.currentTurn // ✅ Include in socket notification
      });
    }
    
    res.json(result);
    
  } catch (error) {
    console.error('Error making move:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get match state
 * GET /api/matches/:id/state
 */
export const getMatchState = async (req, res) => {
  try {
    const { id } = req.params;
    
    const state = await matchGameService.getMatchState(id);
    
    // ✅ Note: matchGameService.getMatchState already returns populated data
    // The service handles the population internally
    
    res.json(state);
    
  } catch (error) {
    console.error('Error getting match state:', error);
    res.status(500).json({ message: 'Error getting match state', error: error.message });
  }
};

/**
 * Get match by ID with full details
 * GET /api/matches/:id
 */
export const getMatchById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const match = await Match.findById(id)
      .populate('players', 'name stats')
      .populate('winner', 'name')
      .populate('game')
      .populate('tournament', 'name style')
      .populate('league', 'name')
      .populate('currentTurn', 'name'); // ✅ Added
    
    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }
    
    res.json({ match });
    
  } catch (error) {
    console.error('Error getting match:', error);
    res.status(500).json({ message: 'Error getting match', error: error.message });
  }
};

/**
 * Get player's matches
 * GET /api/matches/my-matches
 */
export const getMyMatches = async (req, res) => {
  try {
    const userId = req.user._id;
    const { status } = req.query;
    
    const query = { players: userId };
    
    if (status) {
      query.status = status;
    }
    
    const matches = await Match.find(query)
      .populate('players', 'name')
      .populate('winner', 'name')
      .populate('game', 'name type')
      .populate('tournament', 'name')
      .populate('currentTurn', 'name') // ✅ Added
      .sort({ createdAt: -1 });
    
    res.json({ matches });
    
  } catch (error) {
    console.error('Error getting matches:', error);
    res.status(500).json({ message: 'Error getting matches', error: error.message });
  }
};

/**
 * Join match as spectator
 * POST /api/matches/:id/spectate
 */
export const spectateMatch = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    
    const match = await Match.findByIdAndUpdate(
      id,
      { $addToSet: { spectators: userId } },
      { new: true }
    )
      .populate('players', 'name')
      .populate('currentTurn', 'name'); // ✅ Added
    
    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }
    
    res.json({ message: 'Joined as spectator', match });
    
  } catch (error) {
    console.error('Error spectating match:', error);
    res.status(500).json({ message: 'Error spectating match', error: error.message });
  }
};
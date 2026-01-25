import League from "../schemas/LeagueSchema.js";
import Match from '../schemas/MatchSchema.js';
import matchGameService from "../services/matchService.js";
import mongoose from "mongoose";

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
 * Start a match (or mark player as ready)
 * POST /api/matches/:id/start
 */
export const startMatch = async (req, res) => {
  const { id } = req.params;
  const userId = req.user?._id;
  
  try {
    console.log('=== START MATCH REQUEST ===');
    console.log('Match ID:', id);
    console.log('User ID:', userId);
    
    // Validate match ID format
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid match ID format' });
    }
    
    // Find match with players
    const match = await Match.findById(id)
      .populate('players')
      .populate('game');
    
    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }

    // Check if user is a player
    const isPlayer = match.players.some(p => p._id.toString() === userId.toString());
    if (!isPlayer) {
      return res.status(403).json({ message: 'You are not a player in this match' });
    }
    
    // If match already live, just return it
    if (match.status === 'live') {
      const liveState = await matchGameService.getMatchState(id);
       // Ensure everyone is in sync
      if (req.io) {
        req.io.notifyMatch(id, 'match-state', liveState);
      }
      return res.json({ message: 'Match is already live', match: liveState });
    }
    
    // Add player to playersReady if not present
    // Use findByIdAndUpdate to ensure atomicity
    const updatedMatch = await Match.findByIdAndUpdate(
      id,
      { $addToSet: { playersReady: userId } },
      { new: true }
    ).populate('players').populate('game');
    
    const readyCount = updatedMatch.playersReady.length;
    const totalPlayers = updatedMatch.players.length;
    
    console.log(`Player ready. ${readyCount}/${totalPlayers} ready.`);
    
    // Notify room that player is ready
    if (req.io) {
      req.io.notifyMatch(id, 'player-ready', { 
        playerId: userId,
        readyCount,
        totalPlayers
      });
      // Also send updated partial state so UI updates
       req.io.notifyMatch(id, 'match-update', {
         playersReady: updatedMatch.playersReady
       });
    }

    // If all players ready, START THE MATCH
    if (readyCount >= totalPlayers) {
      console.log('All players ready! Starting match...');
      
      const startedMatch = await matchGameService.startMatch(id);
      await startedMatch.populate('currentTurn', 'name');
      
      // Notify everyone match is live
      const fullState = await matchGameService.getMatchState(id);
      if (req.io) {
        req.io.notifyMatch(id, 'match-state', fullState);
      }
      
      return res.json({
        message: 'Match started',
        match: startedMatch,
        started: true
      });
    } else {
      return res.json({
        message: 'Waiting for opponent',
        match: updatedMatch,
        started: false,
        readyCount,
        totalPlayers
      });
    }
    
  } catch (error) {
    console.error('=== MATCH START ERROR ===', error);
    res.status(500).json({ 
      message: 'Error handling match start', 
      error: error.message 
    });
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
    res.json(state);
  } catch (error) {
    console.error('CRITICAL Error in getMatchState:', error);
    res.status(500).json({ 
      message: 'Error getting match state', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
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
}
/**
 * Get ads for a match based on sponsorship
 * GET /api/matches/:id/ads
 */
export const getMatchAds = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 1. Fetch Match with Tournament details
    const match = await Match.findById(id).populate({
      path: 'tournament',
      select: 'name' // We'll need to fetch more specific sponsorship details from Advertiser later
    });

    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }

    if (!match.tournament) {
      // If not part of a tournament, return generic/random ads
      const randomAds = await fetchRandomAds();
      return res.json(randomAds);
    }

    // 2. Check for Exclusive Sponsor for this Tournament
    // We need to query Advertisers who have this tournament in 'sponsoredTournaments' with type 'exclusive'
    // Import Advertiser dynamically or use mongoose.model if circular dependency is an issue
    const Advertiser = mongoose.model('Advertiser'); // Ensure Advertiser is registered

    const exclusiveSponsor = await Advertiser.findOne({
      'sponsoredTournaments': {
        $elemMatch: {
          tournament: match.tournament._id,
          type: 'exclusive'
        }
      }
    });

    if (exclusiveSponsor) {
      // 3. Return ONLY this sponsor's ads
      // Filter ads to either general ones or specific to this tournament if we had that granularity
      // For now, return all ads from this exclusive sponsor
      const sponsorAds = exclusiveSponsor.ads || [];
      return res.json(sponsorAds);
    }

    // 4. If No Exclusive Sponsor, fetch Generic Ads from all active advertisers
    // Logic: fetch all ads, shuffle, return subset
    // Optimization: In real app, use weighted random based on bid
    const randomAds = await fetchRandomAds();
    res.json(randomAds);

  } catch (error) {
    console.error('Error fetching match ads:', error);
    res.status(500).json({ message: 'Error fetching ads', error: error.message });
  }
};

// Helper to fetch random ads
const fetchRandomAds = async (limit = 3) => {
  const Advertiser = mongoose.model('Advertiser');
  
  // Aggregate to get random ads
  const randomAds = await Advertiser.aggregate([
    { $match: { 'ads.0': { $exists: true } } }, // Only advertisers with ads
    { $unwind: '$ads' }, // Deconstruct ads array
    { $sample: { size: limit } }, // Randomly select
    { $project: { // Format output
      _id: '$ads._id',
      title: '$ads.title',
      content: '$ads.content',
      imageUrl: '$ads.imageUrl',
      type: '$ads.type',
      companyName: '$companyName',
      advertiserId: '$_id'
    }}
  ]);
  
  return randomAds;
};
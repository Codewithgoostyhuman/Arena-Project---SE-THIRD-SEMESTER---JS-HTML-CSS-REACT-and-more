import Match from '../schemas/MatchSchema.js';
import Tournament from '../schemas/TournamentSchema.js';

class TournamentBracketService {
  
  /**
   * Generate all matches for a Single Elimination tournament
   */
  async generateSingleEliminationBracket(tournamentId) {
    const tournament = await Tournament.findById(tournamentId)
      .populate('players')
      .populate('league');
    
    if (!tournament) {
      throw new Error('Tournament not found');
    }
    
    if (tournament.players.length < 2) {
      throw new Error('Need at least 2 players for a tournament');
    }
    
    const players = [...tournament.players];
    const numPlayers = players.length;
    
    // Get next power of 2
    const bracketSize = this._getNextPowerOfTwo(numPlayers);
    const numByes = bracketSize - numPlayers;
    
    // Seed players
    const seededPlayers = this._seedPlayers(players, bracketSize);
    
    // Calculate number of rounds
    const numRounds = Math.log2(bracketSize);
    
    // Generate matches round by round
    const allMatches = [];
    let currentRoundMatches = [];
    
    // Round 1 - First round matches
    const firstRoundPairs = this._createFirstRoundPairs(seededPlayers, numByes);
    
    for (let i = 0; i < firstRoundPairs.length; i++) {
      const pair = firstRoundPairs[i];
      
      const match = new Match({
        tournament: tournamentId,
        league: tournament.league._id,
        game: tournament.league.game,
        players: pair.players.filter(p => p !== null), // Remove byes
        round: 1,
        matchNumber: i + 1,
        seeds: {
          player1Seed: pair.seeds[0],
          player2Seed: pair.seeds[1]
        },
        status: pair.players.includes(null) ? 'finished' : 'pending', // Auto-finish bye matches
        bestOf: 1 // Can be configured
      });
      
      // If it's a bye, auto-assign winner
      if (pair.players.includes(null)) {
        match.winner = pair.players.find(p => p !== null);
        match.completedAt = new Date();
      }
      
      const savedMatch = await match.save();
      currentRoundMatches.push(savedMatch);
      allMatches.push(savedMatch);
    }
    
    // Generate remaining rounds
    for (let round = 2; round <= numRounds; round++) {
      const nextRoundMatches = [];
      const matchesInRound = Math.pow(2, numRounds - round);
      
      for (let i = 0; i < matchesInRound; i++) {
        const match = new Match({
          tournament: tournamentId,
          league: tournament.league._id,
          game: tournament.league.game,
          players: [], // Will be filled when previous matches complete
          round: round,
          matchNumber: i + 1,
          status: 'pending',
          previousMatches: [
            currentRoundMatches[i * 2]._id,
            currentRoundMatches[i * 2 + 1]._id
          ],
          isFinals: round === numRounds,
          bestOf: round === numRounds ? 3 : 1 // Finals best of 3
        });
        
        const savedMatch = await match.save();
        
        // Update previous matches to point to this match
        await Match.findByIdAndUpdate(currentRoundMatches[i * 2]._id, {
          nextMatchId: savedMatch._id
        });
        await Match.findByIdAndUpdate(currentRoundMatches[i * 2 + 1]._id, {
          nextMatchId: savedMatch._id
        });
        
        nextRoundMatches.push(savedMatch);
        allMatches.push(savedMatch);
      }
      
      currentRoundMatches = nextRoundMatches;
    }
    
    // Update tournament with match references
    await Tournament.findByIdAndUpdate(tournamentId, {
      matches: allMatches.map(m => ({
        players: m.players,
        winner: m.winner,
        isDraw: m.isDraw
      })),
      status: 'ongoing'
    });
    
    return allMatches;
  }
  
  /**
   * Get the next power of 2 for bracket size
   */
  _getNextPowerOfTwo(n) {
    return Math.pow(2, Math.ceil(Math.log2(n)));
  }
  
  /**
   * Seed players for the tournament
   * Seeds players 1-N, with higher seeds getting better matchups
   */
  _seedPlayers(players, bracketSize) {
    const seeded = [];
    
    // Simple random seeding for now
    // TODO: Implement rating-based seeding
    const shuffled = [...players].sort(() => Math.random() - 0.5);
    
    for (let i = 0; i < bracketSize; i++) {
      seeded.push({
        player: shuffled[i] || null, // null = bye
        seed: i + 1
      });
    }
    
    return seeded;
  }
  
  /**
   * Create first round matchups with proper seeding
   * Standard bracket seeding: 1v16, 8v9, 4v13, 5v12, 2v15, 7v10, 3v14, 6v11
   */
  _createFirstRoundPairs(seededPlayers, numByes) {
    const pairs = [];
    const n = seededPlayers.length;
    
    for (let i = 0; i < n / 2; i++) {
      pairs.push({
        players: [
          seededPlayers[i].player,
          seededPlayers[n - 1 - i].player
        ],
        seeds: [
          seededPlayers[i].seed,
          seededPlayers[n - 1 - i].seed
        ]
      });
    }
    
    return pairs;
  }
  
  /**
   * Advance winner to next match
   */
  async advanceWinner(matchId, winnerId) {
    const match = await Match.findById(matchId);
    
    if (!match) {
      throw new Error('Match not found');
    }
    
    if (!match.nextMatchId) {
      // This was the finals
      await Tournament.findByIdAndUpdate(match.tournament, {
        $push: { winners: winnerId },
        status: 'finished'
      });
      return null;
    }
    
    // Add winner to next match
    const nextMatch = await Match.findByIdAndUpdate(
      match.nextMatchId,
      { $addToSet: { players: winnerId } },
      { new: true }
    );
    
    // Check if next match is ready to start
    if (nextMatch.players.length === 2) {
      await Match.findByIdAndUpdate(nextMatch._id, {
        status: 'ready'
      });
    }
    
    return nextMatch;
  }
  
  /**
   * Get tournament bracket structure
   */
  async getBracket(tournamentId) {
    const matches = await Match.find({ tournament: tournamentId })
      .populate('players', 'name')
      .populate('winner', 'name')
      .sort({ round: 1, matchNumber: 1 });
    
    const bracket = {};
    
    matches.forEach(match => {
      if (!bracket[match.round]) {
        bracket[match.round] = [];
      }
      bracket[match.round].push(match);
    });
    
    return bracket;
  }
}

export default new TournamentBracketService();
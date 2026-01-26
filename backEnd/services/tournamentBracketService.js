import Match from '../schemas/MatchSchema.js';
import Tournament from '../schemas/TournamentSchema.js';

class TournamentBracketService {
  
  /**
   * Generate all matches for a Single Elimination tournament
   */
  async generateSingleEliminationBracket(tournamentId, settings = {}) {
    console.log('=== GENERATING SINGLE ELIMINATION BRACKET ===');
    console.log('Tournament ID:', tournamentId);
    
    // ✅ CRITICAL: Populate league AND the game within league
    const tournament = await Tournament.findById(tournamentId)
      .populate('players')
      .populate({
        path: 'league',
        populate: { path: 'game' }  // ✅ Nested populate to get league.game
      });
    
    if (!tournament) {
      throw new Error('Tournament not found');
    }
    
    // ✅ CRITICAL: Validate league and game exist
    if (!tournament.league) {
      console.error('Tournament has no league:', {
        tournamentId: tournament._id,
        name: tournament.name
      });
      throw new Error('Tournament must be associated with a league');
    }
    
    if (!tournament.league.game) {
      console.error('League has no game assigned:', {
        tournamentId: tournament._id,
        leagueId: tournament.league._id,
        leagueName: tournament.league.name
      });
      throw new Error('League must have a game assigned before generating bracket');
    }
    
    console.log('Tournament details:', {
      tournament: tournament.name,
      league: tournament.league.name,
      game: tournament.league.game.name,
      gameType: tournament.league.game.type,
      players: tournament.players.length
    });
    
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
    
    console.log('Bracket structure:', {
      numPlayers,
      bracketSize,
      numByes,
      numRounds
    });
    
    // Generate matches round by round
    const allMatches = [];
    let currentRoundMatches = [];
    
    // Round 1 - First round matches
    const firstRoundPairs = this._createFirstRoundPairs(seededPlayers, numByes);
    
    console.log(`Creating ${firstRoundPairs.length} first round matches...`);
    
    for (let i = 0; i < firstRoundPairs.length; i++) {
      const pair = firstRoundPairs[i];
      
      const match = new Match({
        tournament: tournamentId,
        league: tournament.league._id,
        game: tournament.league.game._id,  // ✅ Use league's game
        players: pair.players.filter(p => p !== null), // Remove byes
        round: 1,
        matchNumber: i + 1,
        seeds: {
          player1Seed: pair.seeds[0],
          player2Seed: pair.seeds[1]
        },
        status: pair.players.includes(null) ? 'finished' : 'ready', // Set to ready if both players present
        bestOf: settings.bestOf || 1, // Can be configured
        score: { player1: 0, player2: 0 }  // ✅ Initialize score
      });
      
      // If it's a bye, auto-assign winner
      if (pair.players.includes(null)) {
        match.winner = pair.players.find(p => p !== null);
        match.completedAt = new Date();
      }
      
      const savedMatch = await match.save();
      currentRoundMatches.push(savedMatch);
      allMatches.push(savedMatch);
      
      console.log(`  Match ${i + 1}: Round 1, Match #${match.matchNumber}, Status: ${match.status}`);
    }
    
    // Generate remaining rounds
    for (let round = 2; round <= numRounds; round++) {
      const nextRoundMatches = [];
      const matchesInRound = Math.pow(2, numRounds - round);
      
      console.log(`Creating ${matchesInRound} matches for round ${round}...`);
      
      for (let i = 0; i < matchesInRound; i++) {
        const match = new Match({
          tournament: tournamentId,
          league: tournament.league._id,
          game: tournament.league.game._id,  // ✅ Use league's game
          players: [], // Will be filled when previous matches complete
          round: round,
          matchNumber: i + 1,
          status: 'pending',
          previousMatches: [
            currentRoundMatches[i * 2]._id,
            currentRoundMatches[i * 2 + 1]._id
          ],
          isFinals: round === numRounds,
          bestOf: round === numRounds ? 3 : 1, // Finals best of 3
          score: { player1: 0, player2: 0 }  // ✅ Initialize score
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
        
        console.log(`  Match ${allMatches.length}: Round ${round}, Match #${match.matchNumber}, Status: ${match.status}`);
      }
      
      currentRoundMatches = nextRoundMatches;
    }
    
    // Advancing Byes:
    // We must manually push the winners of bye matches (finished R1 matches) to their next match
    // because advanceWinner is not called during generation.
    const byeMatches = allMatches.filter(m => m.status === 'finished' && m.winner && m.nextMatchId);
    
    console.log(`Processing ${byeMatches.length} bye advancements...`);
    
    for (const byeMatch of byeMatches) {
        await Match.findByIdAndUpdate(byeMatch.nextMatchId, {
            $addToSet: { players: byeMatch.winner }
        });
        console.log(`  Advanced bye winner ${byeMatch.winner} from Match ${byeMatch.matchNumber} to next match`);
    }

    // New: Check if any Round 2 matches became unlocked immediately?
    // If we have a very small bracket (e.g. 3 players), R1 might be done instantly if the only match was a bye (wait, 3 players = 1 match + 1 bye).
    // The played match is P1 vs P2. Bye is P3.
    // P3 is advanced to R2 immediately.
    // R2 waits for P1/P2 winner.
    // This is correct behavior.
    
    // Update tournament with match references
    await Tournament.findByIdAndUpdate(tournamentId, {
      matches: allMatches.map(m => ({
        players: m.players,
        winner: m.winner,
        isDraw: m.isDraw
      })),
      status: 'ongoing'
    });
    
    console.log(`✅ Generated ${allMatches.length} total matches for tournament`);
    
    return allMatches;
  }

  /**
   * Generate matches for Round Robin
   */
  async generateRoundRobinBracket(tournamentId, settings = {}) {
    return this._generateRoundRobinMatches(tournamentId, settings, false);
  }

  /**
   * Generate matches for Double Round Robin
   */
  async generateDoubleRoundRobinBracket(tournamentId, settings = {}) {
    return this._generateRoundRobinMatches(tournamentId, settings, true);
  }

  async _generateRoundRobinMatches(tournamentId, settings, isDouble) {
    console.log(`=== GENERATING ${isDouble ? 'DOUBLE ' : ''}ROUND ROBIN BRACKET ===`);
    
    const tournament = await Tournament.findById(tournamentId)
      .populate('players')
      .populate({
        path: 'league',
        populate: { path: 'game' }
      });

    if (!tournament || !tournament.league || !tournament.league.game) {
      throw new Error('Invalid tournament configuration');
    }

    let pList = [...tournament.players].map(p => p._id);
    if (pList.length < 2) throw new Error('Need at least 2 players');

    // Add dummy for odd number of players
    if (pList.length % 2 !== 0) {
      pList.push(null); 
    }

    const n = pList.length;
    const roundsPerCycle = n - 1;
    const totalRounds = isDouble ? roundsPerCycle * 2 : roundsPerCycle;
    const matchesPerRound = n / 2;
    const allMatches = [];
    const bestOf = settings.bestOf || 1;

    // We need a stable array to rotate
    let players = [...pList];

    for (let r = 0; r < totalRounds; r++) {
      // If we are in the second cycle (Double RR), we might want to swap home/away
      // But purely for pairing, the logic is the same rotation.
      // The rotation resets after roundsPerCycle.
      // So if we just continue rotating, we get the same pairs again.
      // To handle Home/Away, we can check if r >= roundsPerCycle.

      for (let i = 0; i < matchesPerRound; i++) {
        let p1 = players[i];
        let p2 = players[n - 1 - i];

        if (!p1 || !p2) continue; // Skip byes

        // Swap for second leg of Double RR if desired
        if (r >= roundsPerCycle) {
            [p1, p2] = [p2, p1];
        }

        const match = new Match({
          tournament: tournamentId,
          league: tournament.league._id,
          game: tournament.league.game._id,
          players: [p1, p2],
          round: r + 1,
          matchNumber: allMatches.length + 1,
          status: 'ready',
          bestOf: bestOf,
          score: { player1: 0, player2: 0 }
        });

        const savedMatch = await match.save();
        allMatches.push(savedMatch);
      }

      // Rotate: Keep index 0, rotate the rest 1 step clockwise
      // [0, 1, 2, 3] -> [0, 3, 1, 2]
      const fixed = players[0];
      const rotating = players.slice(1);
      const last = rotating.pop();
      rotating.unshift(last);
      players = [fixed, ...rotating];
    }

    // Save to tournament
    await Tournament.findByIdAndUpdate(tournamentId, {
      matches: allMatches.map(m => m._id),
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
  /**
   * Advance winner to next match
   */
  async advanceWinner(matchId, winnerId, io = null) {
    const match = await Match.findById(matchId);
    
    if (!match) {
      throw new Error('Match not found');
    }
    
    if (!match.nextMatchId) {
      // This was the finals
      // Note: We don't set status to 'finished' here because completeTournament handles it
      // based on match completion. But for safety we can push winner.
      await Tournament.findByIdAndUpdate(match.tournament, {
        $addToSet: { winners: winnerId }
      });
      return null;
    }
    
    // Add winner to next match
    // Use findByIdAndUpdate to ensure atomicity
    const nextMatch = await Match.findByIdAndUpdate(
      match.nextMatchId,
      { $addToSet: { players: winnerId } },
      { new: true }
    );
    
    // Check if next match is ready (has 2 players)
    if (nextMatch.players.length === 2) {
        console.log(`✅ Match ${nextMatch.matchNumber} (Round ${nextMatch.round}) is ready!`);
        
        nextMatch.status = 'ready';
        await nextMatch.save();
        
        // Notify players if io is available
        if (io) {
            io.notifyMatch(nextMatch._id, 'match-ready', {
                matchId: nextMatch._id,
                players: nextMatch.players
            });
            
             // Also notify tournament room
            io.notifyTournament(nextMatch.tournament, 'match-ready', {
                matchId: nextMatch._id,
                round: nextMatch.round,
                matchNumber: nextMatch.matchNumber
            });
        }
    } else {
        console.log(`⏳ Match ${nextMatch.matchNumber} waiting for opponent...`);
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
      .populate('game', 'name type')  
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
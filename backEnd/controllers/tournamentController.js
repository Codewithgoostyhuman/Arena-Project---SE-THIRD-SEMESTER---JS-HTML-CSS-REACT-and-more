import tournamentService from "../services/tournamentService.js";
import League from "../schemas/LeagueSchema.js";
import Tournament from "../schemas/TournamentSchema.js";
import tournamentBracketService from "../services/tournamentBracketService.js";
import matchGameService from "../services/matchService.js";
import TournamentStyle from "../schemas/TournamentStyle.js";

/* ================================
   LEAGUE OWNER / OPERATOR ROUTES
================================= */
export const createTournament = async (req, res) => {
  try {
    const userId = req.user._id;
    const tournament = await tournamentService.createTournament(
      req.body, 
      userId
    );
    console.log("I am create tournament function");
    res.status(201).json(tournament);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const updateTournament = async (req, res) => {
  try {
    const tournament = await tournamentService.update(req.params.tournamentId, req.body);
    res.json(tournament);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteTournament = async (req, res) => {
  try {
    await tournamentService.delete(req.params.tournamentId);
    res.json({ message: "Tournament deleted" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const completeTournament = async (req, res) => {
  try {
    const tournament = await tournamentService.completeTournament(req.params.tournamentId, req.io);
    res.json(tournament);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const updateApplicationStatus = async (req, res) => {
  try {
    const status = req.params.action === "approve" ? "approved" : "rejected";
    const tournament = await tournamentService.updateApplicationStatus(
      req.params.tournamentId,
      req.params.applicationId,
      status
    );
    res.json(tournament);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const recordMatchResult = async (req, res) => {
  try {
    const { winnerId, isDraw } = req.body;
    const match = await tournamentService.recordMatchResult(
      req.params.tournamentId,
      req.params.matchId,
      workerId,
      isDraw,
      req.io
    );
    res.json(match);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const addExclusiveSponsor = async (req, res) => {
  try {
    const tournament = await tournamentService.selectExclusiveSponsor(
      req.params.tournamentId, 
      req.body.advertiserId
    );
    res.json(tournament);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const addAdvertisement = async (req, res) => {
  try {
    const tournament = await tournamentService.addAdvertisement(
      req.params.tournamentId, 
      req.body.adId
    );
    res.json(tournament);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const notifyGroups = async (req, res) => {
  try {
    const tournament = await tournamentService.notifyInterestGroups(
      req.params.tournamentId, 
      req.body.groupIds
    );
    res.json(tournament);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const kickoffTournament = async (req, res) => {
  try {
    const result = await tournamentService.kickoffTournamentAutomatically(
      req.params.tournamentId
    );
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getMyTournaments = async (req, res) => {
  console.log(req.user);
  try {
    const userId = req.user._id;
    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }
    const tournaments = await tournamentService.getOwnerTournaments(userId);
    return res.status(200).json(tournaments);
  } catch (err) {
    console.error("Error in get my tournaments controller: ", err);
    res.status(400).json({
      message: err.message || "Failed to fetch tournaments"
    });
  }
};

/* ================================
   PLAYER ROUTES
================================= */
export const applyToTournament = async (req, res) => {
  try {
    const tournament = await tournamentService.applyToTournament(
      req.user._id, 
      req.params.tournamentId
    );
    res.json({ message: "Applied successfully", tournament });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const cancelTournamentApplication = async (req, res) => {
  try {
    const tournament = await tournamentService.cancelTournamentApplication(
      req.user._id,
      req.params.tournamentId,
      req.params.applicationId
    );
    res.json({ message: "Application cancelled successfully", tournament });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const leaveTournament = async (req, res) => {
  try {
    const tournament = await tournamentService.leaveTournament(
      req.user._id,
      req.params.tournamentId
    );
    res.json({ message: "Left tournament successfully", tournament });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getPlayerApplications = async (req, res) => {
  try {
    const applications = await tournamentService.getPlayerApplications(req.user._id);
    res.json(applications);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getAvailableTournaments = async (req, res) => {
  try {
    const tournaments = await tournamentService.getAvailableTournaments(req.user._id);
    res.json(tournaments);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getPlayerTournaments = async (req, res) => {
  try {
    const tournaments = await tournamentService.getPlayerTournaments(req.user._id);
    res.json(tournaments);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/* ================================
   SHARED/PUBLIC ROUTES
================================= */
export const getTournamentWinners = async (req, res) => {
  try {
    const winners = await tournamentService.getTournamentWinners(req.params.tournamentId);
    res.json(winners);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getTournamentPlayers = async (req, res) => {
  try {
    const players = await tournamentService.getTournamentPlayers(req.params.tournamentId);
    res.json(players);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getTournamentById = async (req, res, next) => {
  try {
    const { tournamentId } = req.params;
    const tournament = await tournamentService.getTournamentById(tournamentId);

    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }

    res.json(tournament);
  } catch (error) {
    console.error('Error fetching tournament:', error);
    next(error);
  }
};

export const getTournamentBrackets = async (req, res) => {
  try {
    const brackets = await tournamentService.getTournamentBrackets(req.params.tournamentId);
    res.json(brackets);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getTournamentLeaderboard = async (req, res) => {
  try {
    const leaderboard = await tournamentService.getTournamentLeaderboard(req.params.tournamentId);
    res.json(leaderboard);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/* ================================
   ADDITIONAL ROUTES
================================= */
export const getLiveTournaments = async (req, res, next) => {
  try {
    const tournaments = await tournamentService.getLiveTournaments();
    res.json(tournaments);
  } catch (error) {
    console.error('Error fetching live tournaments:', error);
    next(error);
  }
};

export const getUpcomingTournaments = async (req, res, next) => {
  try {
    const tournaments = await tournamentService.getUpcomingTournaments();
    res.json(tournaments);
  } catch (error) {
    console.error('Error fetching upcoming tournaments:', error);
    next(error);
  }
};

export const getActiveLeagues = async (req, res, next) => {
  try {
    const leagues = await League.find({ owner: req.user._id })
      .populate('game', 'name')
      .populate('ratingFormula', 'name')
      .populate('players', 'username avatar')
      .sort({ createdAt: -1 });

    res.json(leagues);
  } catch (error) {
    console.error('Error fetching leagues:', error);
    next(error);
  }
};
/**
 * Start a tournament and generate bracket
 * POST /api/tournaments/:id/start
 */
export const startTournament = async (req, res) => {
  try {
    const { id } = req.params;
    
    const tournament = await Tournament.findById(id)
      .populate('league')
      .populate('players');
    
    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }
    
    // Verify user is the league owner
    if (tournament.league.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only league owner can start tournament' });
    }
    
    // Check tournament is in correct state
    if (tournament.status === 'ongoing' || tournament.status === 'finished') {
      return res.status(400).json({ message: 'Tournament already started or finished' });
    }
    
    // Check minimum players
    if (tournament.players.length < 2) {
      return res.status(400).json({ message: 'Need at least 2 players to start tournament' });
    }
    
    // Generate bracket based on tournament style
    let matches;
    
    // Lookup style configuration
    const styleDoc = await TournamentStyle.findOne({ name: tournament.style });
    const styleType = styleDoc ? styleDoc.type : tournament.style;
    const settings = styleDoc ? styleDoc.settings : {};
    
    switch (styleType) {
      case 'SingleElimination':
        matches = await tournamentBracketService.generateSingleEliminationBracket(id, settings);
        break;
      
      case 'RoundRobin':
        matches = await tournamentBracketService.generateRoundRobinBracket(id, settings);
        break;

      case 'DoubleRoundRobin':
        matches = await tournamentBracketService.generateDoubleRoundRobinBracket(id, settings);
        break;
      
      default:
        return res.status(400).json({ message: `Unknown tournament style: ${styleType}` });
    }
    
    // Notify via socket
    if (req.io) {
      req.io.notifyTournament(id, 'tournament-started', {
        tournamentId: id,
        totalMatches: matches.length
      });
    }
    
    res.json({
      message: 'Tournament started successfully',
      tournament,
      totalMatches: matches.length,
      firstRoundMatches: matches.filter(m => m.round === 1).length
    });
    
  } catch (error) {
    console.error('Error starting tournament:', error);
    res.status(500).json({ message: 'Error starting tournament', error: error.message });
  }
};

/**
 * Get tournament bracket
 * GET /api/tournaments/:id/bracket
 */
export const getTournamentBracket = async (req, res) => {
  try {
    const { id } = req.params;
    
    const tournament = await Tournament.findById(id);
    
    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }
    
    const bracket = await tournamentBracketService.getBracket(id);
    
    res.json({
      tournament,
      bracket
    });
    
  } catch (error) {
    console.error('Error getting bracket:', error);
    res.status(500).json({ message: 'Error getting bracket', error: error.message });
  }
};

/**
 * Get ready matches (matches that can be played)
 * GET /api/tournaments/:id/ready-matches
 */
export const getReadyMatches = async (req, res) => {
  try {
    const { id } = req.params;
    
    const matches = await matchGameService.getReadyMatches(id);
    
    res.json({ matches });
    
  } catch (error) {
    console.error('Error getting ready matches:', error);
    res.status(500).json({ message: 'Error getting ready matches', error: error.message });
  }
};


/**
 * Get tournament standings
 * GET /api/tournaments/:id/standings
 */
export const getTournamentStandings = async (req, res) => {
  try {
    const { id } = req.params;
    
    const tournament = await Tournament.findById(id)
      .populate('players', 'name stats')
      .populate('winners', 'name');
    
    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }
    
    res.json({
      tournament: {
        name: tournament.name,
        status: tournament.status,
        style: tournament.style
      },
      players: tournament.players,
      winners: tournament.winners
    });
    
  } catch (error) {
    console.error('Error getting standings:', error);
    res.status(500).json({ message: 'Error getting standings', error: error.message });
  }
};
export const getSponsorableTournaments = async (req, res) => {
  try {
    const tournaments = await tournamentService.getSponsorableTournaments();
    res.json(tournaments);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const updateTournamentStatus = async (req, res) => {
  try {
    const { tournamentId } = req.params;
    const { status } = req.body;
    const tournament = await tournamentService.updateTournamentStatus(tournamentId, status);
    res.json(tournament);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const manageSponsorshipRequest = async (req, res) => {
  try {
    const { tournamentId, requestId } = req.params;
    const { status } = req.body;
    const tournament = await tournamentService.manageSponsorshipRequest(tournamentId, requestId, status);
    res.json(tournament);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

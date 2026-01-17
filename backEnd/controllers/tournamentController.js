import tournamentService from "../services/tournamentService.js";
import League from "../schemas/LeagueSchema.js";

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
    const tournament = await tournamentService.completeTournament(req.params.tournamentId);
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
      winnerId,
      isDraw
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
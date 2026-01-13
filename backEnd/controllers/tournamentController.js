import * as tournamentService from "../services/tournamentService.js";

export const createTournament = async (req, res) => {
  try {
    const tournament = await tournamentService.createTournament(req.body);
    res.status(201).json(tournament);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const updateTournament = async (req, res) => {
  try {
    const tournament = await tournamentService.updateTournament(req.params.tournamentId, req.body);
    res.json(tournament);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteTournament = async (req, res) => {
  try {
    await tournamentService.deleteTournament(req.params.tournamentId);
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

// Player Routes
export const applyToTournament = async (req, res) => {
  try {
    const tournament = await tournamentService.applyToTournament(req.user._id, req.params.tournamentId);
    res.json({ message: "Applied successfully", tournament });
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

// Owner/Operator Routes
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
    const tournament = await tournamentService.addExclusiveSponsor(req.params.tournamentId, req.body.advertiserId);
    res.json(tournament);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const addAdvertisement = async (req, res) => {
  try {
    const tournament = await tournamentService.addAdvertisement(req.params.tournamentId, req.body.adId);
    res.json(tournament);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const notifyGroups = async (req, res) => {
  try {
    const tournament = await tournamentService.notifyGroups(req.params.tournamentId, req.body.groupIds);
    res.json(tournament);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

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

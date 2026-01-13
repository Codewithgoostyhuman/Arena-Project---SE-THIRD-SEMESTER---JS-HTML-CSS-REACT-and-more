import LeagueService from "../services/leagueService.js";

/* ==========================
   CREATE LEAGUE
========================== */
export const createLeague = async (req, res) => {
  try {
    const league = await LeagueService.createLeague(req.user._id, req.body);
    res.status(201).json(league);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/* ==========================
   UPDATE LEAGUE
========================== */
export const updateLeague = async (req, res) => {
  try {
    const league = await LeagueService.updateLeague(req.params.leagueId, req.body);
    res.json(league);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/* ==========================
   DELETE LEAGUE
========================== */
export const deleteLeague = async (req, res) => {
  try {
    const result = await LeagueService.deleteLeague(req.params.leagueId);
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/* ==========================
   GET LEAGUE DETAILS
========================== */
export const getLeague = async (req, res) => {
  try {
    const league = await LeagueService.getLeague(req.params.leagueId);
    res.json(league);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

/* ==========================
   GET ALL ACTIVE LEAGUES
========================== */
export const getActiveLeagues = async (req, res) => {
  try {
    const leagues = await LeagueService.getActiveLeagues();
    res.json(leagues);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/* ==========================
   GET PLAYERS IN LEAGUE
========================== */
export const getPlayers = async (req, res) => {
  try {
    const players = await LeagueService.getPlayers(req.params.leagueId);
    res.json(players);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

/* ==========================
   GET TOURNAMENTS IN LEAGUE
========================== */
export const getTournaments = async (req, res) => {
  try {
    const tournaments = await LeagueService.getTournaments(req.params.leagueId);
    res.json(tournaments);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

/* ==========================
   GET APPLICATIONS
========================== */
export const getApplications = async (req, res) => {
  try {
    const applications = await LeagueService.getApplications(req.params.leagueId);
    res.json(applications);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

/* ==========================
   APPROVE APPLICATION
========================== */
export const approveApplication = async (req, res) => {
  try {
    const app = await LeagueService.approveApplication(req.params.leagueId, req.params.applicationId);
    res.json(app);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/* ==========================
   REJECT APPLICATION
========================== */
export const rejectApplication = async (req, res) => {
  try {
    const app = await LeagueService.rejectApplication(req.params.leagueId, req.params.applicationId);
    res.json(app);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/* ==========================
   PLAYER APPLIES TO LEAGUE
========================== */
export const applyToLeague = async (req, res) => {
  try {
    const app = await LeagueService.applyToLeague(req.user._id, req.params.leagueId);
    res.status(201).json(app);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/* ==========================
   PLAYER LEAVES LEAGUE
========================== */
export const leaveLeague = async (req, res) => {
  try {
    const league = await LeagueService.removePlayer(req.params.leagueId, req.user._id);
    res.json({ message: "Left league successfully", league });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/* ==========================
   ADDS PLAYER MANUALLY
========================== */
export const addPlayer = async (req, res) => {
  try {
    const league = await LeagueService.addPlayer(req.params.leagueId, req.body.playerId);
    res.json({ message: "Player added successfully", league });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

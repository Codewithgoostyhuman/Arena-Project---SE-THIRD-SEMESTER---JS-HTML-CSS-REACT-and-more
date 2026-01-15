// backend/controllers/leagueOwnerController.js
import LeagueOwnerService from '../services/leagueOwnerServices.js'

/* ====================
   LEAGUE OWNER
==================== */
export const createLeagueOwner = async (req, res) => {
  try {
    const owner = await LeagueOwnerService.createLeagueOwner(req.body.user);
    res.status(201).json(owner);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getAllLeagueOwners = async (req, res) => {
  try {
    const owners = await LeagueOwnerService.getAllLeagueOwners();
    res.json(owners);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getLeagueOwnerById = async (req, res) => {
  try {
    const owner = await LeagueOwnerService.getLeagueOwnerById(req.params.id);
    if (!owner) return res.status(404).json({ message: "LeagueOwner not found" });
    res.json(owner);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateLeagueOwner = async (req, res) => {
  try {
    const owner = await LeagueOwnerService.updateLeagueOwner(req.params.id, req.body);
    res.json(owner);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteLeagueOwner = async (req, res) => {
  try {
    const result = await LeagueOwnerService.deleteLeagueOwner(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ====================
   LEAGUE
==================== */
export const createLeague = async (req, res) => {
  try {
    const league = await LeagueOwnerService.createLeague(req.body.ownerId, req.body);
    res.status(201).json(league);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const updateLeague = async (req, res) => {
  try {
    const league = await LeagueOwnerService.updateLeague(req.params.id, req.body);
    res.json(league);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteLeague = async (req, res) => {
  try {
    const result = await LeagueOwnerService.deleteLeague(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const startLeague = async (req, res) => {
  try {
    const league = await LeagueOwnerService.startLeague(req.params.id);
    res.json(league);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/* ====================
   TOURNAMENT
==================== */
export const createTournament = async (req, res) => {
  try {
    const tournament = await LeagueOwnerService.createTournament(req.body.leagueId, req.body);
    res.status(201).json(tournament);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const updateTournament = async (req, res) => {
  try {
    const tournament = await LeagueOwnerService.updateTournament(req.params.id, req.body);
    res.json(tournament);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const startTournament = async (req, res) => {
  try {
    const tournament = await LeagueOwnerService.startTournament(req.params.id);
    res.json(tournament);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
export const deleteTournament = async (req, res) => {
  try {
    const result = await LeagueOwnerService.deleteTournament(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};


/* ====================
   APPLICATION
==================== */
export const handleApplication = async (req, res) => {
  try {
    const app = await LeagueOwnerService.handleApplication(req.body.applicationId, req.body.action);
    res.json(app);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
/* ====================
   LEAGUE APPLICATIONS
==================== */
export const getLeagueApplications = async (req, res) => {
  console.log("Get league applications called");
  console.log("User ID:", req.user.id);
  console.log("User object:", req.user);
  console.log("Get league applications called");
  try {
    const ownerId = req.user.id;
    const { leagueId } = req.params; // Can be undefined
    const { status } = req.query;    // Can be undefined
    
    const applications = await LeagueOwnerService.getLeagueApplications(ownerId, leagueId, status);
    res.json(applications);
    console.log("Fetched applications");
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: err.message });
  }
};

export const approveLeagueApplication = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const { applicationId } = req.params;
    const app = await LeagueOwnerService.approveLeagueApplication(ownerId, applicationId);
    res.json(app);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const rejectLeagueApplication = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const { applicationId } = req.params;
    const app = await LeagueOwnerService.rejectLeagueApplication(ownerId, applicationId);
    res.json(app);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/* ====================
   TOURNAMENT APPLICATIONS
==================== */
export const getTournamentApplications = async (req, res) => {
  console.log("Get tournament applications called");
  try {
    const ownerId = req.user.id;
    const { tournamentId } = req.params; // Can be undefined
    const { status } = req.query;        // Can be undefined
    
    const applications = await LeagueOwnerService.getTournamentApplications(ownerId, tournamentId, status);
    res.json(applications);
    console.log("Fetched tournament applications");
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: err.message });
  }
};;

export const approveTournamentApplication = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const { applicationId } = req.params;
    const app = await LeagueOwnerService.approveTournamentApplication(ownerId, applicationId);
    res.json(app);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const rejectTournamentApplication = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const { applicationId } = req.params;
    const app = await LeagueOwnerService.rejectTournamentApplication(ownerId, applicationId);
    res.json(app);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
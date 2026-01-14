import LeagueService from "../services/leagueService.js";

/* ==========================
   CREATE LEAGUE
========================== */
export const createLeague = async (req, res) => {
  try {
    const leagueData = {...req.body}
    const league = await LeagueService.createLeague(req.user._id,leagueData);
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
    const league = await LeagueService.updateLeague(req.params.leagueId, req.body,req.user._id);
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
    const result = await LeagueService.deleteLeague(req.params.leagueId,req.user._id);
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
   console.log("REQ USER:", req.user);
  try {
    const leagues = await LeagueService.getActiveLeagues(req.user._id);
     console.log("LEAGUES:", leagues);
    res.json(leagues);
  } catch (err) {
    //  console.log("LEAGUES:", leagues);
    res.status(400).json({ message: err.message });
  }
};
/* ==========================
   GET LEAGUES BY OWNER
========================== */
export const getLeaguesByOwner = async (req,res) =>{
  try{
    const ownerId = req.user._id;
    const leagues = await LeagueService.getLeaguesByOwner(ownerId);
    res.json(leagues)
  }catch(err){
    console.log("Error fetching leagues by owner: ",err);
    res.status(400).json({message:err.message})
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

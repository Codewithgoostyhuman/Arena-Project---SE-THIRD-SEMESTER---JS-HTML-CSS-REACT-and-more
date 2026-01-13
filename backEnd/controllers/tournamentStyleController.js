import TournamentStyleService from "../services/tournamentStyleService.js"

export const createTournamentStyle = async (req, res) => {
  try {
    const style = await TournamentStyleService.createStyle(req.body);
    res.status(201).json(style);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getTournamentStyle = async (req, res) => {
  try {
    const style = await TournamentStyleService.getStyleById(req.params.id);
    res.json(style);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};

export const getAllTournamentStyles = async (req, res) => {
  try {
    const styles = await TournamentStyleService.getAllStyles();
    res.json(styles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getDefaultTournamentStyle = async (req, res) => {
  try {
    const style = await TournamentStyleService.getDefaultStyle();
    res.json(style);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};

export const updateTournamentStyle = async (req, res) => {
  try {
    const style = await TournamentStyleService.updateStyle(req.params.id, req.body);
    res.json(style);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const deleteTournamentStyle = async (req, res) => {
  try {
    const style = await TournamentStyleService.deleteStyle(req.params.id);
    res.json({ message: "Tournament style deleted successfully", style });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

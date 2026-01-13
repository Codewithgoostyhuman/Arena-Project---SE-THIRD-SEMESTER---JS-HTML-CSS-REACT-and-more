// backend/controllers/operatorController.js
import OperatorService from "../services/operatorServices.js"

// ==================== USER ====================
export const updateUser = async (req, res) => {
  try {
    const user = await OperatorService.updateUser(req.params.id, req.body);
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await OperatorService.deleteUser(req.params.id);
    res.json({ message: "User deleted successfully", user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const activateUserById = async (req, res) => {
  try {
    const user = await OperatorService.activateUserById(req.params.id);
    res.json({ message: "User activated", user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deactivateUserById = async (req, res) => {
  try {
    const user = await OperatorService.deactivateUserById(req.params.id);
    res.json({ message: "User deactivated", user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const activateUserByName = async (req, res) => {
  try {
    const user = await OperatorService.activateUserByName(req.params.name);
    res.json({ message: "User activated", user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ==================== GAME ====================
export const createGame = async (req, res) => {
  try {
    const game = await OperatorService.createGame(req.body);
    res.json(game);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateGame = async (req, res) => {
  try {
    const game = await OperatorService.updateGame(req.params.id, req.body);
    res.json(game);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteGame = async (req, res) => {
  try {
    const game = await OperatorService.deleteGame(req.params.id);
    res.json({ message: "Game deleted", game });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getGameById = async (req, res) => {
  try {
    const game = await OperatorService.getGameById(req.params.id);
    res.json(game);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getAllGames = async (req, res) => {
  try {
    const games = await OperatorService.getAllGames();
    res.json(games);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ==================== RATING FORMULA ====================
export const createRatingFormula = async (req, res) => {
  try {
    const formula = await OperatorService.createRatingFormula(req.body);
    res.json(formula);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateRatingFormula = async (req, res) => {
  try {
    const formula = await OperatorService.updateRatingFormula(req.params.id, req.body);
    res.json(formula);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteRatingFormula = async (req, res) => {
  try {
    const formula = await OperatorService.deleteRatingFormula(req.params.id);
    res.json({ message: "Rating formula deleted", formula });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getRatingFormulaById = async (req, res) => {
  try {
    const formula = await OperatorService.getRatingFormulaById(req.params.id);
    res.json(formula);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getAllRatingFormulas = async (req, res) => {
  try {
    const formulas = await OperatorService.getAllRatingFormulas();
    res.json(formulas);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ==================== ADVERTISER ====================
export const approveAdvertiser = async (req, res) => {
  try {
    const user = await OperatorService.approveAdvertiser(req.params.id);
    res.json({ message: "Advertiser approved", user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const rejectAdvertiser = async (req, res) => {
  try {
    const user = await OperatorService.rejectAdvertiser(req.params.id);
    res.json({ message: "Advertiser rejected", user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

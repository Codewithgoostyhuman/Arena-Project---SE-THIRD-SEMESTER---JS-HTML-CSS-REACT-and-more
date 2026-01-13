import ratingService from "../services/ratingFormulaService.js";

// Only Operators can create
export const createRatingFormula = async (req, res) => {
  try {
    const formula = await ratingService.createFormula(req.body);
    res.status(201).json(formula);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Only Operators can update
export const updateRatingFormula = async (req, res) => {
  try {
    const formula = await ratingService.update(req.params.id, req.body);
    res.json(formula);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};

// Only Operators can delete
export const deleteRatingFormula = async (req, res) => {
  try {
    const formula = await ratingService.delete(req.params.id);
    res.json({ message: "Deleted successfully", formula });
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};

// Operators and Players can get one
export const getRatingFormula = async (req, res) => {
  try {
    const formula = await ratingService.getById(req.params.id);
    res.json(formula);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};

// Operators and Players can get all
export const getAllRatingFormulas = async (req, res) => {
  try {
    const formulas = await ratingService.getAll();
    res.json(formulas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Operators and Players can get default
export const getDefaultRatingFormula = async (req, res) => {
  try {
    const formula = await ratingService.getDefault();
    res.json(formula);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};

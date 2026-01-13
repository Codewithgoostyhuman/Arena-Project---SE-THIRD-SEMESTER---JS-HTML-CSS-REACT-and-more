import GameService from "../services/gameService.js";

export const createGame = async (req, res) => {
  try {
    const game = await GameService.createGame(req.body);
    res.status(201).json(game);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getGameById = async (req, res) => {
  try {
    const game = await GameService.getGameById(req.params.id);
    res.json(game);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};

export const getAllGames = async (req, res) => {
  try {
    const games = await GameService.getAllGames();
    res.json(games);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateGame = async (req, res) => {
  try {
    const game = await GameService.updateGame(req.params.id, req.body);
    res.json(game);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const deleteGame = async (req, res) => {
  try {
    const game = await GameService.deleteGame(req.params.id);
    res.json({ message: "Game deleted successfully", game });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

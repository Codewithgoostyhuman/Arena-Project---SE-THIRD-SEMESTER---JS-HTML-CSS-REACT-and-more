import ArenaService from "../services/arenaService.js";

export const createArena = async (req, res) => {
  try {
    const arena = await ArenaService.createArena(req.body);
    res.status(201).json(arena);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getArena = async (req, res) => {
  try {
    const arena = await ArenaService.getArena();
    if (!arena) return res.status(404).json({ message: "Arena not found" });
    res.json(arena);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateArena = async (req, res) => {
  try {
    const arena = await ArenaService.updateArena(req.body);
    res.json(arena);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const toggleMaintenance = async (req, res) => {
  try {
    const arena = await ArenaService.toggleMaintenance();
    res.json({ message: `Maintenance mode is now ${arena.maintenanceMode}`, arena });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

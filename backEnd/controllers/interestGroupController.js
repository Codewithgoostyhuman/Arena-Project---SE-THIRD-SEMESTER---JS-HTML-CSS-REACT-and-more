import InterestGroupService from "../services/interestGroupService";

export const createGroup = async (req, res) => {
  try {
    const group = await InterestGroupService.create(req.body);
    res.status(201).json(group);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getAllGroups = async (req, res) => {
  try {
    const groups = await InterestGroupService.getAll();
    res.json(groups);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getGroup = async (req, res) => {
  try {
    const group = await InterestGroupService.getById(req.params.id);
    if (!group) return res.status(404).json({ message: "Interest group not found" });
    res.json(group);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateGroup = async (req, res) => {
  try {
    const updated = await InterestGroupService.update(req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteGroup = async (req, res) => {
  try {
    const deleted = await InterestGroupService.delete(req.params.id);
    res.json({ message: "Interest group deleted", deleted });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const addMember = async (req, res) => {
  try {
    const group = await InterestGroupService.addMember(req.params.id, req.body.userId);
    res.json(group);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const removeMember = async (req, res) => {
  try {
    const group = await InterestGroupService.removeMember(req.params.id, req.params.userId);
    res.json(group);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const addGame = async (req, res) => {
  try {
    const group = await InterestGroupService.addGame(req.params.id, req.body.gameId);
    res.json(group);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const addLeague = async (req, res) => {
  try {
    const group = await InterestGroupService.addLeague(req.params.id, req.body.leagueId);
    res.json(group);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

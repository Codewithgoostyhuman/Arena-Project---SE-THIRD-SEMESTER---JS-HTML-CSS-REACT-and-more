import express from "express";
import interestGroupDomain from '../domains/InterestGroup.js'
import { authenticate, authorizeRoles, Roles } from "../middleware/auth.js";

const router = express.Router();

// ==============================
// INTEREST GROUP ENDPOINTS
// ==============================

// Create a new interest group
router.post("/", authenticate, authorizeRoles(Roles.OPERATOR, Roles.ADMIN), async (req, res) => {
  try {
    const { name, description, type } = req.body;
    const group = new interestGroupDomain(name, description, type);
    const savedGroup = await group.create();
    res.json(savedGroup);
  } catch (err) {
    res.status(500).json({ message: "Error creating interest group", error: err.message });
  }
});

// Get all interest groups
router.get("/", authenticate, async (req, res) => {
  try {
    const groups = await interestGroupDomain.getAll();
    res.json(groups);
  } catch (err) {
    res.status(500).json({ message: "Error fetching interest groups", error: err.message });
  }
});

// Get a single interest group
router.get("/:id", authenticate, async (req, res) => {
  try {
    const group = await interestGroupDomain.getById(req.params.id);
    if (!group) return res.status(404).json({ message: "Interest group not found" });
    res.json(group);
  } catch (err) {
    res.status(500).json({ message: "Error fetching interest group", error: err.message });
  }
});

// Update interest group
router.put("/:id", authenticate, authorizeRoles(Roles.OPERATOR, Roles.ADMIN), async (req, res) => {
  try {
    const updatedGroup = await interestGroupDomain.update(req.params.id, req.body);
    res.json(updatedGroup);
  } catch (err) {
    res.status(500).json({ message: "Error updating interest group", error: err.message });
  }
});

// Delete interest group
router.delete("/:id", authenticate, authorizeRoles(Roles.OPERATOR, Roles.ADMIN), async (req, res) => {
  try {
    const deletedGroup = await interestGroupDomain.delete(req.params.id);
    res.json({ message: "Interest group deleted", deletedGroup });
  } catch (err) {
    res.status(500).json({ message: "Error deleting interest group", error: err.message });
  }
});

// Add member
router.post("/:id/member", authenticate, authorizeRoles(Roles.OPERATOR, Roles.ADMIN), async (req, res) => {
  try {
    const { userId } = req.body;
    const group = await interestGroupDomain.addMember(req.params.id, userId);
    res.json(group);
  } catch (err) {
    res.status(500).json({ message: "Error adding member", error: err.message });
  }
});

// Remove member
router.delete("/:id/member/:userId", authenticate, authorizeRoles(Roles.OPERATOR, Roles.ADMIN), async (req, res) => {
  try {
    const group = await interestGroupDomain.removeMember(req.params.id, req.params.userId);
    res.json(group);
  } catch (err) {
    res.status(500).json({ message: "Error removing member", error: err.message });
  }
});

// Add game
router.post("/:id/game", authenticate, authorizeRoles(Roles.OPERATOR, Roles.ADMIN), async (req, res) => {
  try {
    const { gameId } = req.body;
    const group = await interestGroupDomain.addGame(req.params.id, gameId);
    res.json(group);
  } catch (err) {
    res.status(500).json({ message: "Error adding game", error: err.message });
  }
});

// Add league
router.post("/:id/league", authenticate, authorizeRoles(Roles.OPERATOR, Roles.ADMIN), async (req, res) => {
  try {
    const { leagueId } = req.body;
    const group = await interestGroupDomain.addLeague(req.params.id, leagueId);
    res.json(group);
  } catch (err) {
    res.status(500).json({ message: "Error adding league", error: err.message });
  }
});
// User subscribes to interest group
router.post(
  "/:id/subscribe",
  authenticate,
  async (req, res) => {
    try {
      const group = await interestGroupDomain.addMember(req.params.id, req.user._id);
      res.json({ message: "Subscribed successfully", group });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// User unsubscribes
router.delete(
  "/:id/unsubscribe",
  authenticate,
  async (req, res) => {
    try {
      const group = await interestGroupDomain.removeMember(req.params.id, req.user._id);
      res.json({ message: "Unsubscribed successfully", group });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// Get my subscriptions
router.get(
  "/my-subscriptions",
  authenticate,
  async (req, res) => {
    try {
      const groups = await interestGroupDomain.find({ members: req.user._id })
        .populate("games", "name")
        .populate("leagues", "name");
      res.json(groups);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

export default router;

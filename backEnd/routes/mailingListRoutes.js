import express from "express";
import MailingListDomain from "../domains/MailingList.js";
import { authenticate, authorizeRoles, Roles } from "../middleware/auth.js";

const router = express.Router();

// Get lists user is subscribed to
router.get("/me", authenticate, async (req, res) => {
  try {
    const lists = await MailingListDomain.getListsForUser(req.user._id);
    res.json(lists);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Subscribe to a list
router.post("/subscribe", authenticate, async (req, res) => {
  try {
    const { listName } = req.body;
    const list = await MailingListDomain.subscribe(req.user._id, listName);
    res.json({ message: `Subscribed to ${listName}`, list });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Unsubscribe from a list
router.post("/unsubscribe", authenticate, async (req, res) => {
  try {
    const { listName } = req.body;
    await MailingListDomain.unsubscribe(req.user._id, listName);
    res.json({ message: `Unsubscribed from ${listName}` });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Admin/Operator: Create a new list
router.post("/", authenticate, authorizeRoles(Roles.OPERATOR, Roles.ADMIN), async (req, res) => {
  try {
    const list = await MailingListDomain.createList(req.body);
    res.status(201).json(list);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Admin/Operator: Get subscribers for a list
router.get("/:name/subscribers", authenticate, authorizeRoles(Roles.OPERATOR, Roles.ADMIN), async (req, res) => {
  try {
    const subscribers = await MailingListDomain.getSubscribers(req.params.name);
    res.json(subscribers);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;

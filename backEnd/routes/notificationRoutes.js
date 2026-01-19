// backend/routes/notificationRoutes.js
import express from "express";
import notificationService from "../services/notificationService.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

/**
 * @route   GET /api/notifications
 * @desc    Get user notifications
 * @access  Private
 */
router.get("/", authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 20, unreadOnly = false } = req.query;
    
    const result = await notificationService.getUserNotifications(
      req.user._id,
      parseInt(page),
      parseInt(limit),
      unreadOnly === "true"
    );

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @route   GET /api/notifications/unread-count
 * @desc    Get unread notification count
 * @access  Private
 */
router.get("/unread-count", authenticate, async (req, res) => {
  try {
    const Notification = (await import("../schemas/notificationSchema.js")).default;
    const count = await Notification.countDocuments({
      user: req.user._id,
      read: false
    });

    res.json({ unreadCount: count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @route   PATCH /api/notifications/:id/read
 * @desc    Mark notification as read
 * @access  Private
 */
router.patch("/:id/read", authenticate, async (req, res) => {
  try {
    const notification = await notificationService.markAsRead(
      req.params.id,
      req.user._id
    );

    res.json(notification);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
});

/**
 * @route   PATCH /api/notifications/mark-all-read
 * @desc    Mark all notifications as read
 * @access  Private
 */
router.patch("/mark-all-read", authenticate, async (req, res) => {
  try {
    const result = await notificationService.markAllAsRead(req.user._id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @route   DELETE /api/notifications/:id
 * @desc    Delete notification
 * @access  Private
 */
router.delete("/:id", authenticate, async (req, res) => {
  try {
    await notificationService.deleteNotification(req.params.id, req.user._id);
    res.json({ message: "Notification deleted" });
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
});

/**
 * @route   DELETE /api/notifications/read/all
 * @desc    Delete all read notifications
 * @access  Private
 */
router.delete("/read/all", authenticate, async (req, res) => {
  try {
    const result = await notificationService.deleteAllRead(req.user._id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
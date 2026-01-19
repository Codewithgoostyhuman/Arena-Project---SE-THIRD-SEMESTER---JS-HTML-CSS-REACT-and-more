// backend/routes/userRoutes.js
import express from "express";
import * as userController from "../controllers/userController.js";
import { authenticate, authorizeRoles, Roles } from "../middleware/auth.js";

const router = express.Router();

// ====== Logged-in user routes ======

/**
 * @route   GET /api/users/profile
 * @desc    Get my profile
 * @access  Private
 */
router.get("/profile", authenticate, userController.getProfile);

/**
 * @route   PUT /api/users/profile
 * @desc    Update my profile
 * @access  Private
 */
router.put("/profile", authenticate, userController.updateProfile);

/**
 * @route   POST /api/users/change-password
 * @desc    Change password
 * @access  Private
 */
router.post("/change-password", authenticate, userController.changePassword);

// ====== Operator/Admin routes ======

/**
 * @route   GET /api/users
 * @desc    Get all users
 * @access  Private (Operator only)
 */
router.get("/", authenticate, authorizeRoles(Roles.OPERATOR), userController.getAllUsers);

/**
 * @route   GET /api/users/search
 * @desc    Search users
 * @access  Private (Operator only)
 */
router.get("/search", authenticate, authorizeRoles(Roles.OPERATOR), userController.searchUsers);

/**
 * @route   GET /api/users/role/:role
 * @desc    Get users by role
 * @access  Private (Operator only)
 */
router.get("/role/:role", authenticate, authorizeRoles(Roles.OPERATOR), userController.getUsersByRole);

/**
 * @route   GET /api/users/:userId
 * @desc    Get user by ID
 * @access  Private (Operator only)
 */
router.get("/:userId", authenticate, authorizeRoles(Roles.OPERATOR), userController.getUserById);

/**
 * @route   GET /api/users/:userId/stats
 * @desc    Get user statistics
 * @access  Private (Operator only)
 */
router.get("/:userId/stats", authenticate, authorizeRoles(Roles.OPERATOR), userController.getUserStatistics);

/**
 * @route   PUT /api/users/:userId
 * @desc    Update user by ID (admin/operator)
 * @access  Private (Operator only)
 */
router.put("/:userId", authenticate, authorizeRoles(Roles.OPERATOR), userController.updateUser);

/**
 * @route   DELETE /api/users/:userId
 * @desc    Delete user
 * @access  Private (Operator only)
 */
router.delete("/:userId", authenticate, authorizeRoles(Roles.OPERATOR), userController.deleteUser);

export default router;
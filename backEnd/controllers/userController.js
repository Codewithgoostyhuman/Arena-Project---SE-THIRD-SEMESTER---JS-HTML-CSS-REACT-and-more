// backend/controllers/userController.js
import UserService from "../services/userService.js";

/**
 * Get my profile
 * GET /api/users/profile
 */
export const getProfile = async (req, res) => {
  try {
    const user = await UserService.getProfile(req.user._id);
    res.json(user);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

/**
 * Update my profile
 * PUT /api/users/profile
 */
export const updateProfile = async (req, res) => {
  try {
    const user = await UserService.updateProfile(req.user._id, req.body);
    res.json(user);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * Change password
 * POST /api/users/change-password
 */
export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const result = await UserService.changePassword(
      req.user._id,
      oldPassword,
      newPassword
    );
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * Get all users (Operator only)
 * GET /api/users
 */
export const getAllUsers = async (req, res) => {
  try {
    const users = await UserService.getAllUsers();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Get user by ID (Operator only)
 * GET /api/users/:userId
 */
export const getUserById = async (req, res) => {
  try {
    const user = await UserService.getUserById(req.params.userId);
    res.json(user);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

/**
 * Update user by ID (Operator only)
 * PUT /api/users/:userId
 */
export const updateUser = async (req, res) => {
  try {
    const user = await UserService.adminUpdateUser(req.params.userId, req.body);
    res.json(user);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * Delete user (Operator only)
 * DELETE /api/users/:userId
 */
export const deleteUser = async (req, res) => {
  try {
    const result = await UserService.deleteUser(req.params.userId);
    res.json(result);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

/**
 * Get users by role (Operator only)
 * GET /api/users/role/:role
 */
export const getUsersByRole = async (req, res) => {
  try {
    const users = await UserService.getUsersByRole(req.params.role);
    res.json(users);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * Search users (Operator only)
 * GET /api/users/search?q=searchTerm&role=player
 */
export const searchUsers = async (req, res) => {
  try {
    const { q, role } = req.query;
    
    if (!q) {
      return res.status(400).json({ message: "Search term is required" });
    }

    const users = await UserService.searchUsers(q, role);
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Get user statistics
 * GET /api/users/:userId/stats
 */
export const getUserStatistics = async (req, res) => {
  try {
    const stats = await UserService.getUserStatistics(req.params.userId);
    res.json(stats);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};
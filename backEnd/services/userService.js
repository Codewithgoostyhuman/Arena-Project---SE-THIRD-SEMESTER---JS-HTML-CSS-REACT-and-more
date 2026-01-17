// backend/services/userService.js
import UserDomain from "../domains/User.js";

export default class UserService {
  /**
   * Get user profile
   */
  static async getProfile(userId) {
    return await UserDomain.getProfile(userId);
  }

  /**
   * Update user profile
   */
  static async updateProfile(userId, data) {
    return await UserDomain.updateProfile(userId, data);
  }

  /**
   * Change password
   */
  static async changePassword(userId, oldPassword, newPassword) {
    return await UserDomain.changePassword(userId, oldPassword, newPassword);
  }

  /**
   * Get users by role
   */
  static async getUsersByRole(role) {
    return await UserDomain.getUsersByRole(role);
  }

  /**
   * Get active users
   */
  static async getActiveUsers(role = null) {
    return await UserDomain.getActiveUsers(role);
  }

  /**
   * Get user statistics
   */
  static async getUserStatistics(userId) {
    return await UserDomain.getUserStatistics(userId);
  }

  /**
   * Search users
   */
  static async searchUsers(searchTerm, role = null) {
    return await UserDomain.searchUsers(searchTerm, role);
  }

  /**
   * Get all users (Operator only)
   */
  static async getAllUsers() {
    return await UserDomain.getUsersByRole(null);
  }

  /**
   * Get user by ID (Operator only)
   */
  static async getUserById(userId) {
    return await UserDomain.getProfile(userId);
  }

  /**
   * Admin update user (Operator only)
   */
  static async adminUpdateUser(userId, data) {
    return await UserDomain.updateProfile(userId, data);
  }

  /**
   * Delete user (Operator only)
   */
  static async deleteUser(userId) {
    const User = (await import("../schemas/UserSchema.js")).default;
    const user = await User.findByIdAndDelete(userId);
    
    if (!user) {
      throw new Error("User not found");
    }

    return {
      message: "User deleted successfully",
      user
    };
  }
}
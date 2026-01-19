import User from "../schemas/UserSchema.js";
import { generateToken } from "../utils/jwt.js";

export default class AuthService {
  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Object} - Created user and token
   */
  static async register({ name, email, password, role = "player" }) {
    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { name: name }] // Changed: query by 'name' field but compare with 'username' param
    });
    
    if (existingUser) {
      if (existingUser.email === email) {
        throw new Error("Email already registered");
      }
      if (existingUser.name === name) { // Changed: compare with username
        throw new Error("Username already taken");
      }
    }

    // Validate role
    const validRoles = ["player", "leagueOwner", "operator", "advertiser"];
    if (!validRoles.includes(role)) {
      throw new Error("Invalid role");
    }

    // Create user with pending status (requires operator approval)
    const user = new User({
      name: name.replace(/\s+/g, ""), // Changed: use username parameter
      email,
      password,
      role,
      status: "pending" // All users require operator approval
    });

    await user.save();

    // Don't generate token for pending users
    if (user.status === "pending") {
      return {
        message: "Registration successful. Awaiting operator approval.",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status
        }
      };
    }

    // Generate token for active users
    const token = generateToken(user);

    return {
      message: "Registration successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status
      },
      token
    };
  }

  /**
   * Login user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Object} - User and token
   */
  static async login(email, password) {
    // Find user by email
    const user = await User.findOne({ email });
    
    if (!user) {
      throw new Error("Invalid email or password");
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      throw new Error("Invalid email or password");
    }

    // Check if user is active
    if (user.status !== "active") {
      throw new Error(`Account is ${user.status}. Please contact administrator.`);
    }

    // Generate token
    const token = generateToken(user);

    return {
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status
      },
      token
    };
  }

  /**
   * Get current user profile
   * @param {string} userId - User ID from token
   * @returns {Object} - User profile
   */
  static async getProfile(userId) {
    const user = await User.findById(userId)
      .populate("advertiserProfile")
      .populate("leagues")
      .populate("tournaments")
      .select("-password");

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  }

  /**
   * Logout user (client-side will clear token)
   * @returns {Object} - Success message
   */
  static async logout() {
    return {
      message: "Logout successful"
    };
  }

  /**
   * Change user password
   * @param {string} userId - User ID
   * @param {string} oldPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Object} - Success message
   */
  static async changePassword(userId, oldPassword, newPassword) {
    const user = await User.findById(userId);
    
    if (!user) {
      throw new Error("User not found");
    }

    // Verify old password
    const isPasswordValid = await user.comparePassword(oldPassword);
    
    if (!isPasswordValid) {
      throw new Error("Current password is incorrect");
    }

    // Validate new password
    if (newPassword.length < 6) {
      throw new Error("New password must be at least 6 characters");
    }

    // Update password (will be hashed by pre-save middleware)
    user.password = newPassword;
    await user.save();

    return {
      message: "Password changed successfully"
    };
  }
}
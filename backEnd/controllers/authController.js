// backend/controllers/authController.js
import AuthService from "../services/authService.js";

/**
 * Register a new user
 * POST /api/auth/register
 */
export const register = async (req, res) => {
  try {
    const { name, email, password, role, companyName } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ 
        message: "Name, email, and password are required" 
      });
    }

    const result = await AuthService.register({ 
      name, 
      email, 
      password, 
      role,
      companyName
    });

    // Set token in cookie if provided
    if (result.token) {
      res.cookie("token", result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });
    }

    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ 
      message: err.message 
    });
  }
};

/**
 * Login user
 * POST /api/auth/login
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ 
        message: "Email and password are required" 
      });
    }

    const result = await AuthService.login(email, password);

    // Set token in cookie
    res.cookie("token", result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json(result);
  } catch (err) {
    res.status(401).json({ 
      message: err.message 
    });
  }
};

/**
 * Logout user
 * POST /api/auth/logout
 */
export const logout = async (req, res) => {
  try {
    // Clear token cookie
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict"
    });

    const result = await AuthService.logout();
    res.json(result);
  } catch (err) {
    res.status(500).json({ 
      message: err.message 
    });
  }
};

/**
 * Get current user profile
 * GET /api/auth/me
 */
export const getMe = async (req, res) => {
  try {
    const user = await AuthService.getProfile(req.user._id);
    res.json(user);
  } catch (err) {
    res.status(404).json({ 
      message: err.message 
    });
  }
};

/**
 * Change password
 * POST /api/auth/change-password
 */
export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    // Validate input
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ 
        message: "Old password and new password are required" 
      });
    }

    const result = await AuthService.changePassword(
      req.user._id,
      oldPassword,
      newPassword
    );

    res.json(result);
  } catch (err) {
    res.status(400).json({ 
      message: err.message 
    });
  }
};
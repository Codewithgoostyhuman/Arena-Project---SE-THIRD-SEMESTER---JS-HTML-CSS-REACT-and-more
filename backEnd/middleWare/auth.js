import { verifyToken } from '../utils/jwt.js';
import mongoose from 'mongoose';

export const authenticate = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    // Get User model dynamically (after it's been registered)
    const User = mongoose.models.User || mongoose.model('User');
    const user = await User.findById(decoded._id);

    if (!user || user.status !== 'active') {
      return res.status(401).json({ message: 'User not found or inactive' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Authentication failed' });
  }
};

export const Roles = {
  OPERATOR: 'operator',
  LEAGUE_OWNER: 'leagueOwner',
  PLAYER: 'player',
  ADVERTISER: 'advertiser', // ADD THIS LINE!
};

export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'Access denied. Insufficient permissions.',
        userRole: req.user.role, // Add this for debugging
        allowedRoles: allowedRoles // Add this for debugging
      });
    }

    next();
  };
};
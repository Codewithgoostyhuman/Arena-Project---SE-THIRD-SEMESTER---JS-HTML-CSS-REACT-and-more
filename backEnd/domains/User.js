// backend/domains/User.js
import User from "../schemas/UserSchema.js";

export default class UserDomain {
  
  /* ===============================
     PROFILE MANAGEMENT
  =============================== */
  
  // Fetch a user's profile
  static async getProfile(userId) {
    const user = await User.findById(userId)
      .populate('advertiserProfile')
      .populate('leagues')
      .populate('tournaments')
      .select('-password');
    
    if (!user) throw new Error('User not found');
    return user;
  }

  // Update a user's profile
  static async updateProfile(userId, data) {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    // Prevent updating sensitive fields
    delete data.password;
    delete data.role;
    delete data.status;

    Object.assign(user, data);
    await user.save();
    
    // Return user without password
    return await User.findById(userId).select('-password');
  }

  // Change password
  static async changePassword(userId, oldPassword, newPassword) {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    // Check old password
    const valid = await user.comparePassword(oldPassword);
    if (!valid) throw new Error('Old password is incorrect');

    user.password = newPassword;
    await user.save();
    return { message: 'Password changed successfully' };
  }

  /* ===============================
     ROLE-SPECIFIC QUERIES
  =============================== */
  
  static async getUsersByRole(role) {
    const validRoles = ['player', 'league_owner', 'operator', 'advertiser'];
    if (!validRoles.includes(role)) {
      throw new Error('Invalid role');
    }
    
    return await User.find({ role })
      .populate('advertiserProfile')
      .populate('leagues')
      .populate('tournaments')
      .select('-password')
      .sort({ createdAt: -1 });
  }

  static async getActiveUsers(role = null) {
    let query = { status: 'active' };
    if (role) query.role = role;
    
    return await User.find(query)
      .populate('advertiserProfile')
      .select('-password')
      .sort({ createdAt: -1 });
  }

  /* ===============================
     USER STATISTICS
  =============================== */
  
  static async getUserStatistics(userId) {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    const stats = {
      basicInfo: {
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status
      }
    };

    // Role-specific statistics
    switch (user.role) {
      case 'player':
        stats.playerStats = {
          wins: user.stats.wins,
          losses: user.stats.losses,
          draws: user.stats.draws,
          points: user.stats.points,
          winRate: user.stats.wins + user.stats.losses > 0
            ? ((user.stats.wins / (user.stats.wins + user.stats.losses)) * 100).toFixed(1)
            : 0
        };
        break;
        
      case 'league_owner':
        stats.leagueOwnerStats = {
          totalLeagues: user.leagues.length,
          totalTournaments: user.tournaments.length
        };
        break;
        
      case 'advertiser':
        if (user.advertiserProfile) {
          const Advertiser = (await import('../schemas/AdvertiserSchema.js')).default;
          const advertiserProfile = await Advertiser.findById(user.advertiserProfile);
          stats.advertiserStats = {
            sponsoredTournaments: advertiserProfile.sponsoredTournaments.length,
            pendingRequests: advertiserProfile.sponsorshipRequests.filter(
              r => r.status === 'pending'
            ).length
          };
        }
        break;
    }

    return stats;
  }

  /* ===============================
     SEARCH & FILTER
  =============================== */
  
  static async searchUsers(searchTerm, role = null) {
    let query = {
      $or: [
        { name: { $regex: searchTerm, $options: 'i' } },
        { email: { $regex: searchTerm, $options: 'i' } }
      ]
    };
    
    if (role) query.role = role;
    
    return await User.find(query)
      .select('-password')
      .limit(50)
      .sort({ createdAt: -1 });
  }
}
// backend/domains/Operator.js
import User from "../schemas/UserSchema.js";
import Advertiser from "../schemas/AdvertiserSchema.js";
import Game from "../schemas/GameSchema.js";
import RatingFormula from "../schemas/RatingFormulaSchema.js";

export default class Operator {

  /* ===============================
     USER MANAGEMENT
  =============================== */
  
  static async getAllUsers(role = null, status = null) {
    let query = {};
    if (role) query.role = role;
    if (status) query.status = status;
    
    return await User.find(query)
      .populate('advertiserProfile')
      .populate('leagues')
      .populate('tournaments')
      .select('-password')
      .sort({ createdAt: -1 });
  }

  static async getUserById(id) {
    const user = await User.findById(id)
      .populate('advertiserProfile')
      .populate('leagues')
      .populate('tournaments')
      .select('-password');
    
    if (!user) throw new Error("User not found");
    return user;
  }

  static async updateUser(id, data) {
    // Prevent certain fields from being updated
    delete data.password; // Use separate method for password
    delete data.role; // Use separate method for role changes
    
    const user = await User.findByIdAndUpdate(id, data, { new: true })
      .select('-password');
    
    if (!user) throw new Error("User not found");
    return user;
  }

  static async deleteUser(id) {
    const user = await User.findById(id);
    if (!user) throw new Error("User not found");
    
    // If user is an advertiser, also delete advertiser profile
    if (user.role === 'advertiser' && user.advertiserProfile) {
      await Advertiser.findByIdAndDelete(user.advertiserProfile);
    }
    
    await User.findByIdAndDelete(id);
    return { message: "User deleted successfully" };
  }

  static async activateUserById(id) {
    const user = await User.findByIdAndUpdate(
      id, 
      { status: "active" }, 
      { new: true }
    ).select('-password');
    
    if (!user) throw new Error("User not found");
    return user;
  }

  static async deactivateUserById(id) {
    const user = await User.findByIdAndUpdate(
      id, 
      { status: "inactive" }, 
      { new: true }
    ).select('-password');
    
    if (!user) throw new Error("User not found");
    return user;
  }

  static async activateUserByName(name) {
    const cleanedName = name.replace(/\s+/g, "");
    const user = await User.findOneAndUpdate(
      { name: cleanedName }, 
      { status: "active" }, 
      { new: true }
    ).select('-password');
    
    if (!user) throw new Error("User not found");
    return user;
  }

  static async changeUserRole(id, newRole) {
    const validRoles = ['player', 'league_owner', 'operator', 'advertiser'];
    if (!validRoles.includes(newRole)) {
      throw new Error("Invalid role");
    }
    
    const user = await User.findById(id);
    if (!user) throw new Error("User not found");
    
    const oldRole = user.role;
    user.role = newRole;
    
    // If changing to advertiser, create advertiser profile if it doesn't exist
    if (newRole === 'advertiser' && !user.advertiserProfile) {
      const advertiser = new Advertiser({
        user: user._id,
        companyName: user.name || 'Unknown Company',
        accountId: `ADV-${Date.now()}`
      });
      await advertiser.save();
      user.advertiserProfile = advertiser._id;
    }
    
    await user.save();
    
    return {
      user: user.toJSON(),
      message: `Role changed from ${oldRole} to ${newRole}`
    };
  }

  /* ===============================
     GAME MANAGEMENT
  =============================== */
  
  static async createGame(data) {
    const game = new Game(data);
    return await game.save();
  }

  static async updateGame(id, data) {
    const game = await Game.findByIdAndUpdate(id, data, { new: true });
    if (!game) throw new Error("Game not found");
    return game;
  }

  static async deleteGame(id) {
    const game = await Game.findByIdAndDelete(id);
    if (!game) throw new Error("Game not found");
    return { message: "Game deleted successfully", game };
  }

  static async getGameById(id) {
    const game = await Game.findById(id);
    if (!game) throw new Error("Game not found");
    return game;
  }

  static async getAllGames() {
    return await Game.find();
  }

  /* ===============================
     RATING FORMULA MANAGEMENT
  =============================== */
  
  static async createRatingFormula(data) {
    const formula = new RatingFormula(data);
    return await formula.save();
  }

  static async updateRatingFormula(id, data) {
    const formula = await RatingFormula.findByIdAndUpdate(id, data, { new: true });
    if (!formula) throw new Error("Rating formula not found");
    return formula;
  }

  static async deleteRatingFormula(id) {
    const formula = await RatingFormula.findByIdAndDelete(id);
    if (!formula) throw new Error("Rating formula not found");
    return { message: "Rating formula deleted successfully", formula };
  }

  static async getRatingFormulaById(id) {
    const formula = await RatingFormula.findById(id);
    if (!formula) throw new Error("Rating formula not found");
    return formula;
  }

  static async getAllRatingFormulas() {
    return await RatingFormula.find();
  }

  /* ===============================
     ADVERTISER APPROVAL (for operators)
  =============================== */
  
  static async approveAdvertiser(userId) {
    const user = await User.findOne({ _id: userId, role: 'advertiser' });
    if (!user) throw new Error("Advertiser not found");
    
    user.status = "active";
    await user.save();
    
    return user;
  }

  static async rejectAdvertiser(userId) {
    const user = await User.findOne({ _id: userId, role: 'advertiser' });
    if (!user) throw new Error("Advertiser not found");
    
    user.status = "rejected";
    await user.save();
    
    return user;
  }

  static async getPendingAdvertisers() {
    return await User.find({ 
      role: 'advertiser', 
      status: 'pending' 
    })
      .populate('advertiserProfile')
      .select('-password');
  }

  /* ===============================
     STATISTICS & ANALYTICS
  =============================== */
  
  static async getSystemStatistics() {
    const totalUsers = await User.countDocuments();
    const playerCount = await User.countDocuments({ role: 'player' });
    const leagueOwnerCount = await User.countDocuments({ role: 'league_owner' });
    const advertiserCount = await User.countDocuments({ role: 'advertiser' });
    const operatorCount = await User.countDocuments({ role: 'operator' });
    
    const activeUsers = await User.countDocuments({ status: 'active' });
    const pendingUsers = await User.countDocuments({ status: 'pending' });
    
    return {
      totalUsers,
      usersByRole: {
        players: playerCount,
        leagueOwners: leagueOwnerCount,
        advertisers: advertiserCount,
        operators: operatorCount
      },
      usersByStatus: {
        active: activeUsers,
        pending: pendingUsers,
        inactive: totalUsers - activeUsers - pendingUsers
      }
    };
  }
}
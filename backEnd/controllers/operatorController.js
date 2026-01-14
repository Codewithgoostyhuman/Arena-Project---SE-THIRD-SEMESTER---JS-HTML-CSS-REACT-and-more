// backend/controllers/operatorController.js
// Debug version with extensive logging

// IMPORTANT: Update these paths to match YOUR project structure
// If your models are in 'schemas' folder, change to:
// import User from '../schemas/UserSchema.js';
// import Game from '../schemas/GameSchema.js';

import User from '../schemas/UserSchema.js';
import Game from '../schemas/GameSchema.js';

// ==================== DASHBOARD STATISTICS ====================

export const getDashboardStats = async (req, res) => {
    console.log('📊 getDashboardStats called');
    try {
        console.log('Fetching dashboard statistics...');
        
        const pendingUsers = await User.countDocuments({ status: 'pending' });
        console.log('Pending users:', pendingUsers);
        
        const totalUsers = await User.countDocuments();
        console.log('Total users:', totalUsers);
        
        const activeUsers = await User.countDocuments({ status: 'active' });
        console.log('Active users:', activeUsers);
        
        const totalGames = await Game.countDocuments();
        console.log('Total games:', totalGames);

        const stats = {
            pendingUsers,
            totalUsers,
            activeUsers,
            totalGames,
            activeLeagues: 0, // Set to 0 if League model doesn't exist
            totalTournaments: 0,
            activeTournaments: 0
        };

        console.log('Sending stats:', stats);
        res.json(stats);
    } catch (error) {
        console.error('❌ Error in getDashboardStats:', error);
        res.status(500).json({ 
            message: 'Failed to fetch dashboard statistics',
            error: error.message 
        });
    }
};

export const getSystemStatistics = async (req, res) => {
    console.log('📊 getSystemStatistics called');
    try {
        const stats = {
            users: {
                total: await User.countDocuments(),
                active: await User.countDocuments({ status: 'active' }),
                pending: await User.countDocuments({ status: 'pending' }),
                inactive: await User.countDocuments({ status: 'inactive' }),
                byRole: {
                    player: await User.countDocuments({ role: 'player' }),
                    leagueOwner: await User.countDocuments({ role: 'leagueOwner' }),
                    operator: await User.countDocuments({ role: 'operator' }),
                    advertiser: await User.countDocuments({ role: 'advertiser' })
                }
            },
            games: {
                total: await Game.countDocuments()
            },
            leagues: {
                total: 0,
                active: 0
            },
            tournaments: {
                total: 0,
                active: 0
            }
        };

        console.log('Sending system stats:', stats);
        res.json(stats);
    } catch (error) {
        console.error('❌ Error in getSystemStatistics:', error);
        res.status(500).json({ message: 'Failed to fetch system statistics' });
    }
};

// ==================== USER MANAGEMENT ====================

export const getAllUsers = async (req, res) => {
    console.log('👥 getAllUsers called');
    console.log('Query params:', req.query);
    try {
        const { role, status } = req.query;
        const filter = {};
        
        if (role) filter.role = role;
        if (status) filter.status = status;

        console.log('Filter:', filter);
        
        const users = await User.find(filter).select('-password').sort({ createdAt: -1 });
        console.log(`Found ${users.length} users`);
        
        res.json(users);
    } catch (error) {
        console.error('❌ Error in getAllUsers:', error);
        res.status(500).json({ message: 'Failed to fetch users' });
    }
};

export const getPendingUsers = async (req, res) => {
    console.log('⏳ getPendingUsers called');
    try {
        const users = await User.find({ status: 'pending' }).select('-password').sort({ createdAt: -1 });
        console.log(`Found ${users.length} pending users`);
        res.json(users);
    } catch (error) {
        console.error('❌ Error in getPendingUsers:', error);
        res.status(500).json({ message: 'Failed to fetch pending users' });
    }
};

export const getActiveUsers = async (req, res) => {
    console.log('✅ getActiveUsers called');
    try {
        const users = await User.find({ status: 'active' }).select('-password').sort({ createdAt: -1 });
        console.log(`Found ${users.length} active users`);
        res.json(users);
    } catch (error) {
        console.error('❌ Error in getActiveUsers:', error);
        res.status(500).json({ message: 'Failed to fetch active users' });
    }
};

export const getUserById = async (req, res) => {
    console.log('🔍 getUserById called, ID:', req.params.id);
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            console.log('User not found');
            return res.status(404).json({ message: 'User not found' });
        }
        console.log('User found:', user.email);
        res.json(user);
    } catch (error) {
        console.error('❌ Error in getUserById:', error);
        res.status(500).json({ message: 'Failed to fetch user' });
    }
};

export const updateUser = async (req, res) => {
    console.log('✏️ updateUser called, ID:', req.params.id);
    console.log('Update data:', req.body);
    try {
        const { name, email, role, status } = req.body;
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { name, email, role, status },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        console.log('User updated:', user.email);
        res.json({ message: 'User updated successfully', user });
    } catch (error) {
        console.error('❌ Error in updateUser:', error);
        res.status(500).json({ message: 'Failed to update user' });
    }
};

export const deleteUser = async (req, res) => {
    console.log('🗑️ deleteUser called, ID:', req.params.id);
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        console.log('User deleted:', user.email);
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('❌ Error in deleteUser:', error);
        res.status(500).json({ message: 'Failed to delete user' });
    }
};

export const activateUserById = async (req, res) => {
    console.log('🟢 activateUserById called, ID:', req.params.id);
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { status: 'active' },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        console.log('User activated:', user.email);
        res.json({ message: 'User activated successfully', user });
    } catch (error) {
        console.error('❌ Error in activateUserById:', error);
        res.status(500).json({ message: 'Failed to activate user' });
    }
};

export const deactivateUserById = async (req, res) => {
    console.log('🔴 deactivateUserById called, ID:', req.params.id);
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { status: 'inactive' },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        console.log('User deactivated:', user.email);
        res.json({ message: 'User deactivated successfully', user });
    } catch (error) {
        console.error('❌ Error in deactivateUserById:', error);
        res.status(500).json({ message: 'Failed to deactivate user' });
    }
};

export const activateUserByName = async (req, res) => {
    console.log('🟢 activateUserByName called, Name:', req.params.name);
    try {
        const user = await User.findOneAndUpdate(
            { name: req.params.name },
            { status: 'active' },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        console.log('User activated:', user.email);
        res.json({ message: 'User activated successfully', user });
    } catch (error) {
        console.error('❌ Error in activateUserByName:', error);
        res.status(500).json({ message: 'Failed to activate user' });
    }
};

export const changeUserRole = async (req, res) => {
    console.log('🔄 changeUserRole called, ID:', req.params.id);
    console.log('New role:', req.body.newRole);
    try {
        const { newRole } = req.body;
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { role: newRole },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        console.log('User role changed:', user.email, '→', newRole);
        res.json({ message: 'User role changed successfully', user });
    } catch (error) {
        console.error('❌ Error in changeUserRole:', error);
        res.status(500).json({ message: 'Failed to change user role' });
    }
};

export const approveUser = async (req, res) => {
    console.log('✅ approveUser called, ID:', req.params.id);
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { status: 'active' },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        console.log('User approved:', user.email);
        res.json({ message: 'User approved successfully', user });
    } catch (error) {
        console.error('❌ Error in approveUser:', error);
        res.status(500).json({ message: 'Failed to approve user' });
    }
};

export const rejectUser = async (req, res) => {
    console.log('❌ rejectUser called, ID:', req.params.id);
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { status: 'rejected' },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        console.log('User rejected:', user.email);
        res.json({ message: 'User rejected successfully', user });
    } catch (error) {
        console.error('❌ Error in rejectUser:', error);
        res.status(500).json({ message: 'Failed to reject user' });
    }
};

export const bulkApproveUsers = async (req, res) => {
    console.log('✅ bulkApproveUsers called');
    console.log('User IDs:', req.body.userIds);
    try {
        const { userIds } = req.body;
        await User.updateMany(
            { _id: { $in: userIds } },
            { status: 'active' }
        );

        console.log(`Approved ${userIds.length} users`);
        res.json({ message: 'Users approved successfully' });
    } catch (error) {
        console.error('❌ Error in bulkApproveUsers:', error);
        res.status(500).json({ message: 'Failed to approve users' });
    }
};

// ==================== GAME MANAGEMENT ====================

export const getAllGames = async (req, res) => {
    console.log('🎮 getAllGames called');
    try {
        const games = await Game.find().sort({ createdAt: -1 });
        console.log(`Found ${games.length} games`);
        res.json(games);
    } catch (error) {
        console.error('❌ Error in getAllGames:', error);
        res.status(500).json({ message: 'Failed to fetch games' });
    }
};

export const getGameById = async (req, res) => {
    console.log('🔍 getGameById called, ID:', req.params.id);
    try {
        const game = await Game.findById(req.params.id);
        if (!game) {
            console.log('Game not found');
            return res.status(404).json({ message: 'Game not found' });
        }
        console.log('Game found:', game.name);
        res.json(game);
    } catch (error) {
        console.error('❌ Error in getGameById:', error);
        res.status(500).json({ message: 'Failed to fetch game' });
    }
};

export const createGame = async (req, res) => {
    console.log('➕ createGame called');
    console.log('Game data:', req.body);
    try {
        const { name, description, type, minPlayers, maxPlayers, rules } = req.body;
        
        const game = await Game.create({
            name,
            description,
            type,
            minPlayers,
            maxPlayers,
            rules,
            status: 'active'
        });

        console.log('Game created:', game.name);
        res.status(201).json({ message: 'Game created successfully', game });
    } catch (error) {
        console.error('❌ Error in createGame:', error);
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Game already exists' });
        }
        res.status(500).json({ message: 'Failed to create game', error: error.message });
    }
};

export const updateGame = async (req, res) => {
    console.log('✏️ updateGame called, ID:', req.params.id);
    console.log('Update data:', req.body);
    try {
        const { name, description, type, minPlayers, maxPlayers, rules } = req.body;
        const game = await Game.findByIdAndUpdate(
            req.params.id,
            { name, description, type, minPlayers, maxPlayers, rules },
            { new: true, runValidators: true }
        );

        if (!game) {
            return res.status(404).json({ message: 'Game not found' });
        }

        console.log('Game updated:', game.name);
        res.json({ message: 'Game updated successfully', game });
    } catch (error) {
        console.error('❌ Error in updateGame:', error);
        res.status(500).json({ message: 'Failed to update game' });
    }
};

export const deleteGame = async (req, res) => {
    console.log('🗑️ deleteGame called, ID:', req.params.id);
    try {
        const game = await Game.findByIdAndDelete(req.params.id);
        if (!game) {
            return res.status(404).json({ message: 'Game not found' });
        }
        console.log('Game deleted:', game.name);
        res.json({ message: 'Game deleted successfully' });
    } catch (error) {
        console.error('❌ Error in deleteGame:', error);
        res.status(500).json({ message: 'Failed to delete game' });
    }
};

// ==================== ADVERTISER MANAGEMENT ====================

export const getPendingAdvertisers = async (req, res) => {
    console.log('📢 getPendingAdvertisers called');
    try {
        const advertisers = await User.find({ 
            role: 'advertiser', 
            status: 'pending' 
        }).select('-password').sort({ createdAt: -1 });
        
        console.log(`Found ${advertisers.length} pending advertisers`);
        res.json(advertisers);
    } catch (error) {
        console.error('❌ Error in getPendingAdvertisers:', error);
        res.status(500).json({ message: 'Failed to fetch pending advertisers' });
    }
};

export const approveAdvertiser = async (req, res) => {
    console.log('✅ approveAdvertiser called, ID:', req.params.id);
    try {
        const advertiser = await User.findOneAndUpdate(
            { _id: req.params.id, role: 'advertiser' },
            { status: 'active' },
            { new: true }
        ).select('-password');

        if (!advertiser) {
            return res.status(404).json({ message: 'Advertiser not found' });
        }

        console.log('Advertiser approved:', advertiser.email);
        res.json({ message: 'Advertiser approved successfully', advertiser });
    } catch (error) {
        console.error('❌ Error in approveAdvertiser:', error);
        res.status(500).json({ message: 'Failed to approve advertiser' });
    }
};

export const rejectAdvertiser = async (req, res) => {
    console.log('❌ rejectAdvertiser called, ID:', req.params.id);
    try {
        const advertiser = await User.findOneAndUpdate(
            { _id: req.params.id, role: 'advertiser' },
            { status: 'rejected' },
            { new: true }
        ).select('-password');

        if (!advertiser) {
            return res.status(404).json({ message: 'Advertiser not found' });
        }

        console.log('Advertiser rejected:', advertiser.email);
        res.json({ message: 'Advertiser rejected successfully', advertiser });
    } catch (error) {
        console.error('❌ Error in rejectAdvertiser:', error);
        res.status(500).json({ message: 'Failed to reject advertiser' });
    }
};

// ==================== RATING FORMULA MANAGEMENT ====================

export const getAllRatingFormulas = async (req, res) => {
    console.log('📊 getAllRatingFormulas called');
    try {
        // Import RatingFormula model
        const RatingFormula = (await import('../schemas/RatingFormulaSchema.js')).default;
        
        const formulas = await RatingFormula.find().sort({ createdAt: -1 });
        console.log(`Found ${formulas.length} rating formulas`);
        res.json(formulas);
    } catch (error) {
        console.error('❌ Error in getAllRatingFormulas:', error);
        res.status(500).json({ message: 'Failed to fetch rating formulas' });
    }
};

export const getRatingFormulaById = async (req, res) => {
    console.log('📊 getRatingFormulaById called, ID:', req.params.id);
    try {
        const RatingFormula = (await import('../schemas/RatingFormulaSchema.js')).default;
        
        const formula = await RatingFormula.findById(req.params.id);
        if (!formula) {
            console.log('Rating formula not found');
            return res.status(404).json({ message: 'Rating formula not found' });
        }
        console.log('Rating formula found:', formula.name);
        res.json(formula);
    } catch (error) {
        console.error('❌ Error in getRatingFormulaById:', error);
        res.status(500).json({ message: 'Failed to fetch rating formula' });
    }
};

export const createRatingFormula = async (req, res) => {
    console.log('➕ createRatingFormula called');
    console.log('Formula data:', req.body);
    try {
        const RatingFormula = (await import('../schemas/RatingFormulaSchema.js')).default;
        
        const { name, description, winnerScore, loserScore, drawScore, isDefault } = req.body;
        
        // If setting as default, unset other defaults
        if (isDefault) {
            await RatingFormula.updateMany({}, { isDefault: false });
        }
        
        const formula = await RatingFormula.create({
            name,
            description,
            winnerScore,
            loserScore,
            drawScore,
            isDefault: isDefault || false,
            status: 'active'
        });

        console.log('Rating formula created:', formula.name);
        res.status(201).json({ message: 'Rating formula created successfully', formula });
    } catch (error) {
        console.error('❌ Error in createRatingFormula:', error);
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Rating formula with this name already exists' });
        }
        res.status(500).json({ 
            message: 'Failed to create rating formula',
            error: error.message 
        });
    }
};

export const updateRatingFormula = async (req, res) => {
    console.log('✏️ updateRatingFormula called, ID:', req.params.id);
    console.log('Update data:', req.body);
    try {
        const RatingFormula = (await import('../schemas/RatingFormulaSchema.js')).default;
        
        const { name, description, winnerScore, loserScore, drawScore, isDefault } = req.body;
        
        // If setting as default, unset other defaults
        if (isDefault) {
            await RatingFormula.updateMany(
                { _id: { $ne: req.params.id } }, 
                { isDefault: false }
            );
        }
        
        const formula = await RatingFormula.findByIdAndUpdate(
            req.params.id,
            { name, description, winnerScore, loserScore, drawScore, isDefault },
            { new: true, runValidators: true }
        );

        if (!formula) {
            return res.status(404).json({ message: 'Rating formula not found' });
        }

        console.log('Rating formula updated:', formula.name);
        res.json({ message: 'Rating formula updated successfully', formula });
    } catch (error) {
        console.error('❌ Error in updateRatingFormula:', error);
        res.status(500).json({ message: 'Failed to update rating formula' });
    }
};

export const deleteRatingFormula = async (req, res) => {
    console.log('🗑️ deleteRatingFormula called, ID:', req.params.id);
    try {
        const RatingFormula = (await import('../schemas/RatingFormulaSchema.js')).default;
        
        const formula = await RatingFormula.findById(req.params.id);
        
        if (!formula) {
            return res.status(404).json({ message: 'Rating formula not found' });
        }
        
        // Check if it's the default formula
        if (formula.isDefault) {
            return res.status(400).json({ 
                message: 'Cannot delete the default rating formula. Please set another formula as default first.' 
            });
        }
        
        await RatingFormula.findByIdAndDelete(req.params.id);
        console.log('Rating formula deleted:', formula.name);
        res.json({ message: 'Rating formula deleted successfully' });
    } catch (error) {
        console.error('❌ Error in deleteRatingFormula:', error);
        res.status(500).json({ message: 'Failed to delete rating formula' });
    }
};
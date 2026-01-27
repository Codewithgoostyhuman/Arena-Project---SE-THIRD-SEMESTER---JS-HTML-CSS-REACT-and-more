// backend/controllers/operatorController.js

import User from '../schemas/UserSchema.js';
import Game from '../schemas/GameSchema.js';
import Tournament from '../schemas/TournamentSchema.js';
import League from '../schemas/LeagueSchema.js';

export const getDashboardStats = async (req, res) => {
    try {
        const pendingUsers = await User.countDocuments({ status: 'pending' });
        const totalUsers = await User.countDocuments();
        const activeUsers = await User.countDocuments({ status: 'active' });
        const totalGames = await Game.countDocuments();
        const activeLeagues = await League.countDocuments({ status: 'active' });
        const totalTournaments = await Tournament.countDocuments();
        const activeTournaments = await Tournament.countDocuments({ status: 'ongoing' });

        const stats = {
            pendingUsers,
            totalUsers,
            activeUsers,
            totalGames,
            activeLeagues,
            totalTournaments,
            activeTournaments
        };

        res.json(stats);
    } catch (error) {
        res.status(500).json({ 
            message: 'Failed to fetch dashboard statistics'
        });
    }
};

export const getSystemStatistics = async (req, res) => {
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

        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch system statistics' });
    }
};

// ==================== USER MANAGEMENT ====================

export const getAllUsers = async (req, res) => {
    try {
        const { role, status } = req.query;
        const filter = {};
        
        if (role) filter.role = role;
        if (status) filter.status = status;
        
        const users = await User.find(filter).select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch users' });
    }
};

export const getPendingUsers = async (req, res) => {
    try {
        const users = await User.find({ status: 'pending' }).select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch pending users' });
    }
};

export const getActiveUsers = async (req, res) => {
    try {
        const users = await User.find({ status: 'active' }).select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch active users' });
    }
};

export const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch user' });
    }
};

export const updateUser = async (req, res) => {
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

        res.json({ message: 'User updated successfully', user });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update user' });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete user' });
    }
};

export const activateUserById = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { status: 'active' },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ message: 'User activated successfully', user });
    } catch (error) {
        res.status(500).json({ message: 'Failed to activate user' });
    }
};

export const deactivateUserById = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { status: 'inactive' },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ message: 'User deactivated successfully', user });
    } catch (error) {
        res.status(500).json({ message: 'Failed to deactivate user' });
    }
};

export const activateUserByName = async (req, res) => {
    try {
        const user = await User.findOneAndUpdate(
            { name: req.params.name },
            { status: 'active' },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ message: 'User activated successfully', user });
    } catch (error) {
        res.status(500).json({ message: 'Failed to activate user' });
    }
};

export const changeUserRole = async (req, res) => {
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

        res.json({ message: 'User role changed successfully', user });
    } catch (error) {
        res.status(500).json({ message: 'Failed to change user role' });
    }
};

export const approveUser = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { status: 'active' },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ message: 'User approved successfully', user });
    } catch (error) {
        res.status(500).json({ message: 'Failed to approve user' });
    }
};

export const rejectUser = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { status: 'rejected' },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ message: 'User rejected successfully', user });
    } catch (error) {
        res.status(500).json({ message: 'Failed to reject user' });
    }
};

export const bulkApproveUsers = async (req, res) => {
    try {
        const { userIds } = req.body;
        await User.updateMany(
            { _id: { $in: userIds } },
            { status: 'active' }
        );

        res.json({ message: 'Users approved successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to approve users' });
    }
};

// ==================== GAME MANAGEMENT ====================

export const getAllGames = async (req, res) => {
    try {
        const games = await Game.find().sort({ createdAt: -1 });
        res.json(games);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch games' });
    }
};

export const getGameById = async (req, res) => {
    try {
        const game = await Game.findById(req.params.id);
        if (!game) {
            return res.status(404).json({ message: 'Game not found' });
        }
        res.json(game);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch game' });
    }
};

export const createGame = async (req, res) => {
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

        res.status(201).json({ message: 'Game created successfully', game });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Game already exists' });
        }
        res.status(500).json({ message: 'Failed to create game' });
    }
};

export const updateGame = async (req, res) => {
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

        res.json({ message: 'Game updated successfully', game });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update game' });
    }
};

export const deleteGame = async (req, res) => {
    try {
        const game = await Game.findByIdAndDelete(req.params.id);
        if (!game) {
            return res.status(404).json({ message: 'Game not found' });
        }
        res.json({ message: 'Game deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete game' });
    }
};

// ==================== ADVERTISER MANAGEMENT ====================

export const getPendingAdvertisers = async (req, res) => {
    try {
        const advertisers = await User.find({ 
            role: 'advertiser', 
            status: 'pending' 
        }).select('-password').sort({ createdAt: -1 });
        
        res.json(advertisers);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch pending advertisers' });
    }
};

export const approveAdvertiser = async (req, res) => {
    try {
        const advertiser = await User.findOneAndUpdate(
            { _id: req.params.id, role: 'advertiser' },
            { status: 'active' },
            { new: true }
        ).select('-password');

        if (!advertiser) {
            return res.status(404).json({ message: 'Advertiser not found' });
        }

        res.json({ message: 'Advertiser approved successfully', advertiser });
    } catch (error) {
        res.status(500).json({ message: 'Failed to approve advertiser' });
    }
};

export const rejectAdvertiser = async (req, res) => {
    try {
        const advertiser = await User.findOneAndUpdate(
            { _id: req.params.id, role: 'advertiser' },
            { status: 'rejected' },
            { new: true }
        ).select('-password');

        if (!advertiser) {
            return res.status(404).json({ message: 'Advertiser not found' });
        }

        res.json({ message: 'Advertiser rejected successfully', advertiser });
    } catch (error) {
        res.status(500).json({ message: 'Failed to reject advertiser' });
    }
};

// ==================== RATING FORMULA MANAGEMENT ====================

export const getAllRatingFormulas = async (req, res) => {
    try {
        const RatingFormula = (await import('../schemas/RatingFormulaSchema.js')).default;
        
        const formulas = await RatingFormula.find().sort({ createdAt: -1 });
        res.json(formulas);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch rating formulas' });
    }
};

export const getRatingFormulaById = async (req, res) => {
    try {
        const RatingFormula = (await import('../schemas/RatingFormulaSchema.js')).default;
        
        const formula = await RatingFormula.findById(req.params.id);
        if (!formula) {
            return res.status(404).json({ message: 'Rating formula not found' });
        }
        res.json(formula);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch rating formula' });
    }
};

export const createRatingFormula = async (req, res) => {
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

        res.status(201).json({ message: 'Rating formula created successfully', formula });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Rating formula with this name already exists' });
        }
        res.status(500).json({ message: 'Failed to create rating formula' });
    }
};

export const updateRatingFormula = async (req, res) => {
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

        res.json({ message: 'Rating formula updated successfully', formula });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update rating formula' });
    }
};

export const deleteRatingFormula = async (req, res) => {
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
        res.json({ message: 'Rating formula deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete rating formula' });
    }
};
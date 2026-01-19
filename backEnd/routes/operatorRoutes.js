// backend/routes/operatorRoutes.js
import express from 'express';
import * as operatorController from '../controllers/operatorController.js';
import { authenticate, authorizeRoles, Roles } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication and operator authorization to all routes
router.use(authenticate);
router.use(authorizeRoles(Roles.OPERATOR));

// ==================== USER MANAGEMENT ROUTES ====================

// Get pending users (awaiting approval)
router.get('/user/pending', operatorController.getPendingUsers);

// Get active users
router.get('/user/active', operatorController.getActiveUsers);

// Get all users with optional filters
router.get('/user',operatorController.getAllUsers);

// Get specific user by ID
router.get('/user/:id', operatorController.getUserById);

// Update user
router.put('/user/:id', operatorController.updateUser);

// Delete user
router.delete('/user/:id', operatorController.deleteUser);

// Activate user by ID
router.patch('/user/activate/:id', operatorController.activateUserById);

// Deactivate user by ID
router.patch('/user/deactivate/:id', operatorController.deactivateUserById);

// Activate user by name
router.patch('/user/activate/name/:name', operatorController.activateUserByName);

// Change user role
router.patch('/user/:id/role',operatorController.changeUserRole);

// Approve user registration
router.patch('/user/approve/:id', operatorController.approveUser);

// Reject user registration
router.patch('/user/reject/:id', operatorController.rejectUser);

// Bulk approve users
router.post('/user/bulk-approve', operatorController.bulkApproveUsers);

// ==================== GAME MANAGEMENT ROUTES ====================

// Get all games
router.get('/games', operatorController.getAllGames);

// Get specific game
router.get('/game/:id', operatorController.getGameById);

// Create new game
router.post('/game', operatorController.createGame);

// Update game
router.put('/game/:id', operatorController.updateGame);

// Delete game
router.delete('/game/:id', operatorController.deleteGame);

// ==================== RATING FORMULA ROUTES ====================

// Get all rating formulas
router.get('/rating-formulas', operatorController.getAllRatingFormulas);

// Get specific rating formula
router.get('/rating-formula/:id', operatorController.getRatingFormulaById);

// Create new rating formula
router.post('/rating-formula', operatorController.createRatingFormula);

// Update rating formula
router.put('/rating-formula/:id', operatorController.updateRatingFormula);

// Delete rating formula
router.delete('/rating-formula/:id',operatorController.deleteRatingFormula);

// ==================== ADVERTISER MANAGEMENT ROUTES ====================

// Get pending advertisers
router.get('/advertiser/pending', operatorController.getPendingAdvertisers);

// Approve advertiser
router.patch('/advertiser/approve/:id', operatorController.approveAdvertiser);

// Reject advertiser
router.patch('/advertiser/reject/:id', operatorController.rejectAdvertiser);

// ==================== STATISTICS ROUTES ====================

// Get system statistics
router.get('/statistics', operatorController.getSystemStatistics);

// Get dashboard statistics
router.get('/dashboard-stats',operatorController.getDashboardStats);

export default router;
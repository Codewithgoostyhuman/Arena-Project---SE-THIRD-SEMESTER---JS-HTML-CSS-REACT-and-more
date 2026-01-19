// backend/routes/index.js
import express from "express";

// Import all route files
import authRoutes from './authRoutes.js'
import userRoutes from "./userRoutes.js";
import playerRoutes from "./playerRoutes.js";
import leagueOwnerRoutes from "./leagueOwnerRoutes.js";
import operatorRoutes from "./operatorRoutes.js";
import leagueRoutes from "./leagueRoutes.js";
import gameRoutes from "./gameRoutes.js";
import tournamentRoutes from "./tournamentRoutes.js";
import matchRoutes from "./matchRoutes.js";
import ratingFormulaRoutes from "./ratingFormulaRoutes.js";
import tournamentStyleRoutes from "./tournamentStyleRoutes.js";
import advertiserRoutes from "./advertiserRoutes.js";
import advertisementRoutes from "./advertismentRoutes.js";
import accountRoutes from "./accountRoutes.js";
import interestGroupRoutes from "./interestGroupRoutes.js";
import arenaRoutes from "./arenaRoutes.js";
import publicRoutes from "./publicRoutes.js";
import notificationRoutes from "./notificationRoutes.js";
import socketMiddleware from "../middleware/socketMiddleWare.js";
const router = express.Router();
// Make Socket.IO available in all routes
router.use(socketMiddleware);
// ==========================================
// MOUNT ALL ROUTES WITH PROPER PREFIXES
// ==========================================

/**
 * Authentication routes
 * /api/auth/*
 */
router.use("/auth", authRoutes);

/**
 * User routes
 * /api/users/*
 */
router.use("/users", userRoutes);

/**
 * Player routes
 * /api/players/*
 */
router.use("/players", playerRoutes);

/**
 * League Owner routes
 * /api/league-owners/*
 */
router.use("/league-owners", leagueOwnerRoutes);

/**
 * Operator routes
 * /api/operator/*
 */
router.use("/operator", operatorRoutes);

/**
 * League routes
 * /api/leagues/*
 */
router.use("/leagues", leagueRoutes);

/**
 * Game routes
 * /api/games/*
 */
router.use("/games", gameRoutes);

/**
 * Tournament routes
 * /api/tournaments/*
 */
router.use("/tournaments", tournamentRoutes);

/**
 * Match routes
 * /api/matches/*
 */
router.use("/matches", matchRoutes);

/**
 * Rating Formula routes
 * /api/rating-formulas/*
 */
router.use("/rating-formulas", ratingFormulaRoutes);

/**
 * Tournament Style routes
 * /api/tournament-styles/*
 */
router.use("/tournament-styles", tournamentStyleRoutes);

/**
 * Advertiser routes
 * /api/advertisers/*
 */
router.use("/advertisers", advertiserRoutes);

/**
 * Advertisement routes
 * /api/advertisements/*
 */
router.use("/advertisements", advertisementRoutes);

/**
 * Account routes
 * /api/accounts/*
 */
router.use("/accounts", accountRoutes);

/**
 * Interest Group routes
 * /api/interest-groups/*
 */
router.use("/interest-groups", interestGroupRoutes);

/**
 * Arena routes
 * /api/arena/*
 */
router.use("/arena", arenaRoutes);

/**
 * Public routes (NO AUTHENTICATION REQUIRED)
 * /api/public/*
 */
router.use("/public", publicRoutes);

/**
 * Notification routes
 * /api/notifications/*
 */
router.use("/notifications", notificationRoutes);

// ==========================================
// HEALTH CHECK ENDPOINT
// ==========================================

/**
 * @route   GET /api/health
 * @desc    Health check endpoint
 * @access  Public
 */
router.get("/health", (req, res) => {
  res.json({
    status: "success",
    message: "ARENA API is running",
    timestamp: new Date().toISOString()
  });
});

// ==========================================
// 404 HANDLER FOR UNDEFINED ROUTES
// ==========================================

router.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: `Route ${req.originalUrl} not found`
  });
});

export default router;
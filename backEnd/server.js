import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import { generateToken } from "./utils/jwt.js";
import { authenticate, authorizeRoles, Roles } from "./middleWare/auth.js";
import User from './schemas/UserSchema.js';
import League from './schemas/LeagueSchema.js';
import Tournament from './schemas/TournamentSchema.js';
import Game from './schemas/GameSchema.js';
import RatingFormula from './schemas/RatingFormulaSchema.js';
import Match from "./schemas/MatchSchema.js"
import Advertiser from './schemas/AdvertiserSchema.js'
import Account from "./schemas/AccountSchema.js";
import Advertisement from './schemas/AdvertisementSchema.js '
dotenv.config();
console.log("server.js file loaded");

const PORT = process.env.PORT || 5000;
const app = express();
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Connect to MongoDB
main().catch((err) => console.log(err));

async function main() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");
  } catch (err) {
    console.log("Error connecting to MongoDB:", err);
  }
}
// ============================================
// PUBLIC SPECTATOR ENDPOINTS
// ============================================

app.get("/matches/live", async (req, res) => {
  try {
    const matches = await Match.find({ status: "live" })
      .populate("league", "name")
      .populate("tournament", "name")
      .populate("players", "name")
      .populate("game", "name")


    res.json(matches);
  } catch (err) {
    console.error("Error fetching live matches:", err);
    res.status(500).json({ message: "Error fetching live matches" });
  }
});
// ============================================
// AUTH ENDPOINTS
// ============================================

// Login user
app.post("/login", async (req, res) => {
  try {
    const { name, password } = req.body;
    
    console.log("=== LOGIN ATTEMPT ===");
    console.log("Request body:", req.body);
    console.log("Request origin:", req.headers.origin);
    console.log("Looking for user:", name);
    
    const user = await User.findOne({ name });
    
    console.log("User found:", user ? "YES" : "NO");
    if (user) {
      console.log("User details:", {
        name: user.name,
        password: user.password,
        status: user.status,
        role: user.role
      });
      console.log("Password match:", user.password === password);
      console.log("Status check:", user.status === "active");
    }

    if (!user || user.password !== password || user.status !== "active") {
      console.log("❌ LOGIN FAILED");
      return res.status(401).json({ message: "Invalid credentials" });
    }

    console.log("✅ LOGIN SUCCESS");
    const token = generateToken(user);
    
    console.log("Generated token:", token); // Debug

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
      path: '/'
    });

    console.log("Cookie should be set with token");
    console.log("Response headers will include Set-Cookie");

    res.json({ message: "Login successful" });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Login error", error: err.message });
  }
});

// Logout user
app.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out successfully" });
});

// Get current user
app.get("/me", authenticate, (req, res) => {
  res.json({ user: req.user });
});

// ============================================
// USER ENDPOINTS (Public)
// ============================================

// Get all users
app.get("/users", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Error fetching users", error: err.message });
  }
});

// Get user by id
app.get("/user/id/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Error fetching user", error: err.message });
  }
});

// Get user by name
app.get("/user/name/:name", async (req, res) => {
  try {
    const user = await User.findOne({ name: req.params.name });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Error fetching user", error: err.message });
  }
});

// ============================================
// USER MANAGEMENT (Auth Required)
// ============================================

// Create a new user (register)
app.post("/register", async (req, res) => {
  try {
    const { name, email, password, role, status } = req.body;

    // Remove spaces from name
    const cleanedName = name.replace(/\s+/g, "");

    // Check if user with same name exists
    const existingUser = await User.findOne({ name: cleanedName });
    if (existingUser) {
      return res.status(409).json({ message: "Username already taken" });
    }

    // Create new user
    const newUser = new User({
      name: cleanedName,
      email,
      password,
      role,
      status,
    });

    const savedUser = await newUser.save();
    res.json(savedUser);
  } catch (err) {
    res.status(500).json({ message: "Error creating user", error: err.message });
  }
});

// Update user
app.put("/user/:id", authenticate, authorizeRoles(Roles.OPERATOR), async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: "Error updating user", error: err.message });
  }
});

// Delete user
app.delete("/user/:id", authenticate, authorizeRoles(Roles.OPERATOR), async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "User deleted successfully", user: deletedUser });
  } catch (err) {
    res.status(500).json({ message: "Error deleting user", error: err.message });
  }
});

// Activate user by ID
app.patch("/user/activate/:id", authenticate, authorizeRoles(Roles.OPERATOR), async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { status: "active" },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "User activated successfully",
      user: updatedUser,
    });
  } catch (err) {
    console.error("Error activating user:", err);
    res.status(500).json({ message: "Error activating user", error: err.message });
  }
});

// Deactivate user by ID
app.patch("/user/deactivate/:id", authenticate, authorizeRoles(Roles.OPERATOR), async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { status: "inactive" },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "User deactivated successfully",
      user: updatedUser,
    });
  } catch (err) {
    console.error("Error deactivating user:", err);
    res.status(500).json({ message: "Error deactivating user", error: err.message });
  }
});

// Activate user by name
app.patch("/user/activate/name/:name", authenticate, authorizeRoles(Roles.OPERATOR), async (req, res) => {
  try {
    const cleanedName = req.params.name.replace(/\s+/g, "");
    
    const updatedUser = await User.findOneAndUpdate(
      { name: cleanedName },
      { status: "active" },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "User activated successfully",
      user: updatedUser,
    });
  } catch (err) {
    console.error("Error activating user:", err);
    res.status(500).json({ message: "Error activating user", error: err.message });
  }
});


// ============================================
// LEAGUE ENDPOINTS
// ============================================

// Get all leagues (public)
app.get("/leagues", async (req, res) => {
  try {
    const leagues = await League.find()
      .populate('owner', 'name email')
      .populate('players', 'name email stats')
      .populate('game', 'name type description') 
      .populate('ratingFormula', 'name winnerScore drawScore loserScore')
      .sort({ createdAt: -1 });
    
    res.json(leagues);
  } catch (err) {
    console.error("Error fetching leagues:", err);
    res.status(500).json({ message: "Error fetching leagues", error: err.message });
  }
});

// Get leagues by owner (league owner's own leagues)
app.get("/leagues/my-leagues", authenticate, authorizeRoles(Roles.LEAGUE_OWNER), async (req, res) => {
  try {
    const leagues = await League.find({ owner: req.user._id })
      .populate('players', 'name email stats')
      .populate('game', 'name type description') 
      .populate('ratingFormula', 'name winnerScore drawScore loserScore')
      .populate('applications.player', 'name email') 
      .sort({ createdAt: -1 });
    
    res.json(leagues);
  } catch (err) {
    console.error("Error fetching leagues:", err);
    res.status(500).json({ message: "Error fetching your leagues", error: err.message });
  }
});

// Get league by id
app.get("/league/:id", async (req, res) => {
  try {
    const league = await League.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('players', 'name email stats')
      .populate('game', 'name type description')
      .populate('ratingFormula', 'name winnerScore drawScore loserScore')
      .populate('applications.player', 'name email'); 
    
    if (!league) return res.status(404).json({ message: "League not found" });
    res.json(league);
  } catch (err) {
    console.error("Error fetching league:", err);
    res.status(500).json({ message: "Error fetching league", error: err.message });
  }
});

// Create new league (League Owner only)
app.post("/league", authenticate, authorizeRoles(Roles.LEAGUE_OWNER), async (req, res) => {
   console.log("=== CREATE LEAGUE ===");
  console.log("User role:", req.user?.role);
  console.log("Required role:", Roles.LEAGUE_OWNER);
  try {
    const { name, game, ratingFormula, description, maxPlayers } = req.body;

    // Validate required fields
    if (!name || !game || !ratingFormula) {
      return res.status(400).json({ message: "Name, game, and rating formula are required" });
    }

    // Check if league with same name exists for this owner
    const existingLeague = await League.findOne({ name, owner: req.user._id });
    if (existingLeague) {
      return res.status(409).json({ message: "You already have a league with this name" });
    }

    // Verify game exists
    const gameExists = await Game.findById(game);
    if (!gameExists) {
      return res.status(404).json({ message: "Game not found" });
    }

    // Verify rating formula exists
    const formulaExists = await RatingFormula.findById(ratingFormula);
    if (!formulaExists) {
      return res.status(404).json({ message: "Rating formula not found" });
    }

    const newLeague = new League({
      name,
      owner: req.user._id,
      game,
      ratingFormula,
      description: description || '',
      maxPlayers: maxPlayers || 64,
      players: [],
      applications: [],
      tournaments: [],
      status: 'active'
    });

    const savedLeague = await newLeague.save();
    
    // Populate before sending response
    await savedLeague.populate('game ratingFormula');
    
    res.json(savedLeague);
  } catch (err) {
    console.error("Error creating league:", err);
    res.status(500).json({ message: "Error creating league", error: err.message });
  }
});

// Update league (League Owner only - must be owner)
app.put("/league/:id", authenticate, authorizeRoles(Roles.LEAGUE_OWNER), async (req, res) => {
  try {
    const league = await League.findById(req.params.id);
    
    if (!league) {
      return res.status(404).json({ message: "League not found" });
    }

    // Check if user is the owner
    if (!league.owner.equals(req.user._id)) {
      return res.status(403).json({ message: "You can only edit your own leagues" });
    }

    const updatedLeague = await League.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('game ratingFormula players');
    
    res.json(updatedLeague);
  } catch (err) {
    console.error("Error updating league:", err);
    res.status(500).json({ message: "Error updating league", error: err.message });
  }
});

// Delete league (League Owner only - must be owner)
app.delete("/league/:id", authenticate, authorizeRoles(Roles.LEAGUE_OWNER), async (req, res) => {
  try {
    const league = await League.findById(req.params.id);
    
    if (!league) {
      return res.status(404).json({ message: "League not found" });
    }

    // Check if user is the owner
    if (!league.owner.equals(req.user._id)) {
      return res.status(403).json({ message: "You can only delete your own leagues" });
    }

    const deletedLeague = await League.findByIdAndDelete(req.params.id);
    res.json({ message: "League deleted successfully", league: deletedLeague });
  } catch (err) {
    console.error("Error deleting league:", err);
    res.status(500).json({ message: "Error deleting league", error: err.message });
  }
});

// Approve player application to league
app.post("/league/:leagueId/approve-application", authenticate, authorizeRoles(Roles.LEAGUE_OWNER), async (req, res) => {
  try {
    const { applicationId } = req.body;
    const league = await League.findById(req.params.leagueId).populate('applications.player');

    if (!league) {
      return res.status(404).json({ message: "League not found" });
    }

    // Check if user is the owner
    if (!league.owner.equals(req.user._id)) {
      return res.status(403).json({ message: "Not your league" });
    }

    const application = league.applications.id(applicationId);
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    // Add player to league
    if (!league.players.includes(application.player._id)) {
      league.players.push(application.player._id);
    }

    // Update application status
    application.status = 'approved';
    application.reviewedAt = new Date();

    await league.save();
    await league.populate('players', 'name email stats');

    res.json({ message: "Player approved into league", league });
  } catch (err) {
    console.error("Error approving application:", err);
    res.status(500).json({ message: "Error approving application", error: err.message });
  }
});

// Reject player application to league
app.post("/league/:leagueId/reject-application", authenticate, authorizeRoles(Roles.LEAGUE_OWNER), async (req, res) => {
  try {
    const { applicationId } = req.body;
    const league = await League.findById(req.params.leagueId);

    if (!league) {
      return res.status(404).json({ message: "League not found" });
    }

    // Check if user is the owner
    if (!league.owner.equals(req.user._id)) {
      return res.status(403).json({ message: "Not your league" });
    }

    const application = league.applications.id(applicationId);
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    // Update application status
    application.status = 'rejected';
    application.reviewedAt = new Date();

    await league.save();

    res.json({ message: "Application rejected", league });
  } catch (err) {
    console.error("Error rejecting application:", err);
    res.status(500).json({ message: "Error rejecting application", error: err.message });
  }
});

// ============================================
// TOURNAMENT ENDPOINTS (for League Owners)
// ============================================

// Get tournaments by league
app.get("/league/:leagueId/tournaments", async (req, res) => {
  try {
    const tournaments = await Tournament.find({ league: req.params.leagueId })
      .populate('players', 'name email stats')
      .populate('winners', 'name email')
      .sort({ createdAt: -1 });
    res.json(tournaments);
  } catch (err) {
    res.status(500).json({ message: "Error fetching tournaments", error: err.message });
  }
});

// Create tournament in league
app.post(
  "/league/:leagueId/tournament",
  authenticate,
  authorizeRoles(Roles.LEAGUE_OWNER),
  async (req, res) => {
    try {
      const { name, style, maxPlayers, startDate, endDate } = req.body;

      const league = await League.findById(req.params.leagueId);
      if (!league) {
        return res.status(404).json({ message: "League not found" });
      }

      if (!league.owner.equals(req.user._id)) {
        return res.status(403).json({ message: "Not your league" });
      }

      const tournament = await Tournament.create({
        name,
        league: league._id,
        style,
        maxPlayers: maxPlayers || 64,
        playStartDate: startDate,
        playEndDate: endDate,
        players: [],
        matches: [],
        winners: [],
        status: "open_for_applications"
      });

      // 🔥 THIS WAS MISSING
      league.tournaments.push(tournament._id);
      await league.save();

      res.status(201).json(tournament);
    } catch (err) {
      console.error("Error creating tournament:", err);
      res.status(500).json({
        message: "Error creating tournament",
        error: err.message
      });
    }
  }
);

// ============================================
// TOURNAMENT ENDPOINTS
// ============================================

// Approve player application to tournament
app.post("/tournament/:id/approve", authenticate, authorizeRoles(Roles.LEAGUE_OWNER), async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id).populate('league');

    if (!tournament) {
      return res.status(404).json({ message: "Tournament not found" });
    }

    if (!tournament.league.owner.equals(req.user._id)) {
      return res.status(403).json({ message: "Not your tournament" });
    }

    tournament.approveApplication(req.body.applicationId);
    await tournament.save();

    res.json({ message: "Player approved into tournament" });
  } catch (err) {
    res.status(500).json({ message: "Error approving application", error: err.message });
  }
});
//Get all Tournaments
app.get('/tournaments', async (req, res) => {
  try {
    const tournaments = await Tournament.find()
      .populate('league', 'name')
      .populate({
        path: 'league',
        populate: { path: 'game', select: 'name type' }
      })
      .populate('players', 'name')
      .sort({ createdAt: -1 });

    res.json(tournaments);
  } catch (err) {
    console.error("Error fetching tournaments:", err);
    res.status(500).json({
      message: "Error fetching tournaments",
      error: err.message
    });
  }
});
// ============================================
// GAME ENDPOINTS (Operator Only)
// ============================================
// Get all games
app.get("/games", async (req, res) => {
  try {
    const games = await Game.find();
    res.json(games);
  } catch (err) {
    res.status(500).json({ message: "Error fetching games", error: err.message });
  }
});

// Get game by id
app.get("/game/:id", async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);
    if (!game) return res.status(404).json({ message: "Game not found" });
    res.json(game);
  } catch (err) {
    res.status(500).json({ message: "Error fetching game", error: err.message });
  }
});

// Create new game
app.post("/game", authenticate, authorizeRoles(Roles.OPERATOR), async (req, res) => {
  try {
    const newGame = new Game(req.body);
    const savedGame = await newGame.save();
    res.json(savedGame);
  } catch (err) {
    res.status(500).json({ message: "Error creating game", error: err.message });
  }
});

// Update game
app.put("/game/:id", authenticate, authorizeRoles(Roles.OPERATOR), async (req, res) => {
  try {
    const updatedGame = await Game.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedGame) return res.status(404).json({ message: "Game not found" });
    res.json(updatedGame);
  } catch (err) {
    res.status(500).json({ message: "Error updating game", error: err.message });
  }
});

// Delete game
app.delete("/game/:id", authenticate, authorizeRoles(Roles.OPERATOR), async (req, res) => {
  try {
    const deletedGame = await Game.findByIdAndDelete(req.params.id);
    if (!deletedGame) return res.status(404).json({ message: "Game not found" });
    res.json({ message: "Game deleted successfully", game: deletedGame });
  } catch (err) {
    res.status(500).json({ message: "Error deleting game", error: err.message });
  }
});

// ============================================
// TOURNAMENT STYLE ENDPOINTS (Operator Only)
// ============================================

// Get all tournament styles (just return the enum values)
app.get("/tournament-styles", async (req, res) => {
  try {
    const styles = ["RoundRobin", "DoubleRoundRobin", "SingleElimination"];
    res.json(styles.map(style => ({
      name: style,
      description: getStyleDescription(style)
    })));
  } catch (err) {
    res.status(500).json({ message: "Error fetching tournament styles", error: err.message });
  }
});

function getStyleDescription(style) {
  switch(style) {
    case "RoundRobin":
      return "Each player plays every other player once";
    case "DoubleRoundRobin":
      return "Each player plays every other player twice (home and away)";
    case "SingleElimination":
      return "Knockout tournament - lose once and you're out";
    default:
      return "";
  }
}

// ============================================
// RATING FORMULA ENDPOINTS (Operator Only)
// ============================================

// Get all rating formulas
app.get("/rating-formulas", async (req, res) => {
  try {
    const formulas = await RatingFormula.find();
    res.json(formulas);
  } catch (err) {
    res.status(500).json({ message: "Error fetching rating formulas", error: err.message });
  }
});

// Get rating formula by id
app.get("/rating-formula/:id", async (req, res) => {
  try {
    const formula = await RatingFormula.findById(req.params.id);
    if (!formula) return res.status(404).json({ message: "Rating formula not found" });
    res.json(formula);
  } catch (err) {
    res.status(500).json({ message: "Error fetching rating formula", error: err.message });
  }
});

// Create new rating formula
app.post("/rating-formula", authenticate, authorizeRoles(Roles.OPERATOR), async (req, res) => {
  try {
    const newFormula = new RatingFormula(req.body);
    const savedFormula = await newFormula.save();
    res.json(savedFormula);
  } catch (err) {
    res.status(500).json({ message: "Error creating rating formula", error: err.message });
  }
});

// Update rating formula
app.put("/rating-formula/:id", authenticate, authorizeRoles(Roles.OPERATOR), async (req, res) => {
  try {
    const updatedFormula = await RatingFormula.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedFormula) return res.status(404).json({ message: "Rating formula not found" });
    res.json(updatedFormula);
  } catch (err) {
    res.status(500).json({ message: "Error updating rating formula", error: err.message });
  }
});

// Delete rating formula
app.delete("/rating-formula/:id", authenticate, authorizeRoles(Roles.OPERATOR), async (req, res) => {
  try {
    const deletedFormula = await RatingFormula.findByIdAndDelete(req.params.id);
    if (!deletedFormula) return res.status(404).json({ message: "Rating formula not found" });
    res.json({ message: "Rating formula deleted successfully", formula: deletedFormula });
  } catch (err) {
    res.status(500).json({ message: "Error deleting rating formula", error: err.message });
  }
});
// ============================================
// PLAYER ENDPOINTS 
// ============================================

// Apply to league (Player only)
app.post("/league/:leagueId/apply", authenticate, authorizeRoles(Roles.PLAYER), async (req, res) => {
  try {
    const league = await League.findById(req.params.leagueId);

    if (!league) {
      return res.status(404).json({ message: "League not found" });
    }

    if (league.status !== 'active') {
      return res.status(400).json({ message: "League is not active" });
    }

    // Check if already a member
    if (league.players.includes(req.user._id)) {
      return res.status(400).json({ message: "You are already a member of this league" });
    }

    // Check if already applied
    const existingApplication = league.applications.find(
      app => app.player.toString() === req.user._id.toString() && app.status === 'pending'
    );

    if (existingApplication) {
      return res.status(400).json({ message: "You already have a pending application" });
    }

    // Check if league is full
    if (league.players.length >= league.maxPlayers) {
      return res.status(400).json({ message: "League is full" });
    }

    // Add application
    league.applications.push({
      player: req.user._id,
      status: 'pending',
      appliedAt: new Date()
    });

    await league.save();

    res.json({ message: "Application submitted successfully" });
  } catch (err) {
    console.error("Error applying to league:", err);
    res.status(500).json({ message: "Error applying to league", error: err.message });
  }
});

// Get player's leagues (leagues they're a member of)
app.get("/player/my-leagues", authenticate, authorizeRoles(Roles.PLAYER), async (req, res) => {
  try {
    const leagues = await League.find({ 
      players: req.user._id,
      status: 'active'
    })
      .populate('owner', 'name email')
      .populate('game', 'name type description')
      .populate('ratingFormula', 'name winnerScore drawScore loserScore')
      .populate('players', 'name email stats')
      .sort({ createdAt: -1 });

    res.json(leagues);
  } catch (err) {
    console.error("Error fetching player leagues:", err);
    res.status(500).json({ message: "Error fetching your leagues", error: err.message });
  }
});

// Get player's applications
app.get("/player/my-applications", authenticate, authorizeRoles(Roles.PLAYER), async (req, res) => {
  try {
    // Find all leagues where user has applications
    const leagues = await League.find({
      'applications.player': req.user._id
    })
      .populate('game', 'name type')
      .populate('owner', 'name')
      .select('name game owner applications');

    // Extract user's applications from each league
    const applications = [];
    leagues.forEach(league => {
      const userApps = league.applications.filter(
        app => app.player.toString() === req.user._id.toString()
      );
      
      userApps.forEach(app => {
        applications.push({
          _id: app._id,
          league: {
            _id: league._id,
            name: league.name,
            game: league.game,
            owner: league.owner
          },
          status: app.status,
          appliedAt: app.appliedAt,
          reviewedAt: app.reviewedAt,
          type: 'league'
        });
      });
    });

    // Sort by most recent
    applications.sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt));

    res.json(applications);
  } catch (err) {
    console.error("Error fetching applications:", err);
    res.status(500).json({ message: "Error fetching applications", error: err.message });
  }
});

// Get player's tournaments
app.get("/player/my-tournaments", authenticate, authorizeRoles(Roles.PLAYER), async (req, res) => {
  try {
    const tournaments = await Tournament.find({
      players: req.user._id
    })
      .populate('league', 'name game')
      .populate({
        path: 'league',
        populate: {
          path: 'game',
          select: 'name type'
        }
      })
      .populate('players', 'name email stats')
      .populate('winners', 'name email')
      .sort({ createdAt: -1 });

    res.json(tournaments);
  } catch (err) {
    console.error("Error fetching player tournaments:", err);
    res.status(500).json({ message: "Error fetching tournaments", error: err.message });
  }
});

// Apply to tournament (Player only)
app.post("/tournament/:tournamentId/apply", authenticate, authorizeRoles(Roles.PLAYER), async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.tournamentId)
      .populate('league');

    if (!tournament) {
      return res.status(404).json({ message: "Tournament not found" });
    }

    if (tournament.status === 'started') {
      return res.status(400).json({ message: "Tournament has already started or finished" });
    }

    // Check if player is in the league
    const league = await League.findById(tournament.league._id);
    if (!league.players.includes(req.user._id)) {
      return res.status(403).json({ message: "You must be a member of the league to join this tournament" });
    }

    // Check if already joined
    if (tournament.players.includes(req.user._id)) {
      return res.status(400).json({ message: "You are already in this tournament" });
    }

    // Check if tournament is full
    if (tournament.players.length >= tournament.maxPlayers) {
      return res.status(400).json({ message: "Tournament is full" });
    }

    // Add player to tournament
    tournament.players.push(req.user._id);
    await tournament.save();

    res.json({ message: "Successfully joined tournament" });
  } catch (err) {
    console.error("Error joining tournament:", err);
    res.status(500).json({ message: "Error joining tournament", error: err.message });
  }
});

// Get available tournaments for player (tournaments in their leagues)
app.get("/player/available-tournaments", authenticate, authorizeRoles(Roles.PLAYER), async (req, res) => {
  try {
    // Get player's leagues
    const playerLeagues = await League.find({
      players: req.user._id,
      status: 'active'
    }).select('_id');

    const leagueIds = playerLeagues.map(l => l._id);

    // Get tournaments from those leagues that player hasn't joined yet
    const tournaments = await Tournament.find({
      league: { $in: leagueIds },
      status: 'open_for_applications',
      players: { $ne: req.user._id } // Not already in
    })
      .populate('league', 'name game')
      .populate({
        path: 'league',
        populate: {
          path: 'game',
          select: 'name type'
        }
      })
      .populate('players', 'name')
      .sort({ startDate: 1 });

    res.json(tournaments);
  } catch (err) {
    console.error("Error fetching available tournaments:", err);
    res.status(500).json({ message: "Error fetching tournaments", error: err.message });
  }
});

// Get player statistics
app.get("/player/stats", authenticate, authorizeRoles(Roles.PLAYER), async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('stats');
    
    // Get additional stats
    const leaguesCount = await League.countDocuments({ 
      players: req.user._id 
    });

    const tournamentsCount = await Tournament.countDocuments({ 
      players: req.user._id 
    });

    const pendingApplications = await League.countDocuments({
      'applications': {
        $elemMatch: {
          player: req.user._id,
          status: 'pending'
        }
      }
    });

    res.json({
      ...user.stats,
      leaguesCount,
      tournamentsCount,
      pendingApplications,
      winRate: user.stats.wins + user.stats.losses > 0 
        ? ((user.stats.wins / (user.stats.wins + user.stats.losses)) * 100).toFixed(1)
        : 0
    });
  } catch (err) {
    console.error("Error fetching player stats:", err);
    res.status(500).json({ message: "Error fetching stats", error: err.message });
  }
});

// Leave league
app.post("/league/:leagueId/leave", authenticate, authorizeRoles(Roles.PLAYER), async (req, res) => {
  try {
    const league = await League.findById(req.params.leagueId);

    if (!league) {
      return res.status(404).json({ message: "League not found" });
    }

    if (!league.players.includes(req.user._id)) {
      return res.status(400).json({ message: "You are not a member of this league" });
    }

    // Remove player from league
    league.players = league.players.filter(
      p => p.toString() !== req.user._id.toString()
    );

    await league.save();

    res.json({ message: "Successfully left the league" });
  } catch (err) {
    console.error("Error leaving league:", err);
    res.status(500).json({ message: "Error leaving league", error: err.message });
  }
});

// Cancel application
app.delete("/league/:leagueId/application/:applicationId", authenticate, authorizeRoles(Roles.PLAYER), async (req, res) => {
  try {
    const league = await League.findById(req.params.leagueId);

    if (!league) {
      return res.status(404).json({ message: "League not found" });
    }

    const application = league.applications.id(req.params.applicationId);

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    if (application.player.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not your application" });
    }

    if (application.status !== 'pending') {
      return res.status(400).json({ message: "Can only cancel pending applications" });
    }

    // Remove application
    league.applications.pull(req.params.applicationId);
    await league.save();

    res.json({ message: "Application cancelled successfully" });
  } catch (err) {
    console.error("Error cancelling application:", err);
    res.status(500).json({ message: "Error cancelling application", error: err.message });
  }
});
// ============================================
// ADVERTISER REGISTRATION & PROFILE
// ============================================

// Register as advertiser (creates User + Advertiser + Account)
app.post("/register-advertiser", async (req, res) => {
  try {
    const { name, email, password, companyName } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ $or: [{ email }, { name }] });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    // Create user
    const user = new User({
      name,
      email,
      password,
      role: 'advertiser',
      status: 'inactive' // Requires operator approval
    });
    await user.save();
 // Create Advertiser profile first
const advertiser = new Advertiser({
  user: user._id,
  companyName,
  leaguesOfInterest: [],
  sponsoredTournaments: []
});
await advertiser.save();

// Create Account with advertiser
const account = new Account({
  advertiser: advertiser._id,
  balance: 0
});
await account.save();

// Update advertiser with account reference
advertiser.account = account._id;
await advertiser.save();

    // Update account with advertiser reference
    account.advertiser = advertiser._id;
    await account.save();

    res.json({ 
      message: "Advertiser registered successfully. Awaiting operator approval.",
      advertiser
    });
  } catch (err) {
    console.error("Error registering advertiser:", err);
    res.status(500).json({ message: "Error registering advertiser", error: err.message });
  }
});

// Get advertiser profile
app.get("/advertiser/profile", authenticate, authorizeRoles(Roles.ADVERTISER), async (req, res) => {
  try {
    const advertiser = await Advertiser.findOne({ user: req.user._id })
      .populate('account')
      .populate('leaguesOfInterest', 'name game')
      .populate({
        path: 'sponsoredTournaments.tournament',
        populate: { path: 'league', select: 'name' }
      });

    if (!advertiser) {
      return res.status(404).json({ message: "Advertiser profile not found" });
    }

    res.json(advertiser);
  } catch (err) {
    res.status(500).json({ message: "Error fetching profile", error: err.message });
  }
});

// Update advertiser profile
app.put("/advertiser/profile", authenticate, authorizeRoles(Roles.ADVERTISER), async (req, res) => {
  try {
    const { companyName, leaguesOfInterest } = req.body;
    
    const advertiser = await Advertiser.findOneAndUpdate(
      { user: req.user._id },
      { companyName, leaguesOfInterest },
      { new: true }
    );
    if (advertiser.status !== 'active') {
  return res.status(403).json({
    message: 'Advertiser account pending operator approval'
  });
}

    res.json(advertiser);
  } catch (err) {
    res.status(500).json({ message: "Error updating profile", error: err.message });
  }
});

// ============================================
// ADVERTISEMENT MANAGEMENT
// ============================================

// Get advertiser's advertisements
app.get("/advertiser/advertisements", authenticate, authorizeRoles(Roles.ADVERTISER), async (req, res) => {
  try {
    const advertiser = await Advertiser.findOne({ user: req.user._id });
    
    const ads = await Advertisement.find({ advertiser: advertiser._id })
      .populate('game', 'name type')
      .sort({ createdAt: -1 });

    res.json(ads);
  } catch (err) {
    res.status(500).json({ message: "Error fetching advertisements", error: err.message });
  }
});

// Create advertisement
app.post("/advertiser/advertisement", authenticate, authorizeRoles(Roles.ADVERTISER), async (req, res) => {
  try {
    const { title, imageUrl, targetUrl, game } = req.body;
    
    const advertiser = await Advertiser.findOne({ user: req.user._id });

    const ad = new Advertisement({
      advertiser: advertiser._id,
      title,
      imageUrl,
      targetUrl,
      game,
      status: 'pending' // Requires operator approval
    });

    await ad.save();
    res.json(ad);
  } catch (err) {
    res.status(500).json({ message: "Error creating advertisement", error: err.message });
  }
});

// Update advertisement
app.put("/advertiser/advertisement/:id", authenticate, authorizeRoles(Roles.ADVERTISER), async (req, res) => {
  try {
    const advertiser = await Advertiser.findOne({ user: req.user._id });
    
    const ad = await Advertisement.findOneAndUpdate(
      { _id: req.params.id, advertiser: advertiser._id },
      req.body,
      { new: true }
    );

    if (!ad) {
      return res.status(404).json({ message: "Advertisement not found" });
    }

    res.json(ad);
  } catch (err) {
    res.status(500).json({ message: "Error updating advertisement", error: err.message });
  }
});

// Delete advertisement
app.delete("/advertiser/advertisement/:id", authenticate, authorizeRoles(Roles.ADVERTISER), async (req, res) => {
  try {
    const advertiser = await Advertiser.findOne({ user: req.user._id });
    
    const ad = await Advertisement.findOneAndDelete({
      _id: req.params.id,
      advertiser: advertiser._id
    });

    if (!ad) {
      return res.status(404).json({ message: "Advertisement not found" });
    }

    res.json({ message: "Advertisement deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting advertisement", error: err.message });
  }
});

// ============================================
// SPONSORSHIP MANAGEMENT
// ============================================

// Get sponsorship requests (for advertiser)
app.get("/advertiser/sponsorship-requests", authenticate, authorizeRoles(Roles.ADVERTISER), async (req, res) => {
  try {
    const advertiser = await Advertiser.findOne({ user: req.user._id })
      .populate({
        path: 'sponsorshipRequests.tournament',
        populate: [
          { path: 'league', select: 'name game' },
          { path: 'league', populate: { path: 'game', select: 'name type' } }
        ]
      })
      .populate('sponsorshipRequests.league', 'name');

    const requests = advertiser.sponsorshipRequests
      .filter(req => req.status === 'pending')
      .sort((a, b) => new Date(b.requestedAt) - new Date(a.requestedAt));

    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: "Error fetching requests", error: err.message });
  }
});

// Respond to sponsorship request
app.post("/advertiser/sponsorship-request/:requestId/respond", authenticate, authorizeRoles(Roles.ADVERTISER), async (req, res) => {
  try {
    const { accept } = req.body; // true or false
    
    const advertiser = await Advertiser.findOne({ user: req.user._id });
    
    const request = advertiser.sponsorshipRequests.id(req.params.requestId);
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    request.status = accept ? 'accepted' : 'declined';
    request.respondedAt = new Date();

    await advertiser.save();

    // Also update tournament's sponsorshipRequests
    const tournament = await Tournament.findById(request.tournament);
    const tournamentRequest = tournament.sponsorshipRequests.find(
      r => r.advertiser.toString() === advertiser._id.toString()
    );
    if (tournamentRequest) {
      tournamentRequest.status = request.status;
      tournamentRequest.respondedAt = new Date();
      await tournament.save();
    }

    res.json({ message: `Sponsorship request ${accept ? 'accepted' : 'declined'}` });
  } catch (err) {
    res.status(500).json({ message: "Error responding to request", error: err.message });
  }
});

// Get sponsored tournaments
app.get("/advertiser/sponsored-tournaments", authenticate, authorizeRoles(Roles.ADVERTISER), async (req, res) => {
  try {
    const advertiser = await Advertiser.findOne({ user: req.user._id })
      .populate({
        path: 'sponsoredTournaments.tournament',
        populate: [
          { path: 'league', select: 'name game' },
          { path: 'league', populate: { path: 'game', select: 'name type' } }
        ]
      });

    res.json(advertiser.sponsoredTournaments);
  } catch (err) {
    res.status(500).json({ message: "Error fetching sponsored tournaments", error: err.message });
  }
});

// ============================================
// ACCOUNT & BILLING
// ============================================

// Get account balance and history
app.get("/advertiser/account", authenticate, authorizeRoles(Roles.ADVERTISER), async (req, res) => {
  try {
    const advertiser = await Advertiser.findOne({ user: req.user._id });
    const account = await Account.findById(advertiser.account)
      .populate('charges.tournament', 'name')
      .sort({ 'charges.timestamp': -1, 'payments.timestamp': -1 });

    res.json(account);
  } catch (err) {
    res.status(500).json({ message: "Error fetching account", error: err.message });
  }
});

// Add payment to account
app.post("/advertiser/account/payment", authenticate, authorizeRoles(Roles.ADVERTISER), async (req, res) => {
  try {
    const { amount, method, transactionId } = req.body;
    
    const advertiser = await Advertiser.findOne({ user: req.user._id });
    const account = await Account.findById(advertiser.account);

    await account.addPayment(amount, method, transactionId);

    res.json({ message: "Payment added successfully", account });
  } catch (err) {
    res.status(500).json({ message: "Error adding payment", error: err.message });
  }
});

// ============================================
// LEAGUE OWNER - UPDATED TOURNAMENT CREATION
// ============================================

// Get advertisers interested in exclusive sponsorships for a league
app.get("/league/:leagueId/interested-advertisers", authenticate, authorizeRoles(Roles.LEAGUE_OWNER), async (req, res) => {
  try {
    const league = await League.findById(req.params.leagueId);
    
    if (!league) {
      return res.status(404).json({ message: "League not found" });
    }

    if (!league.owner.equals(req.user._id)) {
      return res.status(403).json({ message: "Not your league" });
    }

    // Find advertisers who have this league in their interests
    const advertisers = await Advertiser.find({
      leaguesOfInterest: req.params.leagueId,
      status: 'active'
    })
      .populate('user', 'name email')
      .populate('account', 'balance');

    res.json(advertisers);
  } catch (err) {
    res.status(500).json({ message: "Error fetching advertisers", error: err.message });
  }
});

// Request sponsorships from selected advertisers
app.post("/tournament/:tournamentId/request-sponsorships", authenticate, authorizeRoles(Roles.LEAGUE_OWNER), async (req, res) => {
  try {
    const { advertiserIds } = req.body; // Array of advertiser IDs
    
    const tournament = await Tournament.findById(req.params.tournamentId)
      .populate('league');

    if (!tournament) {
      return res.status(404).json({ message: "Tournament not found" });
    }

    if (!tournament.league.owner.equals(req.user._id)) {
      return res.status(403).json({ message: "Not your tournament" });
    }

    // Get arena settings for flat fee
    const arena = await Arena.findOne({ isSingleton: true });
    const flatFee = arena?.exclusiveSponsorshipFee || 500;

    // Add sponsorship requests to tournament
    for (const advertiserId of advertiserIds) {
      tournament.sponsorshipRequests.push({
        advertiser: advertiserId,
        status: 'pending',
        requestedAt: new Date()
      });

      // Also add to advertiser's requests
      const advertiser = await Advertiser.findById(advertiserId);
      advertiser.sponsorshipRequests.push({
        tournament: tournament._id,
        league: tournament.league._id,
        status: 'pending',
        requestedAt: new Date()
      });
      await advertiser.save();
    }

    tournament.status = 'seeking_sponsors';
    await tournament.save();

    // TODO: Send notifications to advertisers

    res.json({ 
      message: "Sponsorship requests sent",
      flatFee,
      tournament
    });
  } catch (err) {
    res.status(500).json({ message: "Error requesting sponsorships", error: err.message });
  }
});

// Get sponsorship responses
app.get("/tournament/:tournamentId/sponsorship-responses", authenticate, authorizeRoles(Roles.LEAGUE_OWNER), async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.tournamentId)
      .populate('league')
      .populate({
        path: 'sponsorshipRequests.advertiser',
        populate: [
          { path: 'user', select: 'name email' },
          { path: 'account', select: 'balance' }
        ]
      });

    if (!tournament.league.owner.equals(req.user._id)) {
      return res.status(403).json({ message: "Not your tournament" });
    }

    res.json(tournament.sponsorshipRequests);
  } catch (err) {
    res.status(500).json({ message: "Error fetching responses", error: err.message });
  }
});

// Select exclusive sponsor
app.post("/tournament/:tournamentId/select-sponsor", authenticate, authorizeRoles(Roles.LEAGUE_OWNER), async (req, res) => {
  try {
    const { advertiserId } = req.body;
    
    const tournament = await Tournament.findById(req.params.tournamentId)
      .populate('league');

    if (!tournament.league.owner.equals(req.user._id)) {
      return res.status(403).json({ message: "Not your tournament" });
    }

    // Get arena settings
    const arena = await Arena.findOne({ isSingleton: true });
    const flatFee = arena?.exclusiveSponsorshipFee || 500;

    // Get advertiser and account
    const advertiser = await Advertiser.findById(advertiserId);
    const account = await Account.findById(advertiser.account);

    // Charge flat fee
    try {
      await account.charge(
        flatFee,
        `Exclusive sponsorship for ${tournament.name}`,
        'exclusiveSponsorship',
        tournament._id
      );
    } catch (err) {
      return res.status(400).json({ message: "Insufficient balance in advertiser account" });
    }

    // Set exclusive sponsor
    tournament.exclusiveSponsor = advertiserId;
    tournament.status = 'open_for_applications';

    // Mark this sponsor request as selected
    const request = tournament.sponsorshipRequests.find(
      r => r.advertiser.toString() === advertiserId.toString()
    );
    if (request) {
      request.status = 'selected';
    }

    await tournament.save();

    // Add to advertiser's sponsored tournaments
    advertiser.sponsoredTournaments.push({
      tournament: tournament._id,
      type: 'exclusive',
      amountPaid: flatFee,
      startDate: tournament.playStartDate,
      endDate: tournament.playEndDate
    });
    await advertiser.save();

    res.json({ message: "Exclusive sponsor selected and charged", tournament });
  } catch (err) {
    console.error("Error selecting sponsor:", err);
    res.status(500).json({ message: "Error selecting sponsor", error: err.message });
  }
});

// Skip exclusive sponsorship (use random ads)
app.post("/tournament/:tournamentId/skip-sponsorship", authenticate, authorizeRoles(Roles.LEAGUE_OWNER), async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.tournamentId)
      .populate('league');

    if (!tournament.league.owner.equals(req.user._id)) {
      return res.status(403).json({ message: "Not your tournament" });
    }

    tournament.exclusiveSponsor = null;
    tournament.status = 'open_for_applications';
    await tournament.save();

    res.json({ message: "Using random advertisements", tournament });
  } catch (err) {
    res.status(500).json({ message: "Error skipping sponsorship", error: err.message });
  }
});

// ============================================
// INTEREST GROUPS
// ============================================

// Get interest groups for notification
app.get("/interest-groups", authenticate, authorizeRoles(Roles.LEAGUE_OWNER, Roles.OPERATOR), async (req, res) => {
  try {
    const groups = await InterestGroup.find()
      .populate('games', 'name')
      .populate('leagues', 'name')
      .sort({ name: 1 });

    res.json(groups);
  } catch (err) {
    res.status(500).json({ message: "Error fetching interest groups", error: err.message });
  }
});

// Notify interest groups about tournament
app.post("/tournament/:tournamentId/notify-groups", authenticate, authorizeRoles(Roles.LEAGUE_OWNER), async (req, res) => {
  try {
    const { groupIds } = req.body; // Array of interest group IDs
    
    const tournament = await Tournament.findById(req.params.tournamentId)
      .populate('league');

    if (!tournament.league.owner.equals(req.user._id)) {
      return res.status(403).json({ message: "Not your tournament" });
    }

    tournament.notifiedGroups = groupIds;
    await tournament.save();

    // TODO: Send actual notifications to group members

    res.json({ message: "Interest groups notified", tournament });
  } catch (err) {
    res.status(500).json({ message: "Error notifying groups", error: err.message });
  }
});

// ============================================
// ARENA SETTINGS (Operator only)
// ============================================

// Get arena settings
app.get("/arena/settings", authenticate, authorizeRoles(Roles.OPERATOR), async (req, res) => {
  try {
    let arena = await Arena.findOne({ isSingleton: true });
    
    // Create default if doesn't exist
    if (!arena) {
      arena = new Arena({ isSingleton: true });
      await arena.save();
    }

    res.json(arena);
  } catch (err) {
    res.status(500).json({ message: "Error fetching arena settings", error: err.message });
  }
});

// Update arena settings
app.put("/arena/settings", authenticate, authorizeRoles(Roles.OPERATOR), async (req, res) => {
  try {
    const arena = await Arena.findOneAndUpdate(
      { isSingleton: true },
      req.body,
      { new: true, upsert: true }
    );

    res.json(arena);
  } catch (err) {
    res.status(500).json({ message: "Error updating arena settings", error: err.message });
  }
});

// ============================================
// START SERVER
// ============================================

app
  .listen(PORT, () => {
    console.log(`Server successfully started on port ${PORT}`);
    console.log(`Access at: http://localhost:${PORT}`);
  })
  .on("error", (err) => {
    console.error("Server failed to start:", err.message);
    if (err.code === "EADDRINUSE") {
      console.error(`Port ${PORT} is already in use`);
    }
  });
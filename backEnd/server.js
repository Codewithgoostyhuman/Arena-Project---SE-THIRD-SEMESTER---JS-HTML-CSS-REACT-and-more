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
// AUTH ENDPOINTS
// ============================================

// Login user
app.post("/login", async (req, res) => {
  try {
    const { name, password } = req.body;
    
    console.log("=== LOGIN ATTEMPT ===");
    console.log("Request body:", req.body);
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

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
    });

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
      .sort({ createdAt: -1 });
    res.json(leagues);
  } catch (err) {
    res.status(500).json({ message: "Error fetching leagues", error: err.message });
  }
});

// Get leagues by owner (league owner's own leagues)
app.get("/leagues/my-leagues", authenticate, authorizeRoles(Roles.LEAGUE_OWNER), async (req, res) => {
  try {
    const leagues = await League.find({ owner: req.user._id })
      .populate('players', 'name email stats')
      .populate('game', 'name type')
      .populate('ratingFormula', 'name winnerScore drawScore loserScore')
      .sort({ createdAt: -1 });
    res.json(leagues);
  } catch (err) {
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
app.post("/league/:leagueId/tournament", authenticate, authorizeRoles(Roles.LEAGUE_OWNER), async (req, res) => {
  try {
    const { name, style, maxPlayers, startDate, endDate } = req.body;
    
    const league = await League.findById(req.params.leagueId);
    if (!league) {
      return res.status(404).json({ message: "League not found" });
    }

    // Check if user is the owner
    if (!league.owner.equals(req.user._id)) {
      return res.status(403).json({ message: "Not your league" });
    }

    const newTournament = new Tournament({
      name,
      league: req.params.leagueId,
      style,
      maxPlayers: maxPlayers || 64,
      startDate,
      endDate,
      players: [],
      matches: [],
      winners: [],
      status: 'upcoming'
    });

    const savedTournament = await newTournament.save();
    res.json(savedTournament);
  } catch (err) {
    console.error("Error creating tournament:", err);
    res.status(500).json({ message: "Error creating tournament", error: err.message });
  }
});

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
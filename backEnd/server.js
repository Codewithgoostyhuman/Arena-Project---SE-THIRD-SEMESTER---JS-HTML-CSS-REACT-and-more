// backend/server.js
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import router from "./routes/index.js";
import dotenv from "dotenv"
import { createServer } from 'http';
import { initializeSocketIO } from './sockets/socketHandler.js';
import { initializeScheduledJobs } from "./jobs/scheduledJobs.js";
import path from "path"
import { fileURLToPath } from "url";
import "./utils/ensureUploadsDir.js"; // Ensure uploads directory exists
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Load environment variables
dotenv.config();

const app = express();

// ==========================================
// MIDDLEWARE
// ==========================================

// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true // Allow cookies to be sent
}));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie parsing middleware (REQUIRED for authentication)
app.use(cookieParser());

// Request logging middleware (development only)
if (process.env.NODE_ENV !== "production") {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// ==========================================
// ROUTES
// ==========================================

// Mount all API routes under /api prefix
app.use("/api", router);
// Serve React frontend
const reactBuildPath = path.join(__dirname, "../client/dist"); // Vite
// const reactBuildPath = path.join(__dirname, "../client/build"); // CRA

app.use(express.static(reactBuildPath));

app.get(/.*/, (req, res) => {
  res.sendFile(path.join(reactBuildPath, "index.html"));
});

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to ARENA API",
    version: "1.0.0",
    endpoints: {
      health: "/api/health",
      auth: "/api/auth",
      users: "/api/users",
      players: "/api/players",
      leagues: "/api/leagues",
      tournaments: "/api/tournaments",
      games: "/api/games"
    }
  });
});

// ==========================================
// ERROR HANDLING MIDDLEWARE
// ==========================================

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  res.status(err.status || 500).json({
    status: "error",
    message: err.message || "Internal server error",
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack })
  });
});

// ==========================================
// DATABASE CONNECTION & SERVER START
// ==========================================

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;
const server = createServer(app);
const io = initializeSocketIO(server);
app.set('io', io);
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected successfully");
    initializeScheduledJobs();
    // Start server after successful DB connection
    server.listen(PORT,"0.0.0.0", () => {
      console.log(`✅ Server with WebSocket running on port ${PORT}`);
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`📍 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`🌐 API available at: http://localhost:${PORT}/api`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("❌ Unhandled Rejection:", err.message);
  // Close server & exit process
  process.exit(1);
});

export default app;
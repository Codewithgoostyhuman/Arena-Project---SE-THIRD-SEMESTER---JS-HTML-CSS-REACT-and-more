import express from "express";
import { authenticate, authorizeRoles, Roles } from "../middleWare/auth.js";
import * as gameController from "../controllers/gameController.js";

const router = express.Router();

// PUBLIC ROUTES
router.get("/", gameController.getAllGames);
router.get("/:id", gameController.getGameById);

// OPERATOR ONLY ROUTES
router.post("/", authenticate, authorizeRoles(Roles.OPERATOR), gameController.createGame);
router.put("/:id", authenticate, authorizeRoles(Roles.OPERATOR), gameController.updateGame);
router.delete("/:id", authenticate, authorizeRoles(Roles.OPERATOR), gameController.deleteGame);

export default router;

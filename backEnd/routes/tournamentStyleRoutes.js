import express from "express";
import { authenticate, authorizeRoles, Roles } from "../middleWare/auth.js";
import * as tournamentStyleController from "../controllers/tournamentStyleController.js";

const router = express.Router();

// PUBLIC ROUTES
router.get("/", tournamentStyleController.getAllTournamentStyles);
router.get("/default", tournamentStyleController.getDefaultTournamentStyle);
router.get("/:id", tournamentStyleController.getTournamentStyle);

// OPERATOR ONLY ROUTES
router.post("/", authenticate, authorizeRoles(Roles.OPERATOR), tournamentStyleController.createTournamentStyle);
router.put("/:id", authenticate, authorizeRoles(Roles.OPERATOR), tournamentStyleController.updateTournamentStyle);
router.delete("/:id", authenticate, authorizeRoles(Roles.OPERATOR), tournamentStyleController.deleteTournamentStyle);

export default router;

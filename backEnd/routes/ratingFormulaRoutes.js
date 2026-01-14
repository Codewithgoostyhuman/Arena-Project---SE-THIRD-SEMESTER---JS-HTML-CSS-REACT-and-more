import express from "express";
import { authenticate, authorizeRoles, Roles } from "../middleware/auth.js";
import * as ratingController from "../controllers/ratingFormulaController.js";

const router = express.Router();

// Create, update, delete → only OPERATOR
router.post("/", authenticate, authorizeRoles(Roles.OPERATOR), ratingController.createRatingFormula);
router.put("/:id", authenticate, authorizeRoles(Roles.OPERATOR), ratingController.updateRatingFormula);
router.delete("/:id", authenticate, authorizeRoles(Roles.OPERATOR), ratingController.deleteRatingFormula);

// Get all / get one / get default → OPERATOR, LEAGUE_OWNER, PLAYER
router.get("/", authenticate, authorizeRoles(Roles.OPERATOR, Roles.LEAGUE_OWNER, Roles.USER), ratingController.getAllRatingFormulas);
router.get("/:id", authenticate, authorizeRoles(Roles.OPERATOR, Roles.LEAGUE_OWNER, Roles.USER), ratingController.getRatingFormula);
router.get("/default", authenticate, authorizeRoles(Roles.OPERATOR, Roles.LEAGUE_OWNER, Roles.USER), ratingController.getDefaultRatingFormula);

export default router;

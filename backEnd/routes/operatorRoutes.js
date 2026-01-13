// backend/routes/operatorRoutes.js
import express from "express";
import { authenticate, authorizeRoles, Roles } from "../middleWare/auth.js";
import * as operatorController from "../controllers/operatorController.js";

const router = express.Router();

// ==================== USER ====================
router.put("/user/:id", authenticate, authorizeRoles(Roles.OPERATOR), operatorController.updateUser);
router.delete("/user/:id", authenticate, authorizeRoles(Roles.OPERATOR), operatorController.deleteUser);
router.patch("/user/activate/:id", authenticate, authorizeRoles(Roles.OPERATOR), operatorController.activateUserById);
router.patch("/user/deactivate/:id", authenticate, authorizeRoles(Roles.OPERATOR), operatorController.deactivateUserById);
router.patch("/user/activate/name/:name", authenticate, authorizeRoles(Roles.OPERATOR), operatorController.activateUserByName);

// ==================== GAME ====================
router.post("/game", authenticate, authorizeRoles(Roles.OPERATOR), operatorController.createGame);
router.put("/game/:id", authenticate, authorizeRoles(Roles.OPERATOR), operatorController.updateGame);
router.delete("/game/:id", authenticate, authorizeRoles(Roles.OPERATOR), operatorController.deleteGame);
router.get("/game/:id", authenticate, authorizeRoles(Roles.OPERATOR), operatorController.getGameById);
router.get("/games", authenticate, authorizeRoles(Roles.OPERATOR), operatorController.getAllGames);

// ==================== RATING FORMULA ====================
router.post("/rating-formula", authenticate, authorizeRoles(Roles.OPERATOR), operatorController.createRatingFormula);
router.put("/rating-formula/:id", authenticate, authorizeRoles(Roles.OPERATOR), operatorController.updateRatingFormula);
router.delete("/rating-formula/:id", authenticate, authorizeRoles(Roles.OPERATOR), operatorController.deleteRatingFormula);
router.get("/rating-formula/:id", authenticate, authorizeRoles(Roles.OPERATOR), operatorController.getRatingFormulaById);
router.get("/rating-formulas", authenticate, authorizeRoles(Roles.OPERATOR), operatorController.getAllRatingFormulas);

// ==================== ADVERTISER ====================
router.patch("/advertiser/approve/:id", authenticate, authorizeRoles(Roles.OPERATOR), operatorController.approveAdvertiser);
router.patch("/advertiser/reject/:id", authenticate, authorizeRoles(Roles.OPERATOR), operatorController.rejectAdvertiser);

export default router;

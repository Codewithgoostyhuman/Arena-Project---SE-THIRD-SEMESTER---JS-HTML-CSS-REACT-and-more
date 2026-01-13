import express from "express";
import * as ArenaController from "../controllers/arenaController.js";
import { authenticate, authorizeRoles, Roles } from "../middleWare/auth.js";

const router = express.Router();

router.get("/", authenticate, ArenaController.getArena);
router.post("/", authenticate, authorizeRoles(Roles.ADMIN), ArenaController.createArena);
router.put("/", authenticate, authorizeRoles(Roles.ADMIN), ArenaController.updateArena);
router.post("/toggle-maintenance", authenticate, authorizeRoles(Roles.ADMIN), ArenaController.toggleMaintenance);

export default router;

import express from "express";
import * as appController from "../controllers/applicationController.js";
import { authenticate, authorizeRoles, Roles } from "../middleware/auth.js";

const router = express.Router();

// PLAYER
router.post("/", authenticate, authorizeRoles(Roles.PLAYER), appController.createApplication);
router.get("/my-applications", authenticate, authorizeRoles(Roles.PLAYER), appController.getApplicationsByPlayer);

// OPERATOR / ADMIN
router.get("/", authenticate, authorizeRoles(Roles.OPERATOR, Roles.ADMIN), appController.getAllApplications);
router.get("/:id", authenticate, authorizeRoles(Roles.OPERATOR, Roles.ADMIN, Roles.PLAYER), appController.getApplication);
router.get("/target/:targetType/:targetId", authenticate, authorizeRoles(Roles.OPERATOR, Roles.ADMIN), appController.getApplicationsByTarget);
router.put("/approve/:id", authenticate, authorizeRoles(Roles.OPERATOR, Roles.ADMIN), appController.approveApplication);
router.put("/reject/:id", authenticate, authorizeRoles(Roles.OPERATOR, Roles.ADMIN), appController.rejectApplication);
router.delete("/:id", authenticate, authorizeRoles(Roles.OPERATOR, Roles.ADMIN), appController.deleteApplication);

export default router;

// routes/advertisementRoutes.js
import express from "express";
import * as advertisementController from "../controllers/advertisementController.js";
import { authenticate, authorizeRoles, Roles } from "../middleware/auth.js";
import multer from "multer";
import path from "path";

// Multer setup for ad image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/ads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  }
});

const router = express.Router();

// =============================
// PUBLIC ENDPOINTS
// =============================

// Get active advertisements for display (public, no auth required)
router.get("/active", advertisementController.getActiveAdsForDisplay);

// Record impression (public endpoint)
router.post("/impression/:id", advertisementController.recordImpression);

// Record click (public endpoint)
router.post("/click/:id", advertisementController.recordClick);

// =============================
// ADVERTISER ENDPOINTS
// =============================

// Create new advertisement (with image upload)
router.post(
  "/",
  authenticate,
  authorizeRoles(Roles.ADVERTISER),
  upload.single("image"),
  advertisementController.createAdvertisement
);

// Get my advertisements
router.get(
  "/me",
  authenticate,
  authorizeRoles(Roles.ADVERTISER),
  advertisementController.getMyAdvertisements
);

// Get my performance report
router.get(
  "/me/report",
  authenticate,
  authorizeRoles(Roles.ADVERTISER),
  advertisementController.getPerformanceReport
);

// Pause my advertisement
router.put(
  "/:id/pause",
  authenticate,
  authorizeRoles(Roles.ADVERTISER),
  advertisementController.pauseAdvertisement
);

// Resume my advertisement
router.put(
  "/:id/resume",
  authenticate,
  authorizeRoles(Roles.ADVERTISER),
  advertisementController.resumeAdvertisement
);

// Update my advertisement
router.put(
  "/:id",
  authenticate,
  authorizeRoles(Roles.ADVERTISER, Roles.OPERATOR),
  advertisementController.updateAdvertisement
);

// =============================
// OPERATOR/ADMIN ENDPOINTS
// =============================

// Get all advertisements (with optional filters)
router.get(
  "/",
  authenticate,
  authorizeRoles(Roles.OPERATOR, Roles.ADMIN),
  advertisementController.getAllAdvertisements
);

// Get advertisement by ID
router.get(
  "/:id",
  authenticate,
  authorizeRoles(Roles.OPERATOR, Roles.ADMIN, Roles.ADVERTISER),
  advertisementController.getAdvertisement
);

// Get advertisement statistics
router.get(
  "/:id/stats",
  authenticate,
  authorizeRoles(Roles.OPERATOR, Roles.ADMIN, Roles.ADVERTISER),
  advertisementController.getAdvertisementStats
);

// Approve advertisement
router.put(
  "/:id/approve",
  authenticate,
  authorizeRoles(Roles.OPERATOR, Roles.ADMIN),
  advertisementController.approveAdvertisement
);

// Reject advertisement
router.put(
  "/:id/reject",
  authenticate,
  authorizeRoles(Roles.OPERATOR, Roles.ADMIN),
  advertisementController.rejectAdvertisement
);

// Delete advertisement
router.delete(
  "/:id",
  authenticate,
  authorizeRoles(Roles.OPERATOR, Roles.ADMIN),
  advertisementController.deleteAdvertisement
);

export default router;
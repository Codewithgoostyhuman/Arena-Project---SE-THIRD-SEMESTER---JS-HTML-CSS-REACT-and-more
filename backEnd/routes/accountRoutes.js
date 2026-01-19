// routes/accountRoutes.js
import express from "express";
import * as accountController from "../controllers/accountController.js";
import { authenticate, authorizeRoles, Roles } from "../middleware/auth.js";

const router = express.Router();

// ==============================
// ACCOUNT ENDPOINTS
// ==============================

// Create account (Advertiser creates their own account)
router.post(
  "/",
  authenticate,
  authorizeRoles(Roles.ADVERTISER),
  accountController.createAccount
);

// Get my account (Advertiser gets their own account)
router.get(
  "/me",
  authenticate,
  authorizeRoles(Roles.ADVERTISER),
  accountController.getMyAccount
);

// Get all accounts (Operator only)
router.get(
  "/",
  authenticate,
  authorizeRoles(Roles.OPERATOR),
  accountController.getAllAccounts
);

// Get specific account by ID (Operator only)
router.get(
  "/:id",
  authenticate,
  authorizeRoles(Roles.OPERATOR),
  accountController.getAccount
);

// Get account balance
router.get(
  "/:id/balance",
  authenticate,
  authorizeRoles(Roles.ADVERTISER, Roles.OPERATOR),
  accountController.getBalance
);

// Get transaction history
router.get(
  "/:id/history",
  authenticate,
  authorizeRoles(Roles.ADVERTISER, Roles.OPERATOR),
  accountController.getTransactionHistory
);

// Add payment (Advertiser can add to their own, Operator can add to any)
router.post(
  "/:id/payment",
  authenticate,
  authorizeRoles(Roles.ADVERTISER, Roles.OPERATOR),
  accountController.addPayment
);

// Charge account (Operator only)
router.post(
  "/:id/charge",
  authenticate,
  authorizeRoles(Roles.OPERATOR),
  accountController.chargeAccount
);

// Update low balance threshold
router.put(
  "/:id/threshold",
  authenticate,
  authorizeRoles(Roles.ADVERTISER, Roles.OPERATOR),
  accountController.updateThreshold
);

// Delete account (Operator only)
router.delete(
  "/:id",
  authenticate,
  authorizeRoles(Roles.OPERATOR),
  accountController.deleteAccount
);

export default router;
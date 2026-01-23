import express from "express";
import SurveyDomain from "../domains/Survey.js";
import { authenticate, authorizeRoles, Roles } from "../middleware/auth.js";

const router = express.Router();

// Submit a survey
router.post("/submit", authenticate, async (req, res) => {
  try {
    const survey = await SurveyDomain.submitSurvey(req.user._id, req.body);
    res.status(201).json(survey);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get my latest survey
router.get("/me", authenticate, async (req, res) => {
  try {
    const survey = await SurveyDomain.getUserSurvey(req.user._id);
    res.json(survey);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin/Advertiser/Operator: Get aggregate interest report
router.get("/report", authenticate, authorizeRoles(Roles.OPERATOR, Roles.ADMIN, Roles.ADVERTISER), async (req, res) => {
  try {
    const report = await SurveyDomain.getInterestReport();
    res.json(report);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;

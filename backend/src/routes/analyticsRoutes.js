// src/routes/analyticsRoutes.js
import express from "express";
import {
  getAdminOverview,
  getVoterTurnout,
  getTopCandidates,
  getVotesPerDay
} from "../controllers/analyticsController.js";

const router = express.Router();

// Dashboard summary
router.get("/overview", getAdminOverview);

// Election turnout
router.get("/voter-turnout/:electionId", getVoterTurnout);

// Top candidates
router.get("/top-candidates/:electionId", getTopCandidates);

// Graph data
router.get("/votes-per-day/:electionId", getVotesPerDay);

export default router;

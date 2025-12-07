import express from "express";
import {
  getVoterTurnout,
  getElectionSummary,
  getCandidateVoteReport,
  getPollReport,
  getFeedbackSummary
} from "../controllers/reportController.js";

const router = express.Router();

// 📊 Reporting APIs
router.get("/voter-turnout/:electionId", getVoterTurnout);
router.get("/election-summary/:electionId", getElectionSummary);
router.get("/candidate-votes/:electionId", getCandidateVoteReport);
router.get("/poll-report/:pollId", getPollReport);
router.get("/feedback-summary/:electionId", getFeedbackSummary);

export default router;

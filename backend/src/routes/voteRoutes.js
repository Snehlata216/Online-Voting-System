import express from "express";
import {
  castElectionVote,
  castPollVote,
  getAllElectionVotes,
  getVotesByElection,
  getVotesByPoll,
  getElectionResults,
  invalidateVote,
} from "../controllers/voteController.js";

const router = express.Router();

// 🗳️ Election Voting APIs
router.post("/elections/:electionId/votes", castElectionVote);   // Cast an election vote
router.get("/elections/votes", getAllElectionVotes);             // Get all election votes
router.get("/elections/:electionId/votes", getVotesByElection);  // Get votes for an election
router.get("/elections/:electionId/results", getElectionResults);// Get election results
router.put("/elections/votes/:voteId/invalidate", invalidateVote);// Invalidate an election vote (admin)

// 📊 Poll Voting APIs
router.post("/polls/:pollId/votes", castPollVote);               // Cast a poll vote
router.get("/polls/:pollId/votes", getVotesByPoll);              // Get votes for a poll

export default router;

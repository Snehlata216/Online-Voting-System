// src/routes/pollRoutes.js
// Wire routes to the Sequelize controller above. Mount at: app.use("/api/polls", pollRoutes)

import express from "express";
import {
  createPoll,
  updatePollPut,
  updatePollPatch,
  voteInPoll,
  getPollResults,
  getAllPolls,
  closePoll,
  reopenPoll,
  deletePoll,
  getPollById,
} from "../controllers/pollController.js";

const router = express.Router();

// List all polls
router.get("/", getAllPolls);

// Create a poll
router.post("/", createPoll);

// Get a poll by ID
router.get("/:pollId", getPollById);

// Update a poll (full replace)
router.put("/:pollId", updatePollPut);

// Update a poll (partial)
router.patch("/:pollId", updatePollPatch);

// Delete a poll
router.delete("/:pollId", deletePoll);

// Close a poll
router.put("/:pollId/close", closePoll);

// Reopen a poll
router.put("/:pollId/reopen", reopenPoll);

// Get poll results
router.get("/:pollId/results", getPollResults);

// Vote in a poll
router.post("/:pollId/vote", voteInPoll);

export default router;

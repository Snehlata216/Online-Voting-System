import express from "express";
import {
  createElection,
  getAllElections,
  getElectionById,
  updateElection,
  deleteElection,
  completeElection,   // ✅ import new controller
} from "../controllers/electionController.js";

const router = express.Router();

/**
 * 🗳️ Election Routes (Base URL: /api/elections)
 */

// Create
router.post("/", createElection);

// Get all
router.get("/", getAllElections);

// Get by ID
router.get("/:id", getElectionById);

// Update
router.put("/:id", updateElection);

// Delete
router.delete("/:id", deleteElection);

// ✅ Mark election as completed
router.put("/:id/complete", completeElection);

export default router;

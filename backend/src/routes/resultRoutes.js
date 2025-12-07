import express from "express";
import { getAllResults, getResultByElection } from "../controllers/resultController.js";

const router = express.Router();

/**
 * 🗳️ Result Routes (Base URL: /api/results)
 */

// Get all results (admin overview)
router.get("/", getAllResults);

// Get results for a specific election
router.get("/:electionId", getResultByElection);

export default router;

import express from "express";
import {
  addCandidate,
  getAllCandidates,
  getCandidateById,
  updateCandidate,
  deleteCandidate,
} from "../controllers/candidateController.js";

const router = express.Router();

// 🟢 Add new candidate
router.post("/", addCandidate);

// 🟣 Get all candidates
router.get("/", getAllCandidates);

// 🟢 Get single candidate by ID
router.get("/:id", getCandidateById);

// 🟡 Update candidate
router.put("/:id", updateCandidate);

// 🔴 Delete candidate
router.delete("/:id", deleteCandidate);

export default router;

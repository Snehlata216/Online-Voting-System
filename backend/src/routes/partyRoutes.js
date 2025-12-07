// src/routes/partyRoutes.js
import express from "express";
import {
  createParty,
  getAllParties,
  getPartyById,
  updateParty,
  deleteParty,
} from "../controllers/partyController.js";

const router = express.Router();

/**
 * 🏛️ Party Routes (Base URL: /api/parties)
 */

// 🟢 Create party
router.post("/", createParty);

// 🟣 Get all parties
router.get("/", getAllParties);

// 🟢 Get single party by ID
router.get("/:id", getPartyById);

// 🟡 Update party
router.put("/:id", updateParty);

// 🔴 Delete party
router.delete("/:id", deleteParty);

export default router;

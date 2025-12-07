// routes/voterRoutes.js
import express from "express";
import {
  registerVoter,
  loginVoter,
  getAllVoters,
  getVoterById,
  updateVoter,
  deleteVoter,
  changePassword   // ✅ import new controller
} from "../controllers/voterController.js";

const router = express.Router();

// Existing routes
router.post("/register", registerVoter);
router.post("/login", loginVoter);
router.get("/", getAllVoters);
router.get("/:id", getVoterById);
router.put("/:id", updateVoter);
router.delete("/:id", deleteVoter);

// ✅ New route for password change
router.post("/change-password", changePassword);

export default router;

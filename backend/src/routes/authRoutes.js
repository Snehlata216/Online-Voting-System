import express from "express";
import { registerVoter, loginVoter, loginAdmin } from "../controllers/authController.js";
const router = express.Router();

router.post("/voter/register", registerVoter);
router.post("/voter/login", loginVoter);
router.post("/admin/login", loginAdmin);

export default router;

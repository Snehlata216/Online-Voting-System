import express from "express";
import { logSecurityEvent, getAllLogs } from "../controllers/securityController.js";

const router = express.Router();

router.post("/log", logSecurityEvent);
router.get("/logs", getAllLogs);

export default router;

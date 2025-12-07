// src/routes/notificationRoutes.js
import express from "express";
import {
  createNotification,
  getAllNotifications,
  getNotificationsByVoter,
  markAsRead,
} from "../controllers/notificationController.js";

const router = express.Router();

router.post("/", createNotification);
router.get("/", getAllNotifications);
router.get("/:voterId", getNotificationsByVoter);
router.put("/:id/read", markAsRead);

export default router;

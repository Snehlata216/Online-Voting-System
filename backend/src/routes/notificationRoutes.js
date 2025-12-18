// src/routes/notificationRoutes.js
import express from "express";
import {
  createNotification,
  getAllNotifications,
  getNotificationsByVoter,
  getUnreadCount,
  markAsRead,
} from "../controllers/notificationController.js";

const router = express.Router();

// Admin: create notification
router.post("/", createNotification);

// Admin: get all notifications
router.get("/", getAllNotifications);

// Voter: get notifications by voterId (includes broadcast)
router.get("/voter/:voterId", getNotificationsByVoter);

// Voter: get unread count for menu badge
router.get("/unread-count/:voterId", getUnreadCount);

// Mark notification as read
router.put("/:id/read", markAsRead);

export default router;

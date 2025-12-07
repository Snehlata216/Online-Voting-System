// src/controllers/notificationController.js
import Notification from "../models/Notification.js";

// Create new notification
export const createNotification = async (req, res) => {
  try {
    const { voterId, title, message } = req.body;
    const notification = await Notification.create({ voterId, title, message });
    res.status(201).json({ success: true, notification });
  } catch (error) {
    console.error("Error creating notification:", error);
    res.status(500).json({ success: false, message: "Error creating notification" });
  }
};

// Get all notifications
export const getAllNotifications = async (req, res) => {
  try {
    const notifications = await Notification.findAll({ order: [["createdAt", "DESC"]] });
    res.json({ success: true, notifications });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ success: false, message: "Error fetching notifications" });
  }
};

// Get notifications by voter
export const getNotificationsByVoter = async (req, res) => {
  try {
    const { voterId } = req.params;
    const notifications = await Notification.findAll({ where: { voterId }, order: [["createdAt", "DESC"]] });
    res.json({ success: true, notifications });
  } catch (error) {
    console.error("Error fetching voter notifications:", error);
    res.status(500).json({ success: false, message: "Error fetching voter notifications" });
  }
};

// Mark notification as read
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findByPk(id);
    if (!notification) return res.status(404).json({ success: false, message: "Notification not found" });

    notification.isRead = true;
    await notification.save();
    res.json({ success: true, notification });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ success: false, message: "Error updating notification" });
  }
};

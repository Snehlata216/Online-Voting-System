// src/controllers/notificationController.js
import Notification from "../models/Notification.js";
import sequelize from "../config/db.js";

// Create new notification (supports broadcast and targeted)
export const createNotification = async (req, res) => {
  try {
    const { title, message, targetVoterIds } = req.body;

    if (!title || !message) {
      return res.status(400).json({ success: false, message: "Title and message are required" });
    }

    // Targeted: insert one row per voter
    if (Array.isArray(targetVoterIds) && targetVoterIds.length > 0) {
      await sequelize.transaction(async (t) => {
        const inserts = targetVoterIds.map((voterId) =>
          Notification.create(
            { voterId: String(voterId), title, message, isRead: false },
            { transaction: t }
          )
        );
        await Promise.all(inserts);
      });

      return res.status(201).json({ success: true, message: "Notifications sent to selected voters" });
    }

    // Broadcast: insert one row with voterId = NULL
    const notification = await Notification.create({ voterId: null, title, message, isRead: false });
    return res.status(201).json({ success: true, notification });
  } catch (error) {
    console.error("Error creating notification:", error);
    res.status(500).json({ success: false, message: "Error creating notification" });
  }
};

// Get all notifications (admin view)
export const getAllNotifications = async (req, res) => {
  try {
    const notifications = await Notification.findAll({ order: [["createdAt", "DESC"]] });
    res.json(notifications); // return plain array for frontend
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ success: false, message: "Error fetching notifications" });
  }
};

// Get notifications by voter (includes broadcast)
export const getNotificationsByVoter = async (req, res) => {
  try {
    const { voterId } = req.params;
    const notifications = await Notification.findAll({
      where: { voterId: [voterId, null] }, // targeted + broadcast
      order: [["createdAt", "DESC"]],
    });
    res.json(notifications);
  } catch (error) {
    console.error("Error fetching voter notifications:", error);
    res.status(500).json({ success: false, message: "Error fetching voter notifications" });
  }
};

// Get unread count for a voter (for menu badge)
export const getUnreadCount = async (req, res) => {
  try {
    const { voterId } = req.params;
    const count = await Notification.count({
      where: {
        voterId: [voterId, null],
        isRead: false,
      },
    });
    res.json({ count });
  } catch (error) {
    console.error("Error fetching unread count:", error);
    res.status(500).json({ success: false, message: "Error fetching unread count" });
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

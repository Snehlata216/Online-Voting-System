import SecurityLog from "../models/SecurityLog.js";

/**
 * 🟢 Log a security event
 * POST /api/security/log
 */
export const logSecurityEvent = async (req, res) => {
  try {
    const { userId, action, ipAddress, status } = req.body;

    if (!userId || !action || !status) {
      return res.status(400).json({ message: "userId, action, and status are required" });
    }

    const log = await SecurityLog.create({
      userId,
      action,
      ipAddress: ipAddress || req.ip,
      status,
      timestamp: new Date(),
    });

    res.status(201).json({ message: "Security event logged successfully", log });
  } catch (error) {
    console.error("Error logging security event:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * 🟣 Fetch all security logs
 * GET /api/security/logs
 */
export const getAllLogs = async (req, res) => {
  try {
    const logs = await SecurityLog.findAll({ order: [["timestamp", "DESC"]] });
    res.json(logs);
  } catch (error) {
    console.error("Error fetching logs:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

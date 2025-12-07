// src/middleware/verifyAdmin.js

export const verifyAdmin = (req, res, next) => {
  try {
    // Here, you can later integrate JWT if needed
    // For now, we'll simulate admin check using a simple flag or role

    const userRole = req.headers["x-user-role"]; // e.g. 'admin' or 'voter'

    if (userRole !== "admin") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    next(); // ✅ Allow access
  } catch (error) {
    console.error("Admin verification failed:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

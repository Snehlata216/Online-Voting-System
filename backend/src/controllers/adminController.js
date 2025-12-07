// src/controllers/adminController.js
import bcrypt from "bcryptjs";
import Admin from "../models/Admin.js";

/**
 * 🟢 Register Admin
 */
export const registerAdmin = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check existing email
    const existing = await Admin.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin
    const admin = await Admin.create({
      name,
      email,
      password: hashedPassword,
      role: role || "Admin",
    });

    res.status(201).json({
      message: "Admin registered successfully",
      admin: {
        adminId: admin.adminId,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error("❌ Error registering admin:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * 🟣 Admin Login (No JWT)
 */
export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Email and password required" });

    const admin = await Admin.findOne({ where: { email } });
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    res.json({
      message: "Login successful",
      admin: {
        adminId: admin.adminId,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error("❌ Error logging in:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * 🟡 Get All Admins
 */
export const getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.findAll({
      attributes: ["adminId", "name", "email", "role", "createdAt"],
    });
    res.json(admins);
  } catch (error) {
    console.error("❌ Error fetching admins:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * 🔴 Delete Admin
 */
export const deleteAdmin = async (req, res) => {
  try {
    const { adminId } = req.params;
    const admin = await Admin.findByPk(adminId);
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    await admin.destroy();
    res.json({ message: "Admin deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting admin:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

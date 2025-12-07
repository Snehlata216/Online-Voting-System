import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { Voter, ElectionAdmin } from "../models/index.js";
dotenv.config();

const signToken = (payload) => jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1d" });

// Voter registration
export const registerVoter = async (req, res) => {
  try {
    const { name, address, email, password, age, gender, citizenship, residency } = req.body;
    if (!email || !password) return res.status(400).json({ message: "email & password required" });

    const hashed = await bcrypt.hash(password, 10);
    const voter = await Voter.create({
      name, address, email, password: hashed, age, gender, citizenship, residency,
      eligibilityStatus: (age >= 18 && citizenship === "Citizen" && residency === "Resident")
    });
    return res.status(201).json({ message: "Voter registered", voterId: voter.voterId });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// Voter login
export const loginVoter = async (req, res) => {
  try {
    const { email, password } = req.body;
    const voter = await Voter.findOne({ where: { email } });
    if (!voter) return res.status(404).json({ message: "Voter not found" });

    const ok = await bcrypt.compare(password, voter.password);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const token = signToken({ userId: voter.voterId, role: "voter" });
    return res.json({ token });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// Admin login (create admin directly or add register admin route)
export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await ElectionAdmin.findOne({ where: { email } });
    if (!admin) return res.status(404).json({ message: "Admin not found" });
    const ok = await bcrypt.compare(password, admin.password || "");
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });
    const token = signToken({ userId: admin.adminId, role: admin.role || "admin" });
    return res.json({ token });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

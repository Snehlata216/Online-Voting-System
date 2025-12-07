import Voter from "../models/Voter.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";

/**
 * 🟢 Register a new voter
 * http://localhost:5000/api/voters/register
 */
export const registerVoter = async (req, res) => {
  try {
    const { name, email, address, password, age, gender, citizenship, residency } = req.body;

    // ✅ Validate required fields
    if (!name || !email || !password || !age || !gender || !citizenship || !residency) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // ✅ Check if voter already exists
    const existingVoter = await Voter.findOne({ where: { email } });
    if (existingVoter) {
      return res.status(400).json({ message: "Email already registered" });
    }
    // ✅ Generate unique voter ID
    const voterId = `VTR-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;

    // ✅ Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Save voter
    const newVoter = await Voter.create({
      voterId,
      name,
      email,
      address,
      password: hashedPassword, // ✅ store hashed password, not plain text
      age,
      gender,
      citizenship,
      residency,
      eligibilityStatus: age >= 18
    });

    res.status(201).json({
      message: "Voter registered successfully",
      voter: {
        voterId: newVoter.voterId,
        name: newVoter.name,
        email: newVoter.email,
        eligibilityStatus: newVoter.eligibilityStatus
      }
    });
  } catch (error) {
    console.error("Error registering voter:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * 🟣 Login voter
 * http://localhost:5000/api/voters/login
 */
export const loginVoter = async (req, res) => {
  try {
    const { email, password } = req.body;

    const voter = await Voter.findOne({ where: { email } });
    if (!voter) return res.status(404).json({ message: "Voter not found" });

    const isPasswordValid = await bcrypt.compare(password, voter.password);
    if (!isPasswordValid) return res.status(401).json({ message: "Invalid credentials" });

    res.json({
      message: "Login successful",
      voter: {
        voterId: voter.voterId,
        name: voter.name,
        email: voter.email
      }
    });
  } catch (error) {
    console.error("Error logging in voter:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * 🟢 Get all voters
 * http://localhost:5000/api/voters
 */
export const getAllVoters = async (req, res) => {
  try {
    const voters = await Voter.findAll();
    res.json(voters);
  } catch (error) {
    console.error("Error fetching voters:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * 🟢 Get a voter by ID
 * http://localhost:5000/api/voters/VTR-NAV-5Q6LUJ
 */
export const getVoterById = async (req, res) => {
  try {
    const voter = await Voter.findByPk(req.params.id);
    if (!voter) return res.status(404).json({ message: "Voter not found" });
    res.json(voter);
  } catch (error) {
    console.error("Error fetching voter:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * 🟡 Update voter details
 * http://localhost:5000/api/voters/1
 */
export const updateVoter = async (req, res) => {
  try {
    const voter = await Voter.findByPk(req.params.id);
    if (!voter) return res.status(404).json({ message: "Voter not found" });

    await voter.update(req.body);
    res.json({ message: "Voter updated successfully", voter });
  } catch (error) {
    console.error("Error updating voter:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * 🔴 Delete voter
 * http://localhost:5000/api/voters/1
 */
export const deleteVoter = async (req, res) => {
  try {
    const voter = await Voter.findByPk(req.params.id);
    if (!voter) return res.status(404).json({ message: "Voter not found" });

    await voter.destroy();
    res.json({ message: "Voter deleted successfully" });
  } catch (error) {
    console.error("Error deleting voter:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
/**
 * 🔑 Change voter password
 * POST http://localhost:5000/api/voters/change-password
 */
export const changePassword = async (req, res) => {
  try {
    const { voterId, oldPassword, newPassword } = req.body;

    if (!voterId || !oldPassword || !newPassword) {
      return res.status(400).json({ message: "voterId, oldPassword and newPassword are required" });
    }

    // Find voter by voterId
    const voter = await Voter.findOne({ where: { voterId } });
    if (!voter) return res.status(404).json({ message: "Voter not found" });

    // Verify old password
    const isMatch = await bcrypt.compare(oldPassword, voter.password);
    if (!isMatch) return res.status(401).json({ message: "Current password is incorrect" });

    // Hash new password
    const hashed = await bcrypt.hash(newPassword, 10);

    // Update password
    await voter.update({ password: hashed });

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
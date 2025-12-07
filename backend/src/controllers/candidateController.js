import Candidate from "../models/Candidate.js";

/**
 * 🟢 Add new candidate
 */
export const addCandidate = async (req, res) => {
  try {
    const { name, electionId, partyId, manifesto } = req.body;

    if (!name || !electionId) {
      return res.status(400).json({ message: "Name and electionId are required" });
    }

    const candidate = await Candidate.create({
      name,
      electionId,
      partyId,
      manifesto,
    });

    res.status(201).json({
      message: "Candidate added successfully",
      candidate,
    });
  } catch (error) {
    console.error("Error adding candidate:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * 🟣 Get all candidates
 */
export const getAllCandidates = async (req, res) => {
  try {
    const candidates = await Candidate.findAll();
    res.json(candidates);
  } catch (error) {
    console.error("Error fetching candidates:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * 🟢 Get candidate by ID
 */
export const getCandidateById = async (req, res) => {
  try {
    const candidate = await Candidate.findByPk(req.params.id);
    if (!candidate) return res.status(404).json({ message: "Candidate not found" });
    res.json(candidate);
  } catch (error) {
    console.error("Error fetching candidate:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * 🟡 Update candidate details
 */
export const updateCandidate = async (req, res) => {
  try {
    const candidate = await Candidate.findByPk(req.params.id);
    if (!candidate) return res.status(404).json({ message: "Candidate not found" });

    await candidate.update(req.body);
    res.json({ message: "Candidate updated successfully", candidate });
  } catch (error) {
    console.error("Error updating candidate:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * 🔴 Delete candidate
 */
export const deleteCandidate = async (req, res) => {
  try {
    const candidate = await Candidate.findByPk(req.params.id);
    if (!candidate) return res.status(404).json({ message: "Candidate not found" });

    await candidate.destroy();
    res.json({ message: "Candidate deleted successfully" });
  } catch (error) {
    console.error("Error deleting candidate:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

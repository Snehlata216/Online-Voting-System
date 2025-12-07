import Election from "../models/Election.js";

/**
 * 🟢 Create a new Election
 */
export const createElection = async (req, res) => {
  try {
    const { title, description, startDate, endDate, electionType, adminId } = req.body;

    if (!title || !startDate || !endDate) {
      return res.status(400).json({ message: "Title, start date, and end date are required." });
    }

    const newElection = await Election.create({
      title,
      description,
      startDate,
      endDate,
      electionType,
      adminId,
      status: "upcoming", // ✅ default status
    });

    res.status(201).json({ message: "Election created successfully", election: newElection });
  } catch (error) {
    console.error("Error creating election:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * 🟣 Get all elections
 */
export const getAllElections = async (req, res) => {
  try {
    const elections = await Election.findAll({ order: [["createdAt", "DESC"]] });
    res.json(elections);
  } catch (error) {
    console.error("Error fetching elections:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * 🟢 Get Election by ID
 */
export const getElectionById = async (req, res) => {
  try {
    const election = await Election.findByPk(req.params.id);
    if (!election) return res.status(404).json({ message: "Election not found" });
    res.json(election);
  } catch (error) {
    console.error("Error fetching election:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * 🟡 Update Election
 */
export const updateElection = async (req, res) => {
  try {
    const election = await Election.findByPk(req.params.id);
    if (!election) return res.status(404).json({ message: "Election not found" });

    await election.update(req.body);
    res.json({ message: "Election updated successfully", election });
  } catch (error) {
    console.error("Error updating election:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * 🔴 Delete Election
 */
export const deleteElection = async (req, res) => {
  try {
    const election = await Election.findByPk(req.params.id);
    if (!election) return res.status(404).json({ message: "Election not found" });

    await election.destroy();
    res.json({ message: "Election deleted successfully" });
  } catch (error) {
    console.error("Error deleting election:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * 🟠 Mark Election as Completed
 */
export const completeElection = async (req, res) => {
  try {
    const election = await Election.findByPk(req.params.id);
    if (!election) return res.status(404).json({ message: "Election not found" });

    await election.update({ status: "completed" });
    res.json({ message: "Election marked as completed", election });
  } catch (error) {
    console.error("Error completing election:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

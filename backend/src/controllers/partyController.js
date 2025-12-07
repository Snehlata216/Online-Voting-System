// src/controllers/partyController.js
import Party from "../models/Party.js";

/**
 * 🟢 Create a new political party
 */
export const createParty = async (req, res) => {
  try {
    const { partyName, symbol, leader, foundedYear, description } = req.body;

    if (!partyName) {
      return res.status(400).json({ message: "Party name is required" });
    }

    const newParty = await Party.create({
      partyName,
      symbol,
      leader,
      foundedYear,
      description,
    });

    res.status(201).json({
      message: "Party created successfully",
      party: newParty,
    });
  } catch (error) {
    console.error("Error creating party:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * 🟣 Get all political parties
 */
export const getAllParties = async (req, res) => {
  try {
    const parties = await Party.findAll();
    res.json(parties);
  } catch (error) {
    console.error("Error fetching parties:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * 🟢 Get a single party by ID
 */
export const getPartyById = async (req, res) => {
  try {
    const party = await Party.findByPk(req.params.id);
    if (!party) {
      return res.status(404).json({ message: "Party not found" });
    }
    res.json(party);
  } catch (error) {
    console.error("Error fetching party:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * 🟡 Update a party
 */
export const updateParty = async (req, res) => {
  try {
    const party = await Party.findByPk(req.params.id);
    if (!party) {
      return res.status(404).json({ message: "Party not found" });
    }

    await party.update(req.body);
    res.json({ message: "Party updated successfully", party });
  } catch (error) {
    console.error("Error updating party:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * 🔴 Delete a party
 */
export const deleteParty = async (req, res) => {
  try {
    const party = await Party.findByPk(req.params.id);
    if (!party) {
      return res.status(404).json({ message: "Party not found" });
    }

    await party.destroy();
    res.json({ message: "Party deleted successfully" });
  } catch (error) {
    console.error("Error deleting party:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

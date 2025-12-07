import { Ballot } from "../models/index.js";

export const generateBallot = async (req, res) => {
  try {
    const { electionId, voterId } = req.body;
    const b = await Ballot.create({ electionId, voterId, status: "not_cast" });
    return res.status(201).json(b);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// src/controllers/voteController.js
import Vote from "../models/Vote.js";          // election votes
import PollVote from "../models/PollVote.js";  // poll votes
import Voter from "../models/Voter.js";
import Candidate from "../models/Candidate.js";
import Election from "../models/Election.js";
import Party from "../models/Party.js";

/**
 * 🟢 Cast an Election Vote
 */
export const castElectionVote = async (req, res) => {
  try {
    const { voterId, candidateId, electionId } = req.body;

    if (!voterId || !candidateId || !electionId) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // ✅ Check voter exists
    const voter = await Voter.findOne({ where: { voterId } });
    if (!voter) return res.status(404).json({ message: "Voter not found" });

    // ✅ Check election exists
    const election = await Election.findByPk(electionId);
    if (!election) return res.status(404).json({ message: "Election not found" });

    // ✅ Check candidate belongs to the same election
    const candidate = await Candidate.findByPk(candidateId);
    if (!candidate || candidate.electionId !== electionId) {
      return res.status(400).json({ message: "Candidate does not belong to this election" });
    }

    // ✅ Prevent duplicate voting
    const existingVote = await Vote.findOne({ where: { voterId, electionId } });
    if (existingVote) {
      return res.status(400).json({ message: "Voter has already cast a vote in this election" });
    }

    // ✅ Record vote
    await Vote.create({ voterId, candidateId, electionId });

    // ✅ Increment candidate’s totalVotes count
    candidate.totalVotes += 1;
    await candidate.save();

    res.status(201).json({ message: "Election vote cast successfully" });
  } catch (error) {
    console.error("❌ Error casting election vote:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * 🟣 Cast a Poll Vote
 */
export const castPollVote = async (req, res) => {
  try {
    const { pollId } = req.params;
    const { voterId, choice } = req.body;

    if (!voterId || !choice) {
      return res.status(400).json({ message: "voterId and choice are required" });
    }

    // ✅ Check voter exists
    const voter = await Voter.findOne({ where: { voterId } });
    if (!voter) return res.status(404).json({ message: "Voter not found" });

    // ✅ Prevent duplicate voting in same poll
    const existingVote = await PollVote.findOne({ where: { voterId, pollId } });
    if (existingVote) {
      return res.status(400).json({ message: "Voter has already cast a vote in this poll" });
    }

    // ✅ Record poll vote
    await PollVote.create({ voterId, pollId, choice });

    res.status(201).json({ message: "Poll vote cast successfully" });
  } catch (error) {
    console.error("❌ Error casting poll vote:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * 🟡 Get all election votes
 */
export const getAllElectionVotes = async (req, res) => {
  try {
    const votes = await Vote.findAll();
    res.json(votes);
  } catch (error) {
    console.error("❌ Error fetching election votes:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * 🟡 Get votes by election
 */
export const getVotesByElection = async (req, res) => {
  try {
    const { electionId } = req.params;
    const votes = await Vote.findAll({ where: { electionId } });
    res.json(votes);
  } catch (error) {
    console.error("❌ Error fetching election votes:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * 🟡 Get poll votes by poll
 */
export const getVotesByPoll = async (req, res) => {
  try {
    const { pollId } = req.params;
    const votes = await PollVote.findAll({ where: { pollId } });
    res.json(votes);
  } catch (error) {
    console.error("❌ Error fetching poll votes:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * 🏁 Get Election Results
 */
export const getElectionResults = async (req, res) => {
  try {
    const { electionId } = req.params;

    if (!electionId) {
      return res.status(400).json({ message: "Election ID is required" });
    }

    const election = await Election.findByPk(electionId);
    if (!election) {
      return res.status(404).json({ message: "Election not found" });
    }

    // ✅ Include alias "party"
    const candidates = await Candidate.findAll({
      where: { electionId },
      include: [
        {
          model: Party,
          as: "party", // must match association alias
          attributes: ["partyId", "partyName", "symbol"],
        },
      ],
      attributes: ["candidateId", "name", "totalVotes"],
      order: [["totalVotes", "DESC"]],
    });

    if (!candidates.length) {
      return res.status(404).json({ message: "No candidates found for this election" });
    }

    const results = candidates.map((c) => ({
      candidateId: c.candidateId,
      name: c.name,
      party: c.party ? c.party.partyName : "Independent",
      symbol: c.party ? c.party.symbol : null,
      totalVotes: c.totalVotes,
    }));

    res.json({
      election: election.title,
      totalCandidates: results.length,
      results,
    });
  } catch (error) {
    console.error("❌ Error fetching election results:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * 🔴 Invalidate an Election Vote (Admin Only)
 */
export const invalidateVote = async (req, res) => {
  try {
    const { voteId } = req.params;
    const vote = await Vote.findByPk(voteId);
    if (!vote) return res.status(404).json({ message: "Vote not found" });

    vote.status = "invalid";
    await vote.save();

    res.json({ message: "Vote invalidated successfully" });
  } catch (error) {
    console.error("❌ Error invalidating vote:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

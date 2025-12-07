// src/controllers/analyticsController.js
import Voter from "../models/Voter.js";
import Candidate from "../models/Candidate.js";
import Election from "../models/Election.js";
import Vote from "../models/Vote.js";
import Feedback from "../models/Feedback.js";
import Notification from "../models/Notification.js";

// 📌 1. ADMIN DASHBOARD OVERVIEW
export const getAdminOverview = async (req, res) => {
  try {
    const totalVoters = await Voter.count();
    const totalElections = await Election.count();
    const totalCandidates = await Candidate.count();
    const totalVotes = await Vote.count();
    const totalFeedbacks = await Feedback.count();
    const totalNotifications = await Notification.count();

    res.json({
      totalVoters,
      totalElections,
      totalCandidates,
      totalVotes,
      totalFeedbacks,
      totalNotifications
    });
  } catch (error) {
    console.error("Error fetching admin overview:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// 📌 2. VOTER TURNOUT FOR SPECIFIC ELECTION
export const getVoterTurnout = async (req, res) => {
  try {
    const { electionId } = req.params;

    const election = await Election.findByPk(electionId);
    if (!election) {
      return res.status(404).json({ message: "Election not found" });
    }

    const totalVotes = await Vote.count({ where: { electionId, status: "valid" } });
    const totalVoters = await Voter.count();

    const turnoutPercentage = ((totalVotes / totalVoters) * 100).toFixed(2);

    res.json({
      electionId,
      electionTitle: election.title,
      totalVotes,
      totalVoters,
      turnoutPercentage: turnoutPercentage + "%"
    });
  } catch (error) {
    console.error("Error calculating turnout:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// 📌 3. TOP CANDIDATES (BASED ON VOTES)
export const getTopCandidates = async (req, res) => {
  try {
    const { electionId } = req.params;

    const candidates = await Candidate.findAll({ where: { electionId } });

    const results = [];

    for (const c of candidates) {
      const votes = await Vote.count({
        where: { candidateId: c.candidateId, status: "valid" }
      });

      results.push({
        candidateId: c.candidateId,
        name: c.name,
        partyId: c.partyId,
        votes
      });
    }

    results.sort((a, b) => b.votes - a.votes);

    res.json({ electionId, topCandidates: results });
  } catch (error) {
    console.error("Error fetching top candidates:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// 📌 4. VOTES PER DAY (Graph Data) — FIXED (uses voteTime)
export const getVotesPerDay = async (req, res) => {
  try {
    const { electionId } = req.params;

    const votes = await Vote.findAll({
      where: { electionId, status: "valid" },
      attributes: ["voteTime"] // ✔ replaced createdAt → voteTime
    });

    const dailyCount = {};

    votes.forEach((vote) => {
      const day = new Date(vote.voteTime).toISOString().split("T")[0];
      dailyCount[day] = (dailyCount[day] || 0) + 1;
    });

    res.json(dailyCount);
  } catch (error) {
    console.error("Error fetching daily votes:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

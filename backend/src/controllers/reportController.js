import Vote from "../models/Vote.js";
import Voter from "../models/Voter.js";
import Candidate from "../models/Candidate.js";
import Election from "../models/Election.js";
import Poll from "../models/Poll.js";
import Feedback from "../models/Feedback.js";

/**
 * 🧮 1. Voter Turnout Report
 */
export const getVoterTurnout = async (req, res) => {
  try {
    const { electionId } = req.params;

    const totalVoters = await Voter.count();
    const totalVotes = await Vote.count({ where: { electionId } });

    const turnout = totalVoters > 0
      ? ((totalVotes / totalVoters) * 100).toFixed(2)
      : "0.00";

    res.json({
      electionId,
      totalVoters,
      totalVotes,
      turnoutPercentage: turnout + "%"
    });

  } catch (error) {
    console.error("Error generating turnout report:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


/**
 * 🗳️ 2. Election Summary Report
 */
export const getElectionSummary = async (req, res) => {
  try {
    const { electionId } = req.params;

    const election = await Election.findByPk(electionId);
    const totalVotes = await Vote.count({ where: { electionId } });

    res.json({
      election,
      totalVotes
    });

  } catch (error) {
    console.error("Error generating election summary:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


/**
 * 🧾 3. Candidate Votes Report
 */
export const getCandidateVoteReport = async (req, res) => {
  try {
    const { electionId } = req.params;

    const candidates = await Candidate.findAll({
      where: { electionId },
      attributes: ["candidateId", "name", "totalVotes"]
    });

    res.json({
      electionId,
      candidates
    });

  } catch (error) {
    console.error("Error fetching candidate vote report:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


/**
 * 📊 4. Poll Report
 */
export const getPollReport = async (req, res) => {
  try {
    const { pollId } = req.params;

    const poll = await Poll.findByPk(pollId);
    if (!poll) return res.status(404).json({ message: "Poll not found" });

    const totalVotes = poll.totalVotes;
    const options = poll.options.map(o => ({
      text: o.text,
      votes: o.votes,
      percentage: totalVotes > 0 ? ((o.votes / totalVotes) * 100).toFixed(2) : "0.00"
    }));

    res.json({
      pollId,
      question: poll.question,
      totalVotes,
      results: options
    });

  } catch (error) {
    console.error("Error generating poll report:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


/**
 * 📝 5. Feedback Summary Report
 */
export const getFeedbackSummary = async (req, res) => {
  try {
    const { electionId } = req.params;

    const feedback = await Feedback.findAll();

    const averageRating = feedback.length > 0
      ? (feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length).toFixed(2)
      : "0.00";

    res.json({
      electionId,
      totalFeedbacks: feedback.length,
      averageRating,
      feedback
    });

  } catch (error) {
    console.error("Error fetching feedback summary:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

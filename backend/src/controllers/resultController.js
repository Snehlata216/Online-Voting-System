import Election from "../models/Election.js";
import Candidate from "../models/Candidate.js";
import Vote from "../models/Vote.js";

/**
 * 🟣 Get all Results (overview for admin)
 */
export const getAllResults = async (req, res) => {
  try {
    const elections = await Election.findAll({ where: { status: "completed" } });

    const results = [];
    for (const election of elections) {
      const candidates = await Candidate.findAll({ where: { electionId: election.electionId } });

      const candidateResults = await Promise.all(
        candidates.map(async (c) => {
          const votes = await Vote.count({ where: { candidateId: c.candidateId } });
          return {
            candidateId: c.candidateId,
            candidateName: c.name,
            party: c.party,
            voteCount: votes,
          };
        })
      );

      candidateResults.sort((a, b) => b.voteCount - a.voteCount);
      if (candidateResults.length > 0) candidateResults[0].isWinner = true;

      results.push({
        electionId: election.electionId,
        title: election.title,
        candidates: candidateResults,
      });
    }

    res.status(200).json(results);
  } catch (error) {
    console.error("❌ Error fetching results:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

/**
 * 🟡 Get result by electionId
 */
export const getResultByElection = async (req, res) => {
  try {
    const { electionId } = req.params;
    const election = await Election.findByPk(electionId);
    if (!election) return res.status(404).json({ message: "Election not found" });

    const candidates = await Candidate.findAll({ where: { electionId } });

    const candidateResults = await Promise.all(
      candidates.map(async (c) => {
        const votes = await Vote.count({ where: { candidateId: c.candidateId } });
        return {
          candidateId: c.candidateId,
          candidateName: c.name,
          party: c.party,
          voteCount: votes,
        };
      })
    );

    candidateResults.sort((a, b) => b.voteCount - a.voteCount);
    if (candidateResults.length > 0) candidateResults[0].isWinner = true;

    res.status(200).json(candidateResults);
  } catch (error) {
    console.error("❌ Error fetching result:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

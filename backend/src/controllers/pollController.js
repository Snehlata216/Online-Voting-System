// src/controllers/pollController.js
// Sequelize-based poll controller using Poll and PollVote models.
// Adds missing update endpoints and keeps existing behaviors intact.

import Poll from "../models/Poll.js";
import PollVote from "../models/PollVote.js";

// Normalize options into [{ text, votes }]
function normalizeOptions(options) {
  if (!Array.isArray(options)) return [];
  return options.map((opt) =>
    typeof opt === "string"
      ? { text: opt, votes: 0 }
      : { text: opt.text ?? "", votes: opt.votes ?? 0 }
  );
}

/**
 * ✅ Create a new poll
 */
export const createPoll = async (req, res) => {
  try {
    const { question, options, expiresAt } = req.body;

    if (!question || !options || !Array.isArray(options) || options.length < 2) {
      return res.status(400).json({ message: "Question and at least 2 options are required." });
    }

    const formattedOptions = normalizeOptions(options);

    const poll = await Poll.create({
      question: String(question).trim(),
      options: formattedOptions,
      totalVotes: 0,
      isActive: true,
      expiresAt: expiresAt || null,
    });

    res.status(201).json({ message: "Poll created successfully", poll });
  } catch (error) {
    console.error("Error creating poll:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * ✏️ Update poll (full replace) — PUT /api/polls/:pollId
 */
export const updatePollPut = async (req, res) => {
  try {
    const { pollId } = req.params;
    const { question, options, isActive, expiresAt } = req.body;

    if (!question || !options || !Array.isArray(options) || options.length < 2) {
      return res.status(400).json({ message: "Question and at least 2 options are required." });
    }

    const poll = await Poll.findByPk(pollId);
    if (!poll) return res.status(404).json({ message: "Poll not found" });

    const formattedOptions = normalizeOptions(options);

    poll.question = String(question).trim();
    poll.options = formattedOptions;
    poll.isActive = typeof isActive === "boolean" ? isActive : poll.isActive;
    poll.expiresAt = expiresAt || null;

    // totalVotes can be recomputed if options changed significantly; keeping as-is
    await poll.save();

    res.json({ message: "Poll updated successfully", poll });
  } catch (error) {
    console.error("Error updating poll (PUT):", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * ✂️ Update poll (partial) — PATCH /api/polls/:pollId
 */
export const updatePollPatch = async (req, res) => {
  try {
    const { pollId } = req.params;
    const poll = await Poll.findByPk(pollId);
    if (!poll) return res.status(404).json({ message: "Poll not found" });

    const patch = {};

    if (req.body.question !== undefined) {
      patch.question = String(req.body.question).trim();
    }
    if (req.body.options !== undefined) {
      const opts = normalizeOptions(req.body.options);
      if (opts.length < 2) {
        return res.status(400).json({ message: "At least 2 options are required." });
      }
      patch.options = opts;
    }
    if (req.body.isActive !== undefined) {
      patch.isActive = Boolean(req.body.isActive);
    }
    if (req.body.expiresAt !== undefined) {
      patch.expiresAt = req.body.expiresAt || null;
    }

    // Apply patch
    Object.assign(poll, patch);
    await poll.save();

    res.json({ message: "Poll updated successfully", poll });
  } catch (error) {
    console.error("Error updating poll (PATCH):", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * 🗳️ Vote in a poll
 */
export const voteInPoll = async (req, res) => {
  try {
    const { pollId } = req.params;
    const { voterId, option } = req.body;

    if (!voterId || !option) {
      return res.status(400).json({ error: "Missing voterId or option" });
    }

    const poll = await Poll.findByPk(pollId);
    if (!poll) return res.status(404).json({ error: "Poll not found" });

    if (!poll.isActive) return res.status(400).json({ error: "Poll is closed" });
    if (poll.expiresAt && new Date(poll.expiresAt) < new Date()) {
      return res.status(400).json({ error: "Poll has expired" });
    }

    // Ensure option exists
    const optionExists = Array.isArray(poll.options) && poll.options.some((opt) => opt.text === option);
    if (!optionExists) {
      return res.status(400).json({ error: "Invalid option selected" });
    }

    // Prevent duplicate votes
    const existingVote = await PollVote.findOne({ where: { pollId, voterId } });
    if (existingVote) {
      return res.status(400).json({ error: "You have already voted" });
    }

    // Save vote record
    await PollVote.create({ pollId, voterId, choice: option, timestamp: new Date() });

    // Update poll option counts
    const updatedOptions = poll.options.map((opt) =>
      opt.text === option ? { ...opt, votes: (opt.votes || 0) + 1 } : opt
    );
    poll.options = updatedOptions;
    poll.totalVotes = (poll.totalVotes || 0) + 1;

    await poll.save();

    res.json({ message: "Vote recorded successfully", poll });
  } catch (err) {
    console.error("Error voting:", err);
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * 📊 Get poll results with percentages
 */
export const getPollResults = async (req, res) => {
  try {
    const { pollId } = req.params;
    const poll = await Poll.findByPk(pollId);
    if (!poll) return res.status(404).json({ message: "Poll not found" });

    const totalVotes = poll.totalVotes || 0;
    const options = (poll.options || []).map((opt) => ({
      text: opt.text,
      votes: opt.votes,
      percentage: totalVotes > 0 ? ((opt.votes / totalVotes) * 100).toFixed(2) : "0.00",
    }));

    res.json({
      pollId: poll.pollId,
      question: poll.question,
      totalVotes,
      isActive: poll.isActive,
      options,
      expiresAt: poll.expiresAt,
    });
  } catch (error) {
    console.error("Error fetching poll results:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * 🧾 Get all polls
 */
export const getAllPolls = async (req, res) => {
  try {
    const polls = await Poll.findAll();
    res.json(polls);
  } catch (error) {
    console.error("Error fetching polls:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * 🔒 Close poll (Admin only)
 */
export const closePoll = async (req, res) => {
  try {
    const { pollId } = req.params;
    const poll = await Poll.findByPk(pollId);
    if (!poll) return res.status(404).json({ message: "Poll not found" });

    if (!poll.isActive) {
      return res.status(400).json({ message: "Poll is already closed." });
    }

    poll.isActive = false;
    await poll.save();

    res.json({ message: "Poll closed successfully", poll });
  } catch (error) {
    console.error("Error closing poll:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * 🔓 Reopen poll (Admin)
 */
export const reopenPoll = async (req, res) => {
  try {
    const { pollId } = req.params;
    const poll = await Poll.findByPk(pollId);
    if (!poll) return res.status(404).json({ message: "Poll not found" });

    poll.isActive = true;
    await poll.save();

    res.json({ message: "Poll reopened successfully", poll });
  } catch (error) {
    console.error("Error reopening poll:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * 🗑️ Delete poll
 */
export const deletePoll = async (req, res) => {
  try {
    const { pollId } = req.params;
    const count = await Poll.destroy({ where: { pollId } });
    if (count === 0) return res.status(404).json({ message: "Poll not found" });
    res.json({ message: `Poll ${pollId} deleted successfully` });
  } catch (err) {
    console.error("Delete poll error:", err);
    res.status(500).json({ error: "Failed to delete poll" });
  }
};

/**
 * 🔍 Get poll by ID
 */
export const getPollById = async (req, res) => {
  try {
    const { pollId } = req.params;
    const poll = await Poll.findByPk(pollId);
    if (!poll) return res.status(404).json({ error: "Poll not found" });

    res.json({
      pollId: poll.pollId,
      question: poll.question,
      options: poll.options,
      totalVotes: poll.totalVotes,
      isActive: poll.isActive,
      expiresAt: poll.expiresAt,
    });
  } catch (err) {
    console.error("Error fetching poll:", err);
    res.status(500).json({ error: "Server error" });
  }
};

import Feedback from "../models/Feedback.js";
import Candidate from "../models/Candidate.js";

// ➕ Add Feedback
export const createFeedback = async (req, res) => {
  try {
    const { comments, rating, voterId, candidateId } = req.body;
    const feedback = await Feedback.create({ comments, rating, voterId, candidateId });
    res.status(201).json({ message: "Feedback submitted successfully", feedback });
  } catch (error) {
    console.error("❌ Error creating feedback:", error);
    res.status(500).json({ error: "Failed to create feedback" });
  }
};

// 📋 Get All Feedbacks
export const getAllFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.findAll({
      include: [{ model: Candidate, as: "candidate", attributes: ["candidateId", "name"] }],
    });
    res.status(200).json(feedbacks);
  } catch (error) {
    console.error("❌ Error fetching feedbacks:", error);
    res.status(500).json({ error: "Failed to fetch feedbacks" });
  }
};

// 🔍 Get Feedback by Candidate
export const getFeedbackByCandidate = async (req, res) => {
  try {
    const { candidateId } = req.params;
    const feedbacks = await Feedback.findAll({
      where: { candidateId },
    });
    res.status(200).json(feedbacks);
  } catch (error) {
    console.error("❌ Error fetching feedback by candidate:", error);
    res.status(500).json({ error: "Failed to fetch feedback" });
  }
};

// 🗑️ Delete Feedback
export const deleteFeedback = async (req, res) => {
  try {
    const { feedbackId } = req.params;
    const deleted = await Feedback.destroy({ where: { feedbackId } });
    if (!deleted) return res.status(404).json({ message: "Feedback not found" });
    res.status(200).json({ message: "Feedback deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting feedback:", error);
    res.status(500).json({ error: "Failed to delete feedback" });
  }
};

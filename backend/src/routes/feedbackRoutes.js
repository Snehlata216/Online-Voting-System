import express from "express";
import {
  createFeedback,
  getAllFeedbacks,
  getFeedbackByCandidate,
  deleteFeedback,
} from "../controllers/feedbackController.js";

const router = express.Router();
// POST /api/feedbacks
router.post("/", createFeedback);

// GET /api/feedbacks
router.get("/", getAllFeedbacks);

// GET /api/feedbacks/candidate/:candidateId
router.get("/candidate/:candidateId", getFeedbackByCandidate);
// Delete/api/:feedbackId
router.delete("/:feedbackId", deleteFeedback);
export default router;




